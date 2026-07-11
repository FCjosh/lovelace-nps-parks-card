# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A custom Lovelace card for Home Assistant (`nps-parks-card`) that renders an interactive SVG map of US National Park Service sites (mainland, Alaska, Hawaii, Puerto Rico/USVI, Guam/N. Mariana Islands, American Samoa) and tracks visited/unvisited state. It's the companion frontend for the [ha-nps-parks](https://github.com/FCjosh/ha-nps-parks) integration, which is what actually creates the per-park entities this card reads.

Entities are expected to have `park_code`, `latitude`, `longitude` attributes and a state of `visited` or `unvisited`. Toggling a marker calls the `nps_parks.mark_visited` / `nps_parks.mark_unvisited` services.

## Commands

```bash
npm install             # install dependencies
npm run build            # one-off esbuild bundle: src/ → dist/nps-parks-card.js
npm run watch             # rebuild on every save
```

There is no test suite or linter configured in this repo.

**Always commit `src/` changes together with the regenerated `dist/nps-parks-card.js`.** `dist/` is tracked in git (not gitignored) because it's the file HACS/Home Assistant actually serves — it is not hand-edited. CI (`.github/workflows/validate.yml`, `build-check` job) fails the build if `dist/` doesn't match a fresh `npm run build` output, so always rebuild before committing.

CI also runs HACS repository validation (`validate-hacs` job) via `hacs/action`.

## Dependency constraint

`d3-geo` is pinned to `^2.0.1` in `package.json`. `geo-albers-usa-territories` declares `d3-geo@^2` as a peer dependency, and installing `d3-geo@3.x` alongside it fails with an `ERESOLVE` conflict (not just a warning). Don't bump `d3-geo` to a 3.x major version without confirming compatibility first — Dependabot may propose this and it needs manual verification (see `.github/dependabot.yml` comments).

## Architecture

Everything lives in one file: `src/nps-parks-card.js` (~1150 lines), bundled by esbuild into `dist/nps-parks-card.js`. It defines two custom elements and registers them at the bottom of the file:

- **`nps-parks-card`** (`NPSParksCard`) — the card itself.
- **`nps-parks-card-editor`** (`NPSParksCardEditor`) — the visual config editor, returned by `NPSParksCard.getConfigElement()`.

### Map rendering

- Boundary data (~250KB TopoJSON) is fetched lazily at runtime from a CDN (`US_ATLAS_URL`, us-atlas `states-10m.json`) rather than bundled — keeps the shipped JS small; it's cached by the browser across page loads.
- `geoAlbersUsaTerritories()` (from `geo-albers-usa-territories`) is a single composite D3 projection with region-specific `clipExtent`s that correctly places mainland, AK, HI, and every territory — including all three American Samoa units (Tutuila, Ofu, Ta'u), which a naive `d3.geoAlbersUsa()` + manual inset approach misses. One projection + one `geoPath()` generator covers everything; `_getProjectedPoint(lat, lon)` returns `null` if no region's clip extent claims the point (park is silently skipped — see README's Known Limitations).
- The SVG viewBox is a fixed `960×600` stage (`SVG_W`/`SVG_H`); actual card height is derived from `aspect-ratio` CSS, not config — see `getCardSize()`.

### Two marker rendering paths

Markers are either plain SVG `<circle>` elements (in the `#markers` SVG group) or MDI-icon markers (absolutely-positioned HTML `<div>`s in the `#icon-layer` overlay, using percentage-based positioning that only works because `#map-wrap`'s `aspect-ratio` guarantees the SVG never letterboxes inside it). Which path a given marker uses is decided per visited/unvisited state by whether `visited_icon`/`unvisited_icon` is set (`_updateMarkers`, `_markerStyleFor`). If a park's state change flips it between circle and icon representation, the old element is torn down and recreated in the other layer.

### Config shape and the editor

Config is normalized to a **flat** object at the top level (colors, sizes, icons, `theme_mode`, `color_preset`, etc.) — this is what `NPSParksCard` actually reads at render time. `FORM_SCHEMA` (used by `ha-form` in the editor) organizes some of those same flat keys into named `grid`/`expandable` sections for UI purposes; `OPTION_SECTION` is auto-derived from `FORM_SCHEMA` by `indexSchema()` so the section↔flat-key mapping can't drift out of sync. `flattenConfig()` lifts section-nested values back to flat on read (`setConfig`, editor `_render`/`_formChanged`); the editor re-nests on write.

Color options (background/land/border/coastline per light+dark theme, plus marker colors) are *not* in `FORM_SCHEMA` — `ha-form`'s built-in color selector paints its swatch over the label in a way that doesn't fit this editor's layout, so `COLOR_GROUPS` drives a hand-rolled set of `<input type="color">` rows instead, built and updated directly in `NPSParksCardEditor._build()`/`_render()`.

`optionDefaults(flat)` computes the full default set for a config, including preset-derived color defaults (`PRESETS`: `classic`/`slate`/`sepia`, each with a `light` and `dark` variant) and legacy-option-derived marker size defaults. The editor uses this to show unset fields at their real effective values (not blank) and to strip anything still equal to its default back out of saved config, so stored YAML only contains user-changed values (`_commit`).

### Backward compatibility being preserved

Several old flat options are still honored as fallbacks and must keep working:
- `marker_radius` (× 2) and `marker_size` → default for both `visited_marker_size` and `unvisited_marker_size`.
- `background_color` → treated as `light_background_color` if the latter isn't set explicitly.
- `LEGACY_SECTION_NAMES` (`light_theme_colors`, `dark_theme_colors`) — configs saved by earlier editor versions nested colors under these; still unwrapped on read via `ALL_SECTION_NAMES`.

### Theming

`theme_mode` (`auto`/`light`/`dark`) resolves via `_isDarkMode()`, following Home Assistant's own `hass.themes.darkMode` in `auto` mode. Because HA's dark mode can flip without `setConfig()` re-running, `set hass()` diffs dark-mode state on every update and calls `_applyThemeColors()` when it changes. Ocean/background color is pushed as a CSS custom property on the host (inherits through the shadow boundary); land/border/coastline colors are written as literal CSS into a `<style id="theme-vars">` tag inside the shadow root itself (not custom properties) because that's the most reliable way to guarantee shadow-DOM SVG elements pick up the change.

### Popup and panel

The detail popup (`_showPopup`) is laid out invisibly first to measure real content size (image/description/meta vary in length) before positioning, to avoid clipping by `#map-wrap`'s `overflow: hidden`. The slide-in park browser panel (`_openPanel`/`_renderParkList`) is a searchable list of all tracked park entities, independent of the map/markers.
