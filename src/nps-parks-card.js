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

// Named map color schemes. Each preset supplies a light- and dark-theme
// variant; `background` is the ocean/water fill, `land` is the state and
// territory fill (the map's "foreground" color), and `border` is the
// state-to-state boundary stroke. "classic" light matches the card's
// original look; the rest are just alternate starting points — any of the
// three colors can still be overridden individually per theme.
const PRESETS = {
    classic: {
        light: { background: '#c9d8e8', land: '#ede9dc', border: '#ffffff' },
        dark: { background: '#0f172a', land: '#2c3440', border: '#161b22' },
    },
    slate: {
        light: { background: '#d9e2ec', land: '#e4e7eb', border: '#ffffff' },
        dark: { background: '#111827', land: '#1f2937', border: '#0b0f17' },
    },
    sepia: {
        light: { background: '#e8dcc8', land: '#f1e6d3', border: '#ffffff' },
        dark: { background: '#241c14', land: '#3a2f22', border: '#150f0a' },
    },
};
const DEFAULT_PRESET = 'classic';

// ── Config form (shared by the editor below) ─────────────────────────────────

const FORM_SCHEMA = [
    {
        type: "grid",
        name: "theme_settings",
        schema: [
            {
                name: "theme_mode",
                selector: {
                    select: {
                        mode: "dropdown",
                        options: [
                            { value: "auto", label: "Follow Home Assistant theme" },
                            { value: "light", label: "Always light" },
                            { value: "dark", label: "Always dark" },
                        ],
                    },
                },
            },
            {
                name: "color_preset",
                selector: {
                    select: {
                        mode: "dropdown",
                        options: [
                            { value: "classic", label: "Classic" },
                            { value: "slate", label: "Slate" },
                            { value: "sepia", label: "Sepia" },
                        ],
                    },
                },
            },
        ],
    },
    {
        name: "show_background",
        selector: { boolean: {} },
    },
    {
        type: "expandable",
        name: "light_theme_colors",
        title: "Light theme colors",
        icon: "mdi:white-balance-sunny",
        schema: [
            { name: "light_background_color", selector: { text: { type: "color" } } },
            { name: "light_land_color", selector: { text: { type: "color" } } },
            { name: "light_border_color", selector: { text: { type: "color" } } },
        ],
    },
    {
        type: "expandable",
        name: "dark_theme_colors",
        title: "Dark theme colors",
        icon: "mdi:weather-night",
        schema: [
            { name: "dark_background_color", selector: { text: { type: "color" } } },
            { name: "dark_land_color", selector: { text: { type: "color" } } },
            { name: "dark_border_color", selector: { text: { type: "color" } } },
        ],
    },
    {
        type: "expandable",
        name: "visited_marker",
        title: "Visited marker",
        icon: "mdi:map-marker-check",
        schema: [
            { name: "visited_icon", selector: { icon: {} } },
            { name: "visited_marker_size", selector: { number: { min: 4, max: 40, mode: "slider" } } },
            { name: "visited_opacity", selector: { number: { min: 0, max: 1, step: 0.05, mode: "slider" } } },
            { name: "visited_color", selector: { text: { type: "color" } } },
        ],
    },
    {
        type: "expandable",
        name: "unvisited_marker",
        title: "Unvisited marker",
        icon: "mdi:map-marker-outline",
        schema: [
            { name: "unvisited_icon", selector: { icon: {} } },
            { name: "unvisited_marker_size", selector: { number: { min: 4, max: 40, mode: "slider" } } },
            { name: "unvisited_opacity", selector: { number: { min: 0, max: 1, step: 0.05, mode: "slider" } } },
            { name: "unvisited_color", selector: { text: { type: "color" } } },
        ],
    },
];

// Map of leaf option name → containing section name (or null for top-level),
// derived from the schema so the two can't drift apart. Used to nest/flatten
// config between the flat shape the card reads and the sectioned shape
// ha-form reads/writes (named grid/expandable sections are data paths).
const OPTION_SECTION = {};
(function indexSchema(schema, parent) {
    for (const item of schema) {
        if (item.schema) indexSchema(item.schema, item.name || parent);
        else OPTION_SECTION[item.name] = parent || null;
    }
})(FORM_SCHEMA, null);

const SECTION_NAMES = [...new Set(Object.values(OPTION_SECTION).filter(Boolean))];

// The complete flat default for every form option, given a flat config
// (needed because color defaults depend on the chosen preset, and marker
// size defaults honor the legacy marker_radius/marker_size options).
function optionDefaults(flat) {
    const preset = PRESETS[flat.color_preset] || PRESETS[DEFAULT_PRESET];
    const legacySize = flat.marker_radius ? flat.marker_radius * 2 : (flat.marker_size || 12);
    return {
        theme_mode: 'auto',
        color_preset: DEFAULT_PRESET,
        show_background: true,
        light_background_color: preset.light.background,
        light_land_color: preset.light.land,
        light_border_color: preset.light.border,
        dark_background_color: preset.dark.background,
        dark_land_color: preset.dark.land,
        dark_border_color: preset.dark.border,
        visited_icon: null,
        visited_marker_size: legacySize,
        visited_opacity: 1.0,
        visited_color: '#2D6A4F',
        unvisited_icon: null,
        unvisited_marker_size: legacySize,
        unvisited_opacity: 0.75,
        unvisited_color: '#9a9a9a',
    };
}

// Lift values nested under known section names up to the top level,
// leaving everything else (type, legacy keys, etc.) untouched.
function flattenConfig(config) {
    const flat = {};
    for (const [key, value] of Object.entries(config || {})) {
        if (SECTION_NAMES.includes(key) && value && typeof value === 'object' && !Array.isArray(value)) {
            Object.assign(flat, value);
        } else {
            flat[key] = value;
        }
    }
    return flat;
}

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
        // The visual editor writes fields inside named grid/expandable
        // sections nested under the section name; flatten those so the
        // rest of the card reads flat keys, and hand-written flat YAML
        // works identically.
        config = flattenConfig(config);

        const legacyRadius = config.marker_radius;
        const legacySize = config.marker_size;
        const defaultSize = legacyRadius ? legacyRadius * 2 : (legacySize || 12);

        const preset = PRESETS[config.color_preset] || PRESETS[DEFAULT_PRESET];

        this._config = {
            visited_color: '#2D6A4F',
            unvisited_color: '#9a9a9a',
            visited_opacity: 1.0,
            unvisited_opacity: 0.75,
            visited_marker_size: defaultSize,
            unvisited_marker_size: defaultSize,
            visited_icon: null,    // e.g. 'mdi:pine-tree' — null = plain dot
            unvisited_icon: null,  // e.g. 'mdi:circle-outline' — null = plain dot

            // Which color set to render with. 'auto' follows Home
            // Assistant's own light/dark mode; 'light'/'dark' pin it.
            theme_mode: 'auto',
            color_preset: DEFAULT_PRESET,

            // Map colors, seeded from the chosen preset and individually
            // overridable per theme.
            show_background: true,
            light_background_color: preset.light.background,
            light_land_color: preset.light.land,
            light_border_color: preset.light.border,
            dark_background_color: preset.dark.background,
            dark_land_color: preset.dark.land,
            dark_border_color: preset.dark.border,

            ...config,
        };

        // Backward compat: the old flat `background_color` option predates
        // theming and only ever described the light look. Treat it as a
        // light-theme override unless light_background_color was already
        // set explicitly.
        if (config.background_color && !config.light_background_color) {
            this._config.light_background_color = config.background_color;
        }

        if (this._initialized) this._applyConfig();
    }

    set hass(hass) {
        // In 'auto' theme mode, HA's own dark/light mode can change without
        // setConfig() ever running again, so re-check on every hass update.
        const wasDark = (this._initialized && this._config.theme_mode === 'auto')
            ? this._isDarkMode() : null;
        this._hass = hass;
        if (this._initialized && this._config.theme_mode === 'auto' && this._isDarkMode() !== wasDark) {
            this._applyThemeColors();
        }
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

      <style id="theme-vars"></style>

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

    // ── Theming ────────────────────────────────────────────────────────────────

    // Resolves theme_mode ('auto' | 'light' | 'dark') to an actual
    // light/dark decision. 'auto' follows Home Assistant's own dark mode
    // flag so the card matches the dashboard without any extra config.
    _isDarkMode() {
        const mode = this._config.theme_mode;
        if (mode === 'light') return false;
        if (mode === 'dark') return true;
        return !!(this._hass && this._hass.themes && this._hass.themes.darkMode);
    }

    // Pushes the resolved light/dark map colors in as CSS custom
    // properties on the host element. Custom properties inherit through
    // the shadow boundary, so the shadow tree's own stylesheet (.state,
    // .territory, :host background) picks these up automatically —
    // nothing inside the shadow root needs to be touched or rebuilt.
    _applyThemeColors() {
        const c = this._config;
        const dark = this._isDarkMode();
        const background = dark ? c.dark_background_color : c.light_background_color;
        const land = dark ? c.dark_land_color : c.light_land_color;
        const border = dark ? c.dark_border_color : c.light_border_color;

        const noBg = c.show_background === false;
        this.style.setProperty('--nps-ocean-color', noBg ? 'transparent' : background);
        // removeProperty (not '') so the CSS var()'s fallback chain applies
        // again once the background is turned back on.
        if (noBg) this.style.setProperty('--nps-card-shadow', 'none');
        else this.style.removeProperty('--nps-card-shadow');

        // Land/border colors are written as literal values into a style tag
        // that lives inside the shadow root itself (rather than set as CSS
        // custom properties on the host and relied on to inherit down into
        // shadow descendants like the .state/.territory SVG paths). Same
        // shadow tree, no inheritance boundary to cross — this is the most
        // reliable way to guarantee the update actually reaches those
        // elements.
        const themeVarsEl = this.shadowRoot?.getElementById('theme-vars');
        if (themeVarsEl) {
            themeVarsEl.textContent = `
                .state { fill: ${land}; stroke: ${border}; }
                .territory { fill: ${land}; }
            `;
        }
    }

    // ── Config application (live-updatable, no full rebuild needed) ──────────

    _applyConfig() {
        this._applyThemeColors();

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

    // A custom editor element (rather than the schema-only getConfigForm
    // API) so unset options can display their live defaults instead of
    // blank fields — ha-form only shows what's literally in the data it's
    // given, and getConfigForm gives no hook to inject merged defaults.
    static getConfigElement() {
        return document.createElement('nps-parks-card-editor');
    }
}

// ── Editor ───────────────────────────────────────────────────────────────────
//
// Thin wrapper around HA's own ha-form. Displayed data = defaults merged
// with the stored config (so unset options show their real effective
// values — preset colors, marker sizes, etc. — instead of blank fields).
// On save, anything still equal to its default is stripped back out so the
// stored YAML only contains what the user actually changed.

class NPSParksCardEditor extends HTMLElement {
    setConfig(config) {
        this._config = config || {};
        this._render();
    }

    set hass(hass) {
        this._hass = hass;
        if (this._form) this._form.hass = hass;
    }

    _render() {
        if (!this._form) {
            this._form = document.createElement('ha-form');
            this._form.computeLabel = schema =>
                schema.title ||
                (schema.name.charAt(0).toUpperCase() + schema.name.slice(1)).replace(/_/g, ' ');
            this._form.addEventListener('value-changed', ev => {
                ev.stopPropagation();
                this._valueChanged(ev.detail.value);
            });
            this.appendChild(this._form);
        }
        if (this._hass) this._form.hass = this._hass;
        this._form.schema = FORM_SCHEMA;
        this._form.data = this._displayData();
    }

    // Defaults merged with the stored config, nested into the section
    // shape ha-form expects. Defaults are recomputed from the current flat
    // values, so e.g. switching color_preset immediately refreshes what
    // the unset color fields display.
    _displayData() {
        const flat = flattenConfig(this._config);
        const merged = { ...optionDefaults(flat) };
        for (const key of Object.keys(OPTION_SECTION)) {
            if (flat[key] !== undefined && flat[key] !== null && flat[key] !== '') {
                merged[key] = flat[key];
            }
        }

        const data = {};
        for (const [key, value] of Object.entries(merged)) {
            const section = OPTION_SECTION[key];
            if (section) (data[section] = data[section] || {})[key] = value;
            else data[key] = value;
        }
        return data;
    }

    _valueChanged(value) {
        const flat = flattenConfig(value);
        const defaults = optionDefaults(flat);

        // Keep only options that differ from their (preset-aware) default.
        const kept = {};
        for (const key of Object.keys(OPTION_SECTION)) {
            const v = flat[key];
            if (v === undefined || v === null || v === '') continue;
            if (v === defaults[key]) continue;
            kept[key] = v;
        }

        // Preserve non-option keys (type, view_layout, legacy options like
        // marker_radius, …) from the existing config, then write the kept
        // options back in their nested section shape.
        const out = {};
        for (const [key, v] of Object.entries(this._config)) {
            if (key in OPTION_SECTION || SECTION_NAMES.includes(key)) continue;
            out[key] = v;
        }
        for (const [key, v] of Object.entries(kept)) {
            const section = OPTION_SECTION[key];
            if (section) (out[section] = out[section] || {})[key] = v;
            else out[key] = v;
        }

        this._config = out;
        this.dispatchEvent(new CustomEvent('config-changed', {
            detail: { config: out },
            bubbles: true,
            composed: true,
        }));
    }
}

if (!customElements.get('nps-parks-card-editor')) {
    customElements.define('nps-parks-card-editor', NPSParksCardEditor);
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