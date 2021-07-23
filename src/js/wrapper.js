/**
 * FrostUI-ColorPicker v1.2.0
 * https://github.com/elusivecodes/FrostUI-ColorPicker
 */
(function(global, factory) {
    'use strict';

    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = factory;
    } else {
        factory(global);
    }

})(window, function(window) {
    'use strict';

    if (!window) {
        throw new Error('FrostUI-ColorPicker requires a Window.');
    }

    if (!('UI' in window)) {
        throw new Error('FrostUI-ColorPicker requires FrostUI.');
    }

    if (!('Color' in window)) {
        throw new Error('FrostUI-ColorPicker requires FrostColor.');
    }

    const dom = window.dom;
    const UI = window.UI;
    const Color = window.Color;
    const document = window.document;

    // {{code}}
});