import Color from '@fr0st/color';
import $ from '@fr0st/query';
import { formatPercent } from './../helpers.js';

/**
 * Get the color string.
 * @param {Color|null} color The Color.
 * @return {string} The color string.
 */
export function _getString(color) {
    if (!color) {
        return '';
    }

    switch (this._options.format) {
        case 'hex':
            return color.toHexString();
        case 'rgb':
            return color.toRGBString();
        case 'hsl':
            return color.toHSLString();
        default:
            return `${color}`;
    }
};

/**
 * Determine whether the input is editable.
 * @return {Boolean} TRUE if the input is editable, otherwise FALSE.
 */
export function _isEditable() {
    return !$.is(this._node, ':disabled') && (this._options.ignoreReadonly || !$.is(this._node, ':read-only'));
};

/**
 * Refresh the ColorPicker.
 * @param {object} options The options for setting the color.
 * @param {Boolean} [options.updateAttributes=true] Whether to update the input group.
 */
export function _refresh({ updateInputGroup = true } = {}) {
    const saturationColor = Color.fromHSV(this._values.hue, 100, 100);
    $.setStyle(this._saturation, {
        backgroundColor: saturationColor,
    });

    $.setStyle(this._saturationGuide, {
        top: `${100 - this._values.brightness}%`,
        left: `${this._values.saturation}%`,
    });

    $.setAttribute(this._saturationGuide, {
        'aria-valuetext': `${this.constructor.lang.saturation} ${formatPercent(this._values.saturation / 100)}, ${this.constructor.lang.brightness} ${formatPercent(this._values.brightness / 100)}`,
    });

    const hueOffset = `${100 - (this._values.hue / 3.6)}%`;
    if (this._options.horizontal) {
        $.setStyle(this._hueGuide, { left: hueOffset });
    } else {
        $.setStyle(this._hueGuide, { top: hueOffset });
    }

    $.setAttribute(this._hueGuide, {
        'aria-valuetext': Math.round(this._values.hue),
    });

    if (this._options.alpha) {
        const alphaColor = Color.fromHSV(this._values.hue, this._values.saturation, this._values.brightness);
        const direction = this._options.horizontal ?
            'to right,' :
            '';
        $.setStyle(this._alphaColor, {
            background: `linear-gradient(${direction}${alphaColor} 0%, transparent 100%)`,
        });

        const alphaOffset = `${100 - (this._values.alpha * 100)}%`;
        if (this._options.horizontal) {
            $.setStyle(this._alphaGuide, { left: alphaOffset });
        } else {
            $.setStyle(this._alphaGuide, { top: alphaOffset });
        }

        $.setAttribute(this._alphaGuide, {
            'aria-valuetext': formatPercent(this._values.alpha),
        });
    }

    const newColor = Color.fromHSV(this._values.hue, this._values.saturation, this._values.brightness, this._values.alpha);

    $.setStyle(this._previewColor, {
        backgroundColor: newColor,
    });

    if (updateInputGroup && this._inputGroupColor) {
        $.setStyle(this._inputGroupColor, {
            backgroundColor: newColor,
        });
    }
};

/**
 * Refresh the toggle disabled.
 */
export function _refreshDisabled() {
    if (this._native) {
        return;
    }

    if ($.is(this._node, ':disabled')) {
        $.addClass(this._menuNode, this.constructor.classes.disabled);
    } else {
        $.removeClass(this._menuNode, this.constructor.classes.disabled);
    }
};

/**
 * Set the current color.
 * @param {Color} color The new color.
 * @param {object} options The options for setting the color.
 * @param {Boolean} [options.updateAttributes=true] Whether to update the attributes.
 * @param {Boolean} [options.updateInputGroup=true] Whether to update the input group.
 * @param {Boolean} [options.updateValue=true] Whether to update the value.
 */
export function _setColor(color, { updateAttributes = true, updateInputGroup = true, updateValue = true } = {}) {
    if (!this._isEditable()) {
        return;
    }

    const oldColor = this._color;
    this._color = color;

    const oldValue = $.getValue(this._node);
    const newValue = this._getString(color);

    if (updateAttributes) {
        this._updateAttributes();
    }

    this._refresh({ updateInputGroup });

    if (!updateValue || oldValue === newValue) {
        return;
    }

    $.setValue(this._node, newValue);

    $.triggerEvent(this._node, 'change.ui.colorpicker', {
        data: {
            skipUpdate: true,
        },
        detail: {
            old: oldColor,
            new: this._color,
        },
    });
};

/**
 * Update the alpha for an X,Y position.
 * @param {number} x The X position.
 * @param {number} y The Y position.
 */
export function _updateAlpha(x, y) {
    const percent = this._options.horizontal ?
        $.percentX(this._alpha, x, { offset: true }) :
        $.percentY(this._alpha, y, { offset: true });

    this._values.alpha = 1 - (percent / 100);

    this._updateColor();
};

/**
 * Update the color attributes.
 */
export function _updateAttributes() {
    const color = this._color || this._defaultColor;

    this._values.alpha = this._options.alpha ?
        color.getAlpha() :
        1;

    this._values.brightness = color.getBrightness();

    if (this._values.brightness > 0) {
        this._values.saturation = color.getSaturation();
    }

    if (this._values.brightness > 0 && this._values.saturation > 0) {
        this._values.hue = color.getHue();
    }
};

/**
/**
 * Update the color from attributes.
 */
export function _updateColor() {
    const color = (this._color || this._defaultColor)
        .setAlpha(this._values.alpha)
        .setBrightness(this._values.brightness)
        .setSaturation(this._values.saturation)
        .setHue(this._values.hue);

    this._setColor(color, {
        updateAttributes: false,
        updateInputGroup: !this._options.modal,
        updateValue: !this._options.modal,
    });
};

/**
 * Update the hue for an X,Y position.
 * @param {number} x The X position.
 * @param {number} y The Y position.
 */
export function _updateHue(x, y) {
    const percent = this._options.horizontal ?
        $.percentX(this._hue, x, { offset: true }) :
        $.percentY(this._hue, y, { offset: true });

    this._values.hue = (100 - percent) * 3.6;

    this._updateColor();
};

/**
 * Update the saturation for an X,Y position.
 * @param {number} x The X position.
 * @param {number} y The Y position.
 */
export function _updateSaturation(x, y) {
    this._values.brightness = 100 - $.percentY(this._saturation, y, { offset: true });
    this._values.saturation = $.percentX(this._saturation, x, { offset: true });

    this._updateColor();
};
