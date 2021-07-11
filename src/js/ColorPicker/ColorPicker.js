/**
 * ColorPicker Class
 * @class
 */
class ColorPicker extends UI.BaseComponent {

    /**
     * New ColorPicker constructor.
     * @param {HTMLElement} node The input node.
     * @param {object} [settings] The options to create the ColorPicker with.
     * @returns {ColorPicker} A new ColorPicker object.
     */
    constructor(node, settings) {
        super(node, settings);

        const value = dom.getValue(this._node);

        if (this._settings.format === 'auto') {
            this._settings.format = this._getFormat(value);
        }

        this._color = this._parseColor(value);

        if (!this._validColor && this._settings.defaultColor) {
            this._color = this._parseColor(this._settings.defaultColor);
        }

        this._native = this._settings.mobileNative &&
            !this._settings.alpha &&
            !this._settings.inline &&
            /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);

        const inputGroup = dom.closest(this._node, '.input-group').shift();
        if (inputGroup) {
            this._inputGroupColor = dom.findOne('.input-group-color', inputGroup);
        }

        this._updateValue();

        if (this._native) {
            this._renderNative();
            this._eventsNative();
        } else {
            this._render();
            this._events();
            this._colorAttributes();
            this._refresh();
        }

        this._refreshDisabled();
    }

    /**
     * Disable the ColorPicker.
     * @returns {ColorPicker} The ColorPicker.
     */
    disable() {
        dom.setAttribute(this._node, 'disabled', true);
        this._refreshDisabled();

        return this;
    }

    /**
     * Dispose the ColorPicker.
     */
    dispose() {
        this._color = null;

        if (this._native) {
            return this._disposeNative();
        }

        if (this._popper) {
            this._popper.destroy();
            this._popper = null;
        }

        dom.removeEvent(this._node, 'focus.ui.colorpicker');
        dom.removeEvent(this._node, 'keydown.ui.colorpicker');
        dom.removeEvent(this._node, 'input.ui.color');
        dom.removeEvent(this._node, 'change.ui.color');
        dom.remove(this._menuNode);

        this._menuNode = null;
        this._container = null;
        this._saturation = null;
        this._saturationGuide = null;
        this._hue = null;
        this._hueGuide = null;
        this._alpha = null;
        this._alphaColor = null;
        this._alphaGuide = null;
        this._preview = null;
        this._previewColor = null;

        super.dispose();
    }

    /**
     * Enable the ColorPicker.
     * @returns {ColorPicker} The ColorPicker.
     */
    enable() {
        dom.removeAttribute(this._node, 'disabled');
        this._refreshDisabled();

        return this;
    }

    /**
     * Hide the ColorPicker.
     * @returns {ColorPicker} The ColorPicker.
     */
    hide() {
        if (
            this._settings.inline ||
            this._animating ||
            !dom.isConnected(this._menuNode) ||
            !dom.triggerOne(this._node, 'hide.ui.colorpicker')
        ) {
            return this;
        }

        this._animating = true;

        dom.fadeOut(this._menuNode, {
            duration: this._settings.duration
        }).then(_ => {
            dom.detach(this._menuNode);
            dom.triggerEvent(this._node, 'hidden.ui.colorpicker');
        }).catch(_ => { }).finally(_ => {
            this._animating = false;
        });

        return this;
    }

    /**
     * Show the ColorPicker.
     * @returns {ColorPicker} The ColorPicker.
     */
    show() {
        if (
            this._settings.inline ||
            this._animating ||
            dom.isConnected(this._menuNode) ||
            !this._isEditable() ||
            !dom.triggerOne(this._node, 'show.ui.colorpicker')
        ) {
            return this;
        }

        this._animating = true;

        if (this._settings.appendTo) {
            dom.append(this._settings.appendTo, this._menuNode);
        } else {
            dom.after(this._node, this._menuNode);
        }

        this.update();

        dom.fadeIn(this._menuNode, {
            duration: this._settings.duration
        }).then(_ => {
            dom.triggerEvent(this._node, 'shown.ui.colorpicker');

            if (this._settings.focusOnShow) {
                dom.focus(this._node);
            }
        }).catch(_ => { }).finally(_ => {
            this._animating = false;
        });

        return this;
    }

    /**
     * Toggle the ColorPicker.
     * @returns {ColorPicker} The ColorPicker.
     */
    toggle() {
        return dom.isConnected(this._menuNode) ?
            this.hide() :
            this.show();
    }

    /**
     * Update the ColorPicker position.
     * @returns {ColorPicker} The ColorPicker.
     */
    update() {
        if (!this._settings.inline) {
            this._popper.update();
        }

        return this;
    }

}
