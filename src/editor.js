/**
 * Visual config editor (nps-parks-card-editor) — thin wrapper around HA's
 * own ha-form. See config-schema.js for the schema/defaults this reads and
 * writes, and card.js's CLAUDE.md-documented architecture notes for the
 * overall flat-config/section-nesting design.
 */

import {
    FORM_SCHEMA, MARKER_GROUPS, COLOR_GROUPS, OPTION_SECTION, MAIN_FORM_KEYS,
    ALL_SECTION_NAMES, optionDefaults, optionEquals, flattenConfig, computeFieldLabel,
} from './config-schema.js';

// ── Editor ───────────────────────────────────────────────────────────────────
//
// Thin wrapper around HA's own ha-form. Displayed data = defaults merged
// with the stored config (so unset options show their real effective
// values — preset colors, marker sizes, etc. — instead of blank fields).
// On save, anything still equal to its default is stripped back out so the
// stored YAML only contains what the user actually changed.

export class NPSParksCardEditor extends HTMLElement {
    setConfig(config) {
        this._config = config || {};
        this._render();
    }

    set hass(hass) {
        this._hass = hass;
        if (this._form) this._form.hass = hass;
        if (this._markerForms) {
            for (const group of MARKER_GROUPS) this._markerForms[group.key].hass = hass;
        }
    }

    _render() {
        if (!this._built) this._build();
        if (this._hass) {
            this._form.hass = this._hass;
            for (const group of MARKER_GROUPS) this._markerForms[group.key].hass = this._hass;
        }

        const flat = flattenConfig(this._config);
        const merged = { ...optionDefaults(flat) };
        for (const key of Object.keys(merged)) {
            if (flat[key] !== undefined && flat[key] !== null && flat[key] !== '') {
                merged[key] = flat[key];
            }
        }

        // Main ha-form data: only the fields it owns, nested into sections
        const data = {};
        for (const key of MAIN_FORM_KEYS) {
            const section = OPTION_SECTION[key];
            if (section) (data[section] = data[section] || {})[key] = merged[key];
            else data[key] = merged[key];
        }
        this._form.schema = FORM_SCHEMA;
        this._form.data = data;

        // Each marker group's own dedicated ha-form (icon/size/opacity for
        // that state) — flat data, not nested under any section.
        for (const group of MARKER_GROUPS) {
            const gdata = {};
            for (const field of group.fields) gdata[field.name] = merged[field.name];
            const form = this._markerForms[group.key];
            form.schema = group.fields;
            form.data = gdata;
        }

        // Color rows: show the merged (default-aware) value. <input
        // type="color"> needs a #rrggbb string; fall back to black only if
        // a value is somehow unparseable rather than crashing.
        for (const [key, input] of Object.entries(this._colorInputs)) {
            const v = merged[key];
            input.value = (typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v)) ? v : '#000000';
        }
    }

    _build() {
        this._built = true;
        this._colorInputs = {};
        this._markerForms = {};

        const style = document.createElement('style');
        style.textContent = `
            .nps-color-group { margin-top: 12px; }
            .nps-color-rows { padding: 4px 16px 12px; }
            .nps-color-row {
                display: flex; align-items: center; justify-content: space-between;
                padding: 6px 0;
            }
            .nps-color-row label {
                color: var(--primary-text-color);
                font-size: 14px;
            }
            .nps-color-row input[type="color"] {
                width: 52px; height: 32px; padding: 2px;
                border: 1px solid var(--divider-color, #ccc);
                border-radius: 6px;
                background: var(--card-background-color, #fff);
                cursor: pointer;
            }
        `;
        this.appendChild(style);

        this._form = document.createElement('ha-form');
        this._form.computeLabel = computeFieldLabel;
        this._form.addEventListener('value-changed', ev => {
            ev.stopPropagation();
            this._syncFormKeys(MAIN_FORM_KEYS, ev.detail.value);
        });
        this.appendChild(this._form);

        for (const group of MARKER_GROUPS) {
            const panel = document.createElement('ha-expansion-panel');
            panel.className = 'nps-color-group';
            panel.outlined = true;
            panel.header = group.title;

            const form = document.createElement('ha-form');
            form.computeLabel = computeFieldLabel;
            form.addEventListener('value-changed', ev => {
                ev.stopPropagation();
                this._syncFormKeys(group.fields.map(f => f.name), ev.detail.value);
            });
            panel.appendChild(form);
            this._markerForms[group.key] = form;

            const rows = document.createElement('div');
            rows.className = 'nps-color-rows';
            rows.appendChild(this._buildColorRow(group.colorKey, group.colorLabel));
            panel.appendChild(rows);

            this.appendChild(panel);
        }

        for (const group of COLOR_GROUPS) {
            const panel = document.createElement('ha-expansion-panel');
            panel.className = 'nps-color-group';
            panel.outlined = true;
            panel.header = group.title;

            const rows = document.createElement('div');
            rows.className = 'nps-color-rows';
            for (const [key, label] of group.keys) rows.appendChild(this._buildColorRow(key, label));
            panel.appendChild(rows);
            this.appendChild(panel);
        }
    }

    // Builds one label-left / swatch-right color row and registers its
    // input in this._colorInputs, keyed by option name (shared by both
    // MARKER_GROUPS and COLOR_GROUPS panels).
    _buildColorRow(key, label) {
        const row = document.createElement('div');
        row.className = 'nps-color-row';

        const labelEl = document.createElement('label');
        labelEl.textContent = label;

        const input = document.createElement('input');
        input.type = 'color';
        input.addEventListener('input', e => this._colorChanged(key, e.target.value));

        row.appendChild(labelEl);
        row.appendChild(input);
        this._colorInputs[key] = input;
        return row;
    }

    // A ha-form instance fired value-changed: fold its (nested) values into
    // the flat working config, scoped to just the keys that form instance
    // owns — the editor has several separate ha-form instances (the main
    // form plus one per marker group), so a change in one must not be read
    // as "every other form's fields were cleared". Takes form-managed keys
    // verbatim — including cleared ones — so e.g. removing an icon
    // actually unsets it.
    _syncFormKeys(keys, value) {
        const formFlat = flattenConfig(value);
        const flat = flattenConfig(this._config);
        for (const key of keys) {
            if (formFlat[key] === undefined) delete flat[key];
            else flat[key] = formFlat[key];
        }
        this._commit(flat);
    }

    _colorChanged(key, value) {
        const flat = flattenConfig(this._config);
        flat[key] = value;
        this._commit(flat);
    }

    // Strip anything equal to its (preset-aware) default, re-nest
    // form-managed options into their sections, keep colors flat, preserve
    // all non-option keys (type, view_layout, legacy marker_radius, …).
    _commit(flat) {
        const defaults = optionDefaults(flat);

        const out = {};
        for (const [key, v] of Object.entries(this._config)) {
            if (key in defaults || ALL_SECTION_NAMES.includes(key)) continue;
            out[key] = v;
        }
        for (const key of Object.keys(defaults)) {
            const v = flat[key];
            if (v === undefined || v === null || v === '') continue;
            if (optionEquals(v, defaults[key])) continue;
            const section = OPTION_SECTION[key];  // undefined for colors → flat
            if (section) (out[section] = out[section] || {})[key] = v;
            else out[key] = v;
        }

        this._config = out;
        this._render();
        this.dispatchEvent(new CustomEvent('config-changed', {
            detail: { config: out },
            bubbles: true,
            composed: true,
        }));
    }
}
