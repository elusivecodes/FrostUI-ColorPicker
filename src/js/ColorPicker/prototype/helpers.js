/**
 * ColorPicker Helpers
 */

Object.assign(ColorPicker.prototype, {

    /**
     * Update the color attributes.
     */
    _colorAttributes() {
        this._values = {
            alpha: this._settings.alpha ?
                this._color.getAlpha() :
                1,
            brightness: this._color.getBrightness(),
            hue: this._color.getHue(),
            saturation: this._color.getSaturation()
        };
    },

    /**
     * Get the color format from a value.
     * @param {string} value The color value.
     * @returns {string|null} The color format.
     */
    _getFormat(value) {
        if (!value) {
            return null;
        }

        if (value.substring(0, 1) === '#') {
            return 'hex';
        }

        const format = value.substring(0, 3);

        if (['rgb', 'hsl'].includes(format)) {
            return format;
        }

        return null;
    },

    /**
     * Determine whether the input is editable.
     * @returns {Boolean} TRUE if the input is editable, otherwise FALSE.
     */
    _isEditable() {
        return !dom.is(this._node, ':disabled') && (this._settings.ignoreReadonly || !dom.is(this._node, ':read-only'));
    },

    /**
     * Parse a Color from any value.
     * @param {string|Color} date The date to parse.
     * @return {Color} The parsed Color.
     */
    _parseColor(color) {
        if (!color) {
            this._validColor = false;
            return new Color();
        }

        this._validColor = true;

        if (color instanceof Color) {
            return Color.fromString(`${color}`);
        }

        try {
            return Color.fromString(color);
        } catch (e) {
            this._validColor = false;
            return new Color();
        }
    },

    /**
     * Refresh the toggle disabled.
     */
    _refreshDisabled() {
        if (this._native) {
            return;
        }

        if (dom.is(this._node, ':disabled')) {
            dom.addClass(this._menuNode, this.constructor.classes.disabled);
        } else {
            dom.removeClass(this._menuNode, this.constructor.classes.disabled);
        }
    },

    /**
     * Set the current color.
     * @param {Color} color The new color.
     * @param {Boolean} updateAttributes Whether to update the attributes.
     */
    _setColor(color, updateAttributes = true) {
        if (!this._isEditable()) {
            return;
        }

        dom.triggerEvent(this._node, 'change.ui.colorpicker', {
            detail: {
                old: this._color ?
                    this._color.clone() :
                    null,
                new: color ?
                    color.clone() :
                    null
            }
        });

        this._validColor = true;
        this._color = color;

        if (updateAttributes) {
            this._colorAttributes();
        }

        this._updateValue();
        this._refresh();
    },

    /**
     * Update the alpha for an X,Y position.
     * @param {number} x The X position.
     * @param {number} y The Y position.
     */
    _updateAlpha(x, y) {
        const percent = this._settings.horizontal ?
            dom.percentX(this._alpha, x, true, true) :
            dom.percentY(this._alpha, y, true, true);

        this._values.alpha = 1 - (percent / 100);
        this._updateColor();
    },

    /**
     * Update the color from attributes.
     */
    _updateColor() {
        const color = this.getColor()
            .setAlpha(this._values.alpha)
            .setBrightness(this._values.brightness)
            .setHue(this._values.hue)
            .setSaturation(this._values.saturation);

        this._setColor(color, false);
    },

    /**
     * Update the hue for an X,Y position.
     * @param {number} x The X position.
     * @param {number} y The Y position.
     */
    _updateHue(x, y) {
        const percent = this._settings.horizontal ?
            dom.percentX(this._hue, x, true, true) :
            dom.percentY(this._hue, y, true, true);

        this._values.hue = (100 - percent) * 3.6;
        this._updateColor();
    },

    /**
     * Update the saturation for an X,Y position.
     * @param {number} x The X position.
     * @param {number} y The Y position.
     */
    _updateSaturation(x, y) {
        this._values.brightness = 100 - dom.percentY(this._saturation, y, true, true);
        this._values.saturation = dom.percentX(this._saturation, x, true, true);
        this._updateColor();
    },

    /**
     * Update the input value to the current color.
     */
    _updateValue() {
        if (this._settings.keepInvalid && !this._validColor) {
            return;
        }

        let value;
        switch (this._settings.format) {
            case 'hex':
                value = this._color.toHexString();
                break;
            case 'rgb':
                value = this._color.toRGBString();
                break;
            case 'hsl':
                value = this._color.toHSLString();
                break;
            default:
                value = `${this._color}`;
                break;
        }

        dom.setValue(this._node, value);

        if (this._native && this._color) {
            this._updateNativeColor();
        }
    }

});
