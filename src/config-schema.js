/**
 * Config schema, defaults, and flat/sectioned config conversion shared by
 * card.js (reads the flat config at render time) and editor.js (renders
 * and writes it). No DOM/card logic lives here — this is pure data/schema
 * and the functions that derive from it.
 */

// Named map color schemes. Each preset supplies a light- and dark-theme
// variant; `background` is the ocean/water fill, `land` is the state and
// territory fill (the map's "foreground" color), and `border` is the
// state-to-state boundary stroke. "classic" light matches the card's
// original look; the rest are just alternate starting points — any of the
// three colors can still be overridden individually per theme.
export const PRESETS = {
    classic: {
        light: { background: '#c9d8e8', land: '#ede9dc', border: '#ffffff', coastline: '#c0b898' },
        dark: { background: '#0f172a', land: '#2c3440', border: '#161b22', coastline: '#4a5568' },
    },
    slate: {
        light: { background: '#d9e2ec', land: '#e4e7eb', border: '#ffffff', coastline: '#9fb3c8' },
        dark: { background: '#111827', land: '#1f2937', border: '#0b0f17', coastline: '#374151' },
    },
    sepia: {
        light: { background: '#e8dcc8', land: '#f1e6d3', border: '#ffffff', coastline: '#b39b72' },
        dark: { background: '#241c14', land: '#3a2f22', border: '#150f0a', coastline: '#5a4a35' },
    },
};
export const DEFAULT_PRESET = 'classic';

// ── Config form (shared by the editor) ────────────────────────────────────────
//
// A saved config passes through several shapes on its way to/from the
// editor UI:
//   stored config (may have values nested under section/legacy keys)
//     → flattenConfig() → flat config (only keys the card itself reads)
//     → optionDefaults() merged in → "merged" (every option has a real
//       effective value, so unset fields show their default instead of
//       blank)
//     → re-nested per OPTION_SECTION into each ha-form instance's `data`
//   ...and back the other way on every edit, via NPSParksCardEditor
//   ._syncFormKeys()/_colorChanged() → _commit(), which re-flattens, then
//   strips anything still equal to its default and re-nests what's left
//   for storage.
// FORM_SCHEMA/MARKER_GROUPS/COLOR_GROUPS below are the three sources of
// truth this all derives from — OPTION_SECTION, MAIN_FORM_KEYS, and
// SECTION_NAMES are computed from them so the mapping can't drift out of
// sync with the schemas themselves.

export const FORM_SCHEMA = [
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
];

// Marker settings (icon/size/opacity) render in their own dedicated ha-form
// per state, rather than as an "expandable" block inside FORM_SCHEMA, so
// that the marker color row (hand-rolled — see COLOR_GROUPS below) can sit
// inside the same expansion panel, directly under those fields.
export const MARKER_GROUPS = [
    {
        key: 'visited',
        title: 'Visited marker',
        colorKey: 'visited_color',
        colorLabel: 'Marker color',
        fields: [
            { name: "visited_icon", selector: { icon: {} } },
            { name: "visited_marker_size", selector: { number: { min: 4, max: 40, mode: "slider" } } },
            { name: "visited_opacity", selector: { number: { min: 0, max: 1, step: 0.05, mode: "slider" } } },
        ],
    },
    {
        key: 'unvisited',
        title: 'Unvisited marker',
        colorKey: 'unvisited_color',
        colorLabel: 'Marker color',
        fields: [
            { name: "unvisited_icon", selector: { icon: {} } },
            { name: "unvisited_marker_size", selector: { number: { min: 4, max: 40, mode: "slider" } } },
            { name: "unvisited_opacity", selector: { number: { min: 0, max: 1, step: 0.05, mode: "slider" } } },
        ],
    },
];

// Color options aren't in FORM_SCHEMA: ha-form's text/color selector paints
// the swatch over its own label, so the editor renders these itself as
// label-left / swatch-right rows, grouped as below. Values are stored flat
// at the top level of the config. (Marker colors render inside the
// MARKER_GROUPS panels above instead of here.)
export const COLOR_GROUPS = [
    {
        title: 'Light theme colors',
        keys: [
            ['light_background_color', 'Background'],
            ['light_land_color', 'Land'],
            ['light_border_color', 'State borders'],
            ['light_coastline_color', 'Coastline'],
        ],
    },
    {
        title: 'Dark theme colors',
        keys: [
            ['dark_background_color', 'Background'],
            ['dark_land_color', 'Land'],
            ['dark_border_color', 'State borders'],
            ['dark_coastline_color', 'Coastline'],
        ],
    },
];

// Recursively indexes a ha-form schema into `target`: leaf fields map to
// their containing section name (a "grid"/"expandable" item's `name`), or
// `parent` (null at top level) if never nested. Used below to build
// OPTION_SECTION from both FORM_SCHEMA and MARKER_GROUPS' per-state
// schemas with one consistent walk, rather than one bespoke traversal per
// schema shape.
function indexSchema(target, schema, parent) {
    for (const item of schema) {
        if (item.schema) indexSchema(target, item.schema, item.name || parent);
        else target[item.name] = parent || null;
    }
}

// Map of leaf option name → containing section name (or null for
// top-level). Used to nest/flatten config between the flat shape the card
// reads and the sectioned shape ha-form reads/writes (named grid sections
// are data paths).
export const OPTION_SECTION = {};
indexSchema(OPTION_SECTION, FORM_SCHEMA, null);

// Keys the main ha-form (FORM_SCHEMA) itself owns — captured before the
// marker-group fields below are added to OPTION_SECTION, since the two
// live in separate ha-form instances and must not sync into each other's
// data (see NPSParksCardEditor._syncFormKeys).
export const MAIN_FORM_KEYS = Object.keys(OPTION_SECTION);

// MARKER_GROUPS' fields render in their own per-state ha-form instances
// rather than as a nested FORM_SCHEMA section (see MARKER_GROUPS above),
// so they index with parent = null — same as colors, not nested under
// anything.
for (const group of MARKER_GROUPS) indexSchema(OPTION_SECTION, group.fields, null);

const SECTION_NAMES = [...new Set(Object.values(OPTION_SECTION).filter(Boolean))];

// Configs saved by earlier versions of this editor nested colors under
// these section names, and marker fields under 'visited_marker'/
// 'unvisited_marker' (back when they were an expandable block inside
// FORM_SCHEMA) — still unwrap them on read.
const LEGACY_SECTION_NAMES = ['light_theme_colors', 'dark_theme_colors', 'visited_marker', 'unvisited_marker'];
export const ALL_SECTION_NAMES = [...SECTION_NAMES, ...LEGACY_SECTION_NAMES];

// The complete flat default for every form option, given a flat config
// (needed because color defaults depend on the chosen preset, and marker
// size defaults honor the legacy marker_radius/marker_size options).
export function optionDefaults(flat) {
    const preset = PRESETS[flat.color_preset] || PRESETS[DEFAULT_PRESET];
    const legacySize = flat.marker_radius ? flat.marker_radius * 2 : (flat.marker_size || 12);
    return {
        theme_mode: 'auto',
        color_preset: DEFAULT_PRESET,
        show_background: true,
        light_background_color: preset.light.background,
        light_land_color: preset.light.land,
        light_border_color: preset.light.border,
        light_coastline_color: preset.light.coastline,
        dark_background_color: preset.dark.background,
        dark_land_color: preset.dark.land,
        dark_border_color: preset.dark.border,
        dark_coastline_color: preset.dark.coastline,
        visited_icon: 'mdi:pine-tree',
        visited_marker_size: legacySize,
        visited_opacity: 1.0,
        visited_color: '#2D6A4F',
        unvisited_icon: null,
        unvisited_marker_size: legacySize,
        unvisited_opacity: 0.75,
        unvisited_color: '#9a9a9a',
    };
}

// Shared ha-form computeLabel: falls back to a title-cased, space-joined
// version of the field name when a schema entry has no explicit `title`.
// Used identically by every ha-form instance the editor creates (the main
// form plus one per MARKER_GROUPS entry).
export function computeFieldLabel(schema) {
    return schema.title ||
        (schema.name.charAt(0).toUpperCase() + schema.name.slice(1)).replace(/_/g, ' ');
}

// Case-insensitive for hex colors, strict otherwise.
export function optionEquals(a, b) {
    if (typeof a === 'string' && typeof b === 'string') {
        return a.toLowerCase() === b.toLowerCase();
    }
    return a === b;
}

// Lift values nested under known section names up to the top level,
// leaving everything else (type, legacy keys, etc.) untouched.
export function flattenConfig(config) {
    const flat = {};
    for (const [key, value] of Object.entries(config || {})) {
        if (ALL_SECTION_NAMES.includes(key) && value && typeof value === 'object' && !Array.isArray(value)) {
            Object.assign(flat, value);
        } else {
            flat[key] = value;
        }
    }
    return flat;
}
