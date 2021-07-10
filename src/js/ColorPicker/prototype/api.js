/**
 * ColorPicker API
 */

Object.assign(ColorPicker.prototype, {

    /**
     * Darken the color by a specified amount.
     * @param {number} amount The amount to darken the color by. (0, 1)
     * @returns {ColorPicker} The ColorPicker object.
     */
    darken(amount) {
        const color = this.getColor().darken(amount);
        this._setColor(color);

        return this;
    },

    /**
     * Get the alpha value of the color.
     * @returns {number} The alpha value. (0, 1)
     */
    getAlpha() {
        return this._color.getAlpha();
    },

    /**
     * Get the brightness value of the color.
     * @returns {number} The brightness value. (0, 100)
     */
    getBrightness() {
        return this._color.getBrightness();
    },

    /**
     * Get the current color.
     * @returns {Color} The current color.
     */
    getColor() {
        return this._color.clone();
    },

    /**
     * Get the hue value of the color.
     * @returns {number} The hue value. (0, 360)
     */
    getHue() {
        return this._color.getHue();
    },

    /**
     * Get the saturation value of the color.
     * @returns {number} The saturation value. (0, 100)
     */
    getSaturation() {
        return this._color.getSaturation();
    },

    /**
     * Invert the color.
     * @returns {ColorPicker} The ColorPicker object.
     */
    invert() {
        const color = this.getColor().invert();
        this._setColor(color);

        return this;
    },

    /**
     * Lighten the color by a specified amount.
     * @param {number} amount The amount to lighten the color by. (0, 1)
     * @returns {ColorPicker} The ColorPicker object.
     */
    lighten(amount) {
        const color = this.getColor().lighten(amount);
        this._setColor(color);

        return this;
    },

    /**
     * Get the relative luminance value of the color 
     * @returns {number} The relative luminance value. (0, 1)
     */
    luma() {
        return this._color.luma();
    },

    /**
     * Set the alpha value of the color.
     * @param {number} a The alpha value. (0, 1)
     * @returns {ColorPicker} The ColorPicker object.
     */
    setAlpha(a) {
        if (this._settings.alpha) {
            const color = this.getColor().setAlpha(a);
            this._setColor(color);
        }

        return this;
    },

    /**
     * Set the brightness value of the color.
     * @param {number} v The brightness value. (0, 100)
     * @returns {ColorPicker} The ColorPicker object.
     */
    setBrightness(v) {
        const color = this.getColor().setBrightness(v);
        this._setColor(color);

        return this;
    },

    /**
     * Set the current color.
     * @param {string|Color} date The input color.
     * @returns {ColorPicker} The ColorPicker object.
     */
    setColor(color) {
        color = this._parseColor(color);

        if (!this._settings.alpha) {
            color = color.setAlpha(1);
        }

        this._setColor(color);

        return this;
    },

    /**
     * Set the hue value of the color.
     * @param {number} h The hue value. (0, 360)
     * @returns {ColorPicker} The ColorPicker object.
     */
    setHue(h) {
        const color = this.getColor().setHue(h);
        this._setColor(color);

        return this;
    },

    /**
     * Set the saturation value of the color.
     * @param {number} s The saturation value. (0, 100)
     * @returns {ColorPicker} The ColorPicker object.
     */
    setSaturation(s) {
        const color = this.getColor()._setColor(s);
        this._setColor(color);

        return this;
    },

    /**
     * Shade the color by a specified amount.
     * @param {number} amount The amount to shade the color by. (0, 1)
     * @returns {ColorPicker} The ColorPicker object.
     */
    shade(amount) {
        const color = this.getColor().shade(amount);
        this._setColor(color);

        return this;
    },

    /**
     * Tint the color by a specified amount.
     * @param {number} amount The amount to tint the color by. (0, 1)
     * @returns {ColorPicker} The ColorPicker object.
     */
    tint(amount) {
        const color = this.getColor().tint(amount);
        this._setColor(color);

        return this;
    },

    /**
     * Tone the color by a specified amount.
     * @param {number} amount The amount to tone the color by. (0, 1)
     * @returns {ColorPicker} The ColorPicker object.
     */
    tone(amount) {
        const color = this.getColor().tone(amount);
        this._setColor(color);

        return this;
    }

});
