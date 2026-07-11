/**
 * NPS Parks Card — custom Lovelace card for tracking National Park Service
 * visits in Home Assistant.
 *
 * This is the esbuild entry point: it just registers the two custom
 * elements defined in card.js/editor.js and the customCards picker entry.
 * See card.js for the card's own architecture notes (map rendering, marker
 * handling, theming, popup/panel), and config-schema.js for the config
 * schema/defaults shared by the card and its editor.
 *
 * Bundled by esbuild into dist/nps-parks-card.js, which is what actually
 * ships. See package.json ("build" script) and the README's Development
 * section. Don't edit dist/ directly; it's generated.
 */

import { NPSParksCard } from './card.js';
import { NPSParksCardEditor } from './editor.js';

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
