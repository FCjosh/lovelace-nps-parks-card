/**
 * NPS Parks Card — custom Lovelace card for tracking National Park Service
 * visits in Home Assistant.
 *
 * Renders an SVG map (mainland US, Alaska, Hawaii, Puerto Rico/USVI,
 * Guam/N. Mariana Islands, American Samoa) using D3's composite Albers
 * projection, plotting each tracked park as a marker colored by
 * visited/unvisited state. No Leaflet or tile server — boundary data comes
 * from a single us-atlas TopoJSON fetch, and everything is drawn as vector
 * paths. Clicking a marker opens a detail popup; a slide-in panel lists and
 * searches all tracked parks.
 *
 * Expects one entity per park, with `park_code`, `latitude`, and
 * `longitude` attributes, in state `visited` or `unvisited`. Visit/unvisit
 * actions call the `nps_parks.mark_visited` / `nps_parks.mark_unvisited`
 * services.
 *
 * This is the source file — it's bundled by esbuild into dist/nps-parks-card.js,
 * which is what actually ships. See package.json ("build" script) and the
 * README's Development section. Don't edit dist/ directly; it's generated.
 */

import { select } from 'd3-selection';
import { geoPath } from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import { geoAlbersUsaTerritories } from 'geo-albers-usa-territories';

// us-atlas's state/territory boundary TopoJSON is ~250KB — deliberately
// NOT imported/bundled here. It's static geographic data that never needs
// code-level version tracking, and fetching it lazily at runtime (once per
// page load, cached by the browser) keeps dist/nps-parks-card.js itself
// small and fast to load as a dashboard resource.
const US_ATLAS_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

// geoAlbersUsaTerritories() shares d3.geoAlbersUsa()'s default
// scale(1070)/translate([480,250]), both tuned for this 960×600 stage.
const SVG_W = 960, SVG_H = 600;

// ── Card ─────────────────────────────────────────────────────────────────────

class NPSParksCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._hass = null;
        this._config = {};
        this._projection = null;   // geoAlbersUsaTerritories composite projection
        this._markers = {};        // park_code → { type: 'circle'|'icon', el }
        this._initialized = false;
        this._panelOpen = false;
        this._search = '';
    }

    static getStubConfig() { return {}; }

    setConfig(config) {
        // Backward compat: marker_radius (original option) and marker_size
        // (single shared diameter) both still work as a default for both
        // states, overridden by visited_marker_size/unvisited_marker_size
        // if those are present in config.
        const legacyRadius = config.marker_radius;
        const legacySize = config.marker_size;
        const defaultSize = legacyRadius ? legacyRadius * 2 : (legacySize || 12);
        this._config = {
            visited_color: '#2D6A4F',
            unvisited_color: '#9a9a9a',
            visited_opacity: 1.0,
            unvisited_opacity: 0.75,
            visited_marker_size: defaultSize,
            unvisited_marker_size: defaultSize,
            visited_icon: null,    // e.g. 'mdi:pine-tree' — null = plain dot
            unvisited_icon: null,  // e.g. 'mdi:circle-outline' — null = plain dot
            background_color: '#c9d8e8',
            show_background: true,
            ...config,
        };
        if (this._initialized) this._applyConfig();
    }

    set hass(hass) {
        this._hass = hass;
        if (this._initialized) this._updateMarkers();
    }

    connectedCallback() {
        if (!this._initialized) this._init();
    }

    disconnectedCallback() {
        this._projection = null;
        this._markers = {};
        this._initialized = false;
        this._panelOpen = false;
        this.shadowRoot.innerHTML = '';
    }

    async _init() {
        const topoData = await fetch(US_ATLAS_URL).then(r => r.json());

        this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: relative;
          border-radius: var(--ha-card-border-radius, 12px);
          box-shadow: var(--nps-card-shadow, var(--ha-card-box-shadow, 0 2px 2px rgba(0,0,0,.14),0 1px 5px rgba(0,0,0,.12)));
          overflow: hidden;
          background: var(--nps-ocean-color, #c9d8e8);
          font-family: sans-serif;
        }
        #map-wrap {
          width: 100%;
          aspect-ratio: ${SVG_W} / ${SVG_H};
          position: relative;
          overflow: hidden;
        }
        #us-map {
          width: 100%;
          height: 100%;
          display: block;
        }
        .state {
          fill: #ede9dc;
          stroke: #fff;
          stroke-width: 0.6;
        }
        .nation-border {
          fill: none;
          stroke: #c0b898;
          stroke-width: 1.4;
        }
        .territory {
          fill: #ede9dc;
          stroke: #c0b898;
          stroke-width: 0.9;
        }
        .park-marker {
          cursor: pointer;
          stroke: #fff;
          stroke-width: 1.5;
          transition: r 0.1s ease;
        }
        /* Icon-mode markers: an HTML overlay positioned by percentage.
           Safe because #map-wrap's aspect-ratio matches the SVG viewBox
           exactly, so the SVG never letterboxes inside it. */
        #icon-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .icon-marker {
          position: absolute;
          pointer-events: auto;
          cursor: pointer;
          transform: translate(-50%, -50%);
          transition: transform 0.1s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(0 0 1px #fff) drop-shadow(0 0 1px #fff);
        }
        /* ha-icon's own internal shadow DOM doesn't center its rendered
           content (ha-svg-icon) within itself — confirmed via devtools:
           ha-svg-icon self-centers its glyph, but sits off-center inside
           ha-icon. We can't reach into ha-icon's shadow root to fix that
           directly, but external styles targeting a custom element's host
           (this rule) take precedence over its own internal :host rules,
           and a host's display value governs how its shadow-rendered
           content is laid out — so this centers ha-svg-icon inside ha-icon
           without needing to touch ha-icon's internals at all. */
        .icon-marker ha-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }
        .icon-marker:hover { transform: translate(-50%, -50%) scale(1.18); }
        /* Popup */
        #popup {
          position: absolute;
          z-index: 1500;
          background: var(--card-background-color, #fff);
          color: var(--primary-text-color, #212121);
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,.28);
          width: 262px;
          max-height: calc(100% - 16px);
          display: none;
          overflow-x: hidden;
          overflow-y: auto;
        }
        #popup.visible { display: block; }
        .popup-img { width:100%; height:130px; object-fit:cover; display:block; }
        .popup-body { padding: 10px 12px 12px; }
        .popup-name { font-weight:600; font-size:14px; margin-bottom:2px; }
        .popup-meta { font-size:11px; color: var(--secondary-text-color, #888); margin-bottom:6px; }
        .popup-desc { font-size:12px; line-height:1.5; margin-bottom:6px; }
        .popup-link {
          font-size:12px; text-decoration:none; display:inline-block; margin-bottom:4px;
        }
        .popup-toggle {
          display:block; width:100%; margin-top:8px; padding:8px;
          border:none; border-radius:6px; color:#fff; font-size:13px;
          cursor:pointer; font-family:sans-serif;
        }
        .popup-close {
          position:absolute; top:6px; right:7px;
          background:rgba(0,0,0,.45); border:none; color:#fff;
          border-radius:50%; width:22px; height:22px; cursor:pointer;
          font-size:14px; line-height:1; display:flex;
          align-items:center; justify-content:center;
          font-family:sans-serif;
        }
        /* Panel-open button */
        #panel-btn {
          position:absolute; top:10px; right:10px; z-index:1000;
          width:34px; height:34px;
          background: var(--card-background-color, #fff);
          color: var(--primary-text-color, #333);
          border:1px solid var(--divider-color, #ccc);
          border-radius:6px; font-size:18px;
          cursor:pointer; display:flex; align-items:center; justify-content:center;
          box-shadow:0 1px 4px rgba(0,0,0,.2);
        }
        /* Slide-in panel */
        #panel {
          position:absolute; top:0; right:-310px; width:290px; height:100%;
          background: var(--card-background-color, #fff);
          color: var(--primary-text-color, #212121);
          z-index:2000; transition:right .25s ease;
          box-shadow:-2px 0 8px rgba(0,0,0,.15); display:flex;
          flex-direction:column;
        }
        #panel.open { right:0; }
        .panel-header {
          padding:12px 14px; border-bottom:1px solid var(--divider-color, #eee);
          display:flex; align-items:center; justify-content:space-between;
          flex-shrink:0;
        }
        .panel-header span { font-weight:500; font-size:15px; }
        .panel-close {
          background:none; border:none; font-size:22px; cursor:pointer;
          color: var(--secondary-text-color, #666);
        }
        .panel-search { padding:10px 14px; border-bottom:1px solid var(--divider-color, #eee); flex-shrink:0; }
        .panel-search input {
          width:100%; box-sizing:border-box; padding:8px 10px;
          background: var(--card-background-color, #fff);
          color: var(--primary-text-color, #212121);
          border:1px solid var(--divider-color, #ccc); border-radius:6px; font-size:14px;
        }
        #park-list { flex:1; overflow-y:auto; }
        .park-row {
          display:flex; align-items:center; gap:10px;
          padding:8px 14px; border-bottom:1px solid var(--divider-color, #f0f0f0);
        }
        .park-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
        .park-name {
          flex:1; min-width:0; font-size:13px; font-weight:500;
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .park-desig { font-size:11px; color: var(--secondary-text-color, #888); }
        .park-btn {
          flex-shrink:0; padding:5px 10px; border:none; border-radius:5px;
          font-size:12px; cursor:pointer; color:#fff; white-space:nowrap;
        }
        .no-parks { padding:20px; text-align:center; color: var(--secondary-text-color, #888); font-size:13px; }
      </style>

      <div id="map-wrap">
        <svg id="us-map"
             viewBox="0 0 ${SVG_W} ${SVG_H}"
             preserveAspectRatio="xMidYMid meet">
        </svg>

        <div id="icon-layer"></div>

        <div id="popup">
          <button class="popup-close" aria-label="Close">×</button>
          <div id="popup-content"></div>
        </div>
      </div>

      <button id="panel-btn" title="Browse parks">≡</button>

      <div id="panel">
        <div class="panel-header">
          <span>Parks</span>
          <button class="panel-close">×</button>
        </div>
        <div class="panel-search">
          <input type="text" placeholder="Search parks…" id="search-input">
        </div>
        <div id="park-list"></div>
      </div>
    `;

        // Wire up UI interactions
        this.shadowRoot.querySelector('#panel-btn')
            .addEventListener('click', () => this._togglePanel());
        this.shadowRoot.querySelector('.panel-close')
            .addEventListener('click', () => this._closePanel());
        this.shadowRoot.querySelector('#search-input')
            .addEventListener('input', e => { this._search = e.target.value; this._renderParkList(); });
        this.shadowRoot.querySelector('.popup-close')
            .addEventListener('click', () => this._hidePopup());
        // Click anywhere on the map that isn't a marker (SVG circle or HTML
        // icon marker) closes the popup.
        this.shadowRoot.querySelector('#map-wrap')
            .addEventListener('click', e => {
                if (!e.target.closest('[data-park-code]')) this._hidePopup();
            });

        this._applyConfig();
        this._renderMap(topoData);
        this._initialized = true;
        if (this._hass) this._updateMarkers();
    }

    // ── Config application (live-updatable, no full rebuild needed) ──────────

    _applyConfig() {
        const noBg = this._config.show_background === false;
        this.style.setProperty('--nps-ocean-color', noBg ? 'transparent' : this._config.background_color);
        // removeProperty (not '') so the CSS var()'s fallback chain applies
        // again once the background is turned back on.
        if (noBg) this.style.setProperty('--nps-card-shadow', 'none');
        else this.style.removeProperty('--nps-card-shadow');

        // Marker color/size/icon aren't expressed as CSS vars (the SVG `r`
        // attribute isn't settable via CSS), so just rebuild on config
        // change — cheap, since this only runs on init and on setConfig().
        if (this._initialized) {
            Object.values(this._markers).forEach(({ el }) => el.remove());
            this._markers = {};
            if (this._hass) this._updateMarkers();
        }
    }

    // ── Map rendering ──────────────────────────────────────────────────────────

    _renderMap(topoData) {
        const svgEl = this.shadowRoot.querySelector('#us-map');
        const svg = select(svgEl);

        // Composite projection: mainland Albers + separate sub-projections
        // (each with its own clipExtent) for AK, HI, PR/USVI, Guam/N.
        // Marianas, and American Samoa. One projection, one path generator,
        // covers every region — including all three American Samoa units
        // (Tutuila, Ofu, Ta'u), which a naive AlbersUsa + manual inset
        // approach tends to miss.
        this._projection = geoAlbersUsaTerritories();
        const path = geoPath().projection(this._projection);

        const states = feature(topoData, topoData.objects.states);

        // Mainland, AK, HI, and every territory in one pass. Territories
        // (FIPS ≥ 60) get a slightly heavier stroke to read as distinct
        // clusters since they're not otherwise boxed or labeled.
        svg.append('g').attr('class', 'states-group')
            .selectAll('path')
            .data(states.features)
            .join('path')
            .attr('class', d => Number(d.id) >= 60 ? 'territory' : 'state')
            .attr('d', path);

        // Outer coastline: the "shared with itself" mesh filter picks out
        // every exterior boundary as one continuous line.
        svg.append('path')
            .datum(mesh(topoData, topoData.objects.states, (a, b) => a === b))
            .attr('class', 'nation-border')
            .attr('d', path);

        // Circle-mode markers are appended here later, always on top.
        svg.append('g').attr('id', 'markers');
    }

    // ── Coordinate routing ────────────────────────────────────────────────────

    _getProjectedPoint(lat, lon) {
        // The composite projection's clipExtent per region means one call
        // either lands correctly or returns undefined if no region (main
        // map or territory) claims the point.
        const pt = this._projection([lon, lat]);
        return pt ? { x: pt[0], y: pt[1] } : null;
    }

    // ── Park entities ─────────────────────────────────────────────────────────

    _getParkEntities() {
        if (!this._hass) return [];
        return Object.values(this._hass.states).filter(e =>
            e.attributes.park_code != null &&
            e.attributes.latitude != null &&
            e.attributes.longitude != null &&
            (e.state === 'visited' || e.state === 'unvisited')
        );
    }

    // ── Marker management ─────────────────────────────────────────────────────

    _markerStyleFor(isVisited) {
        const c = this._config;
        return {
            icon: isVisited ? c.visited_icon : c.unvisited_icon,
            color: isVisited ? c.visited_color : c.unvisited_color,
            opacity: isVisited ? c.visited_opacity : c.unvisited_opacity,
            size: isVisited ? c.visited_marker_size : c.unvisited_marker_size,
        };
    }

    _updateMarkers() {
        if (!this._projection) return;
        const markerGroup = this.shadowRoot.querySelector('#markers');
        const iconLayer = this.shadowRoot.querySelector('#icon-layer');
        if (!markerGroup || !iconLayer) return;

        const entities = this._getParkEntities();
        const seen = new Set();

        entities.forEach(entity => {
            const code = entity.attributes.park_code;
            const lat = parseFloat(entity.attributes.latitude);
            const lon = parseFloat(entity.attributes.longitude);
            const isVisited = entity.state === 'visited';
            seen.add(code);

            const style = this._markerStyleFor(isVisited);
            const wantType = style.icon ? 'icon' : 'circle';
            const existing = this._markers[code];

            // If the marker's representation no longer matches config (e.g.
            // an icon is set for visited but not unvisited, and this park
            // just changed state), drop it so it's recreated in the right layer.
            if (existing && existing.type !== wantType) {
                existing.el.remove();
                delete this._markers[code];
            }

            if (this._markers[code]) {
                this._restyleMarker(this._markers[code], style);
                return;
            }

            const pt = this._getProjectedPoint(lat, lon);
            if (!pt) return; // No region (mainland or territory) covers this point

            const el = wantType === 'icon'
                ? this._createIconMarker(code, pt, style)
                : this._createCircleMarker(code, pt, style);

            this._markers[code] = { type: wantType, el, pt };
        });

        // Remove stale markers (park no longer tracked / entity removed)
        Object.keys(this._markers).forEach(code => {
            if (!seen.has(code)) {
                this._markers[code].el.remove();
                delete this._markers[code];
            }
        });

        if (this._panelOpen) this._renderParkList();
    }

    _restyleMarker(marker, style) {
        const { type, el } = marker;
        if (type === 'circle') {
            el.dataset.baseSize = style.size;
            el.setAttribute('r', style.size / 2);
            el.setAttribute('fill', style.color);
            el.setAttribute('fill-opacity', style.opacity);
        } else {
            // el is the wrapper div (see _createIconMarker); it owns the
            // explicit box the centering transform is measured against.
            // ha-icon fills 100% of it via CSS (.icon-marker ha-icon), so
            // it doesn't need its own width/height here — only
            // --mdc-icon-size, which governs the actual glyph size ha-icon
            // renders at internally.
            el.style.width = `${style.size}px`;
            el.style.height = `${style.size}px`;
            const icon = el.querySelector('ha-icon');
            icon.setAttribute('icon', style.icon);
            icon.style.color = style.color;
            icon.style.opacity = style.opacity;
            icon.style.setProperty('--mdc-icon-size', `${style.size}px`);
        }
    }

    _createCircleMarker(code, pt, style) {
        const markerGroup = this.shadowRoot.querySelector('#markers');
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('class', 'park-marker');
        circle.dataset.parkCode = code;
        circle.setAttribute('cx', pt.x);
        circle.setAttribute('cy', pt.y);
        this._restyleMarker({ type: 'circle', el: circle }, style);

        // Visited/unvisited can have different configured sizes, so hover
        // restores the element's own base size (kept in sync by
        // _restyleMarker) rather than a single shared value.
        circle.addEventListener('mouseenter', () =>
            circle.setAttribute('r', parseFloat(circle.getAttribute('r')) + 2));
        circle.addEventListener('mouseleave', () =>
            circle.setAttribute('r', parseFloat(circle.dataset.baseSize) / 2));
        circle.addEventListener('click', e => {
            e.stopPropagation();
            this._showPopup(code, pt.x, pt.y);
        });

        markerGroup.appendChild(circle);
        return circle;
    }

    _createIconMarker(code, pt, style) {
        const iconLayer = this.shadowRoot.querySelector('#icon-layer');
        const wrapper = document.createElement('div');
        wrapper.className = 'icon-marker';
        wrapper.dataset.parkCode = code;
        wrapper.style.left = `${(pt.x / SVG_W) * 100}%`;
        wrapper.style.top = `${(pt.y / SVG_H) * 100}%`;

        wrapper.appendChild(document.createElement('ha-icon'));
        // Restyle the wrapper (not the inner icon) so creation and every
        // later update (see _updateMarkers, which stores/passes the
        // wrapper) target the same element consistently.
        this._restyleMarker({ type: 'icon', el: wrapper }, style);

        wrapper.addEventListener('click', e => {
            e.stopPropagation();
            this._showPopup(code, pt.x, pt.y);
        });

        iconLayer.appendChild(wrapper);
        return wrapper;
    }

    // ── Popup (card-level DOM overlay, not constrained to any inset) ──────────

    _showPopup(code, svgX, svgY) {
        const entity = this._getParkEntities().find(e => e.attributes.park_code === code);
        if (!entity) return;

        const a = entity.attributes;
        const isVisited = entity.state === 'visited';
        const img = a.image;
        const desc = (a.description || '').slice(0, 220);
        const meta = [a.designation, a.states].filter(Boolean).join(' • ');

        this.shadowRoot.querySelector('#popup-content').innerHTML = `
      ${img ? `<img class="popup-img" src="${img.url}" alt="${img.alt_text || ''}">` : ''}
      <div class="popup-body">
        <div class="popup-name">${a.friendly_name || entity.entity_id}</div>
        ${meta ? `<div class="popup-meta">${meta}</div>` : ''}
        <div class="popup-desc">${desc.length === 220 ? desc + '…' : desc}</div>
        ${a.url ? `<a class="popup-link" href="${a.url}" target="_blank" rel="noopener"
            style="color:${this._config.visited_color}">Learn more →</a>` : ''}
        <button class="popup-toggle"
          style="background:${isVisited ? '#c0392b' : this._config.visited_color}"
          data-code="${code}" data-state="${entity.state}">
          ${isVisited ? '✓ Visited — Mark Unvisited' : 'Mark as Visited'}
        </button>
      </div>
    `;

        this.shadowRoot.querySelector('.popup-toggle').addEventListener('click', e => {
            const { code: c, state } = e.currentTarget.dataset;
            this._hass.callService('nps_parks', state === 'visited' ? 'mark_unvisited' : 'mark_visited', { park_code: c });
            this._hidePopup();
        });

        // Convert SVG coords → card-relative pixel coords
        const popup = this.shadowRoot.querySelector('#popup');
        const svgEl = this.shadowRoot.querySelector('#us-map');
        const wrapEl = this.shadowRoot.querySelector('#map-wrap');

        // Popup content length varies (description, image, meta), so lay it
        // out invisibly first to measure its real size rather than guessing
        // — a guessed height can let long popups get clipped by
        // #map-wrap's overflow.
        popup.style.visibility = 'hidden';
        popup.classList.add('visible');
        const popRect = popup.getBoundingClientRect();
        const popW = popRect.width, popH = popRect.height;

        const svgRect = svgEl.getBoundingClientRect();
        const wrapRect = wrapEl.getBoundingClientRect();

        const sx = svgRect.width / SVG_W;
        const sy = svgRect.height / SVG_H;

        let px = (svgRect.left - wrapRect.left) + svgX * sx + 12;
        let py = (svgRect.top - wrapRect.top) + svgY * sy - 70;

        // Keep popup within card bounds
        const maxX = wrapRect.width - popW - 8;
        const maxY = wrapRect.height - popH - 8;
        if (px > maxX) px = svgX * sx - popW - 12 + (svgRect.left - wrapRect.left);
        if (px < 8) px = 8;
        if (py > maxY) py = maxY;
        if (py < 8) py = 8;

        popup.style.left = px + 'px';
        popup.style.top = py + 'px';
        popup.style.visibility = '';
    }

    _hidePopup() {
        this.shadowRoot.querySelector('#popup').classList.remove('visible');
    }

    // ── Panel ─────────────────────────────────────────────────────────────────

    _togglePanel() { this._panelOpen ? this._closePanel() : this._openPanel(); }

    _openPanel() {
        this._panelOpen = true;
        this.shadowRoot.querySelector('#panel').classList.add('open');
        this._renderParkList();
    }

    _closePanel() {
        this._panelOpen = false;
        this.shadowRoot.querySelector('#panel').classList.remove('open');
    }

    _renderParkList() {
        const list = this.shadowRoot.querySelector('#park-list');
        if (!list) return;

        const search = this._search.toLowerCase();
        const entities = this._getParkEntities()
            .filter(e => !search || (e.attributes.friendly_name || '').toLowerCase().includes(search))
            .sort((a, b) => (a.attributes.friendly_name || '').localeCompare(b.attributes.friendly_name || ''));

        if (!entities.length) {
            list.innerHTML = '<div class="no-parks">No parks found</div>';
            return;
        }

        list.innerHTML = entities.map(e => {
            const isVisited = e.state === 'visited';
            const color = isVisited ? this._config.visited_color : this._config.unvisited_color;
            const name = e.attributes.friendly_name || e.entity_id;
            const desig = e.attributes.designation || '';
            const code = e.attributes.park_code;
            return `
        <div class="park-row">
          <div class="park-dot" style="background:${color}"></div>
          <div style="flex:1;min-width:0">
            <div class="park-name">${name}</div>
            <div class="park-desig">${desig}</div>
          </div>
          <button class="park-btn" data-code="${code}" data-state="${e.state}"
            style="background:${isVisited ? '#c0392b' : this._config.visited_color}">
            ${isVisited ? 'Unvisit' : 'Visit'}
          </button>
        </div>
      `;
        }).join('');

        list.querySelectorAll('.park-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                const { code, state } = e.currentTarget.dataset;
                this._hass.callService('nps_parks', state === 'visited' ? 'mark_unvisited' : 'mark_visited', { park_code: code });
            });
        });
    }

    getCardSize() {
        // Height comes from aspect-ratio (see #map-wrap), not config, so
        // estimate from the rendered wrapper if available, otherwise assume
        // a typical single-column card width.
        const wrap = this.shadowRoot?.querySelector('#map-wrap');
        const renderedHeight = wrap?.clientHeight;
        const height = renderedHeight || (420 * (SVG_H / SVG_W));
        return Math.max(1, Math.round(height / 50));
    }
}

if (!customElements.get('nps-parks-card')) {
    customElements.define('nps-parks-card', NPSParksCard);
}

window.customCards = window.customCards || [];
if (!window.customCards.find(c => c.type === 'nps-parks-card')) {
    window.customCards.push({
        type: 'nps-parks-card',
        name: 'NPS Parks Card',
        description: 'Interactive map for tracking National Park Service site visits',
        preview: false,
    });
}