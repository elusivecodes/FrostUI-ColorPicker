import $ from '@fr0st/query';
import { initComponent } from '@fr0st/ui';
import ColorPicker from './color-picker.js';
import { parseColor } from './helpers.js';
import { _events, _eventsModal } from './prototype/events.js';
import { _getString, _isEditable, _refresh, _refreshDisabled, _setColor, _updateAlpha, _updateAttributes, _updateColor, _updateHue, _updateSaturation } from './prototype/helpers.js';
import { _render, _renderModal } from './prototype/render.js';

// ColorPicker default options
ColorPicker.defaults = {
    format: 'auto',
    defaultColor: null,
    alpha: true,
    inline: false,
    horizontal: false,
    keepInvalid: false,
    ignoreReadonly: false,
    modal: false,
    mobileModal: true,
    duration: 100,
    appendTo: null,
    placement: 'bottom',
    position: 'start',
    fixed: false,
    spacing: 0,
    minContact: false,
};

// ColorPicker classes
ColorPicker.classes = {
    alpha: 'colorpicker-alpha flex-grow-1',
    alphaColor: 'colorpicker-alpha-color',
    container: 'd-flex justify-content-between',
    containerHorizontal: 'flex-column',
    disabled: 'colorpicker-disabled',
    guide: 'colorpicker-guide',
    hue: 'colorpicker-hue flex-grow-1',
    menu: 'colorpicker',
    menuHorizontal: 'colorpicker-horizontal',
    menuInline: 'colorpicker-inline',
    menuModal: 'colorpicker-modal',
    menuPadding: 'p-2',
    modal: 'modal',
    modalBody: 'modal-body',
    modalBtnPrimary: 'btn btn-primary ripple',
    modalBtnSecondary: 'btn btn-secondary ripple',
    modalContent: 'modal-content',
    modalDialog: 'modal-dialog modal-sm',
    modalFooter: 'modal-footer',
    preview: 'colorpicker-bar colorpicker-preview',
    saturation: 'colorpicker-saturation',
    spacingHorizontal: 'mt-2',
    spacingModal: 'mt-3',
    spacingVertical: 'me-2',
};

// ColorPicker Lang
ColorPicker.lang = {
    alpha: 'Alpha',
    brightness: 'Brightness',
    cancel: 'Cancel',
    color: 'Color',
    hue: 'Hue',
    saturation: 'Saturation',
    set: 'Set',
};

// ColorPicker static
ColorPicker.parseColor = parseColor;

// ColorPicker prototype
const proto = ColorPicker.prototype;

proto._events = _events;
proto._eventsModal = _eventsModal;
proto._getString = _getString;
proto._isEditable = _isEditable;
proto._refresh = _refresh;
proto._refreshDisabled = _refreshDisabled;
proto._render = _render;
proto._renderModal = _renderModal;
proto._setColor = _setColor;
proto._updateAlpha = _updateAlpha;
proto._updateAttributes = _updateAttributes;
proto._updateColor = _updateColor;
proto._updateHue = _updateHue;
proto._updateSaturation = _updateSaturation;

// ColorPicker init
initComponent('colorpicker', ColorPicker);

// ColorPicker events
$.addEvent(document, 'mousedown.ui.colorpicker', (e) => {
    const nodes = $.find('.colorpicker:not(.colorpicker-inline):not(.colorpicker-modal)');

    for (const node of nodes) {
        const input = $.getData(node, 'input');
        const colorpicker = ColorPicker.init(input);

        if (
            $.isSame(colorpicker._node, e.target) ||
            $.isSame(colorpicker._menuNode, e.target) ||
            $.hasDescendent(colorpicker._menuNode, e.target)
        ) {
            continue;
        }

        colorpicker.hide();
    }
}, { capture: true });

$.addEvent(document, 'keydown.ui.colorpicker', (e) => {
    if (e.code !== 'Escape') {
        return;
    }

    let stopped = false;
    const nodes = $.find('.colorpicker:not(.colorpicker-inline):not(.colorpicker-modal)');

    for (const [i, node] of nodes.entries()) {
        const input = $.getData(node, 'input');
        const colorpicker = ColorPicker.init(input);

        if (!stopped) {
            stopped = true;
            e.stopPropagation();
        }

        colorpicker.hide();

        if (i == 0) {
            $.focus(input);
        }
    }
}, { capture: true });

export default ColorPicker;
