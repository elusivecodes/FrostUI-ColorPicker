(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@fr0st/query'), require('@fr0st/ui'), require('@fr0st/color')) :
    typeof define === 'function' && define.amd ? define(['exports', '@fr0st/query', '@fr0st/ui', '@fr0st/color'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.UI = global.UI || {}, global.fQuery, global.UI, global.Color));
})(this, (function (exports, $, ui, Color) { 'use strict';

    /**
     * Format a number as a percent string.
     * @param {number} number The number.
     * @return {string} The percent string.
     */
    function formatPercent(number) {
        return Number(number).toLocaleString('en-US', { style: 'percent' });
    }
    /**
     * Get the color format from a value.
     * @param {string} value The color value.
     * @return {string|null} The color format.
     */
    function getFormat(value) {
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
    }
    /**
     * Parse a Color from any value.
     * @param {string|Color} color The color to parse.
     * @return {Color} The parsed Color.
     */
    function parseColor(color) {
        if (!color) {
            return null;
        }

        if (color instanceof Color) {
            return color;
        }

        try {
            return Color.fromString(color);
        } catch (e) {
            return null;
        }
    }

    /**
     * ColorPicker Class
     * @class
     */
    class ColorPicker extends ui.BaseComponent {
        /**
         * New ColorPicker constructor.
         * @param {HTMLElement} node The input node.
         * @param {object} [options] The options to create the ColorPicker with.
         */
        constructor(node, options) {
            super(node, options);

            const value = $.getValue(this._node);

            if (this._options.format === 'auto') {
                this._options.format = getFormat(value);
            }

            if (this._options.defaultColor) {
                this._defaultColor = parseColor(this._options.defaultColor);
            }

            if (!this._defaultColor) {
                this._defaultColor = new Color();
            }

            this._color = parseColor(value);

            if (this._options.inline) {
                this._options.modal = false;
            } else if (!this._options.modal && this._options.mobileModal) {
                this._options.modal = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
            }

            if (this._options.modal) {
                this._options.horizontal = true;
            }

            const inputGroup = $.closest(this._node, '.input-group').shift();
            if (inputGroup) {
                this._inputGroupColor = $.findOne('.input-group-color', inputGroup);
            }

            if (this._color || (value && !this._options.keepInvalid)) {
                const newValue = this._getString(this._color);
                $.setValue(this._node, newValue);
            }

            this._render();
            this._events();

            if (this._options.modal) {
                this._renderModal();
                this._eventsModal();
            }

            this._values = {
                alpha: 1,
                brightness: 0,
                hue: 0,
                saturation: 0,
            };

            this._updateAttributes();
            this._refresh();
            this._refreshDisabled();

            $.setData(this._menuNode, { input: this._node });
        }

        /**
         * Disable the ColorPicker.
         */
        disable() {
            $.setAttribute(this._node, { disabled: true });
            this._refreshDisabled();
        }

        /**
         * Dispose the ColorPicker.
         */
        dispose() {
            if (this._popper) {
                this._popper.dispose();
                this._popper = null;
            }

            if (this._modal) {
                ui.Modal.init(this._modal).dispose();

                $.removeEvent(this._modal, 'show.ui.modal');
                $.removeEvent(this._modal, 'shown.ui.modal');
                $.removeEvent(this._modal, 'hide.ui.modal');
                $.removeEvent(this._modal, 'hidden.ui.modal');
                $.removeEvent(this._setBtn, 'click.ui.modal');

                this._modal = null;
                this._setBtn = null;
            }

            $.removeEvent(this._node, 'change.ui.colorpicker');
            $.removeEvent(this._node, 'input.ui.colorpicker');
            $.removeEvent(this._node, 'click.ui.colorpicker');
            $.removeEvent(this._node, 'focus.ui.colorpicker');
            $.removeEvent(this._node, 'keydown.ui.colorpicker');
            $.removeEvent(this._node, 'keyup.ui.colorpicker');

            if (this._inputGroupColor) {
                $.removeEvent(this._inputGroupColor, 'click.ui.colorpicker');
            }

            $.remove(this._menuNode);

            this._color = null;
            this._defaultColor = null;
            this._inputGroupColor = null;
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
            this._values = null;

            super.dispose();
        }

        /**
         * Enable the ColorPicker.
         */
        enable() {
            $.removeAttribute(this._node, 'disabled');
            this._refreshDisabled();
        }

        /**
         * Get the current color.
         * @return {Color|null} The current color.
         */
        getColor() {
            return this._color;
        }

        /**
         * Hide the ColorPicker.
         */
        hide() {
            if (this._options.inline) {
                return;
            }

            if (this._options.modal) {
                ui.Modal.init(this._modal).hide();
                return;
            }

            if (
                !$.isConnected(this._menuNode) ||
                $.getDataset(this._menuNode, 'uiAnimating') ||
                !$.triggerOne(this._node, 'hide.ui.colorpicker')
            ) {
                return;
            }

            $.setDataset(this._menuNode, { uiAnimating: 'out' });

            const focusableNodes = $.find('[tabindex]', this._menuNode);
            $.setAttribute(focusableNodes, { tabindex: -1 });

            $.fadeOut(this._menuNode, {
                duration: this._options.duration,
            }).then((_) => {
                this._popper.dispose();
                this._popper = null;

                $.detach(this._menuNode);
                $.removeDataset(this._menuNode, 'uiAnimating');
                $.triggerEvent(this._node, 'hidden.ui.colorpicker');
            }).catch((_) => {
                if ($.getDataset(this._menuNode, 'uiAnimating') === 'out') {
                    $.removeDataset(this._menuNode, 'uiAnimating');
                }
            });
        }

        /**
         * Set the current color.
         * @param {string|Color|null} color The new color.
         */
        setColor(color) {
            if (color === null) {
                this._setColor(color);
                return;
            }

            color = parseColor(color);

            if (!color) {
                return;
            }

            if (!this._options.alpha) {
                color = color.setAlpha(1);
            }

            this._setColor(color);
        }

        /**
         * Show the ColorPicker.
         */
        show() {
            if (
                this._options.inline ||
                $.isConnected(this._menuNode) ||
                !this._isEditable()
            ) {
                return;
            }

            if (this._options.modal) {
                if (this._options.appendTo) {
                    $.append(this._options.appendTo, this._modal);
                } else {
                    const parentModal = $.closest(this._node, '.modal').shift();

                    if (parentModal) {
                        $.after(parentModal, this._modal);
                    } else {
                        $.after(this._node, this._modal);
                    }
                }

                const modal = ui.Modal.init(this._modal);

                if (this._activeTarget) {
                    modal._activeTarget = this._activeTarget;
                }

                modal.show();
                return;
            }

            if (
                $.getDataset(this._menuNode, 'uiAnimating') ||
                !$.triggerOne(this._node, 'show.ui.colorpicker')
            ) {
                return;
            }

            $.setDataset(this._menuNode, { uiAnimating: 'in' });

            if (this._isEditable()) {
                const focusableNodes = $.find('[tabindex]', this._menuNode);
                $.setAttribute(focusableNodes, { tabindex: 0 });
            }

            if (this._options.appendTo) {
                $.append(this._options.appendTo, this._menuNode);
            } else {
                $.after(this._node, this._menuNode);
            }

            this._popper = new ui.Popper(
                this._menuNode,
                {
                    reference: this._node,
                    placement: this._options.placement,
                    position: this._options.position,
                    fixed: this._options.fixed,
                    spacing: this._options.spacing,
                    minContact: this._options.minContact,
                },
            );

            $.fadeIn(this._menuNode, {
                duration: this._options.duration,
            }).then((_) => {
                $.removeDataset(this._menuNode, 'uiAnimating');
                $.triggerEvent(this._node, 'shown.ui.colorpicker');
            }).catch((_) => {
                if ($.getDataset(this._menuNode, 'uiAnimating') === 'in') {
                    $.removeDataset(this._menuNode, 'uiAnimating');
                }
            });
        }

        /**
         * Toggle the ColorPicker.
         */
        toggle() {
            if ($.isConnected(this._menuNode)) {
                this.hide();
            } else {
                this.show();
            }
        }

        /**
         * Update the ColorPicker position.
         */
        update() {
            if (this._popper) {
                this._popper.update();
            }
        }
    }

    /**
     * Attach events for the ColorPicker.
     */
    function _events() {
        const saturationDownEvent = (e) => {
            if (e.button) {
                return false;
            }

            $.focus(this._saturationGuide);
        };

        const saturationMoveEvent = (e) => {
            const pos = ui.getPosition(e);
            this._updateSaturation(pos.x, pos.y);
        };

        const saturationDragEvent = $.mouseDragFactory(saturationDownEvent, saturationMoveEvent);

        $.addEvent(this._saturation, 'mousedown.ui.colorpicker touchstart.ui.colorpicker', saturationDragEvent);

        $.addEvent(this._saturation, 'click.ui.colorpicker', (e) => {
            if (e.button) {
                return false;
            }

            const pos = ui.getPosition(e);
            this._updateSaturation(pos.x, pos.y);

            $.focus(this._saturationGuide);
        });

        $.addEvent(this._saturationGuide, 'keydown.ui.colorpicker', (e) => {
            switch (e.code) {
                case 'ArrowRight':
                    this._values.saturation = Math.min(100, this._values.saturation + 1);
                    break;
                case 'ArrowDown':
                    this._values.brightness = Math.max(0, this._values.brightness - 1);
                    break;
                case 'ArrowLeft':
                    this._values.saturation = Math.max(0, this._values.saturation - 1);
                    break;
                case 'ArrowUp':
                    this._values.brightness = Math.min(100, this._values.brightness + 1);
                    break;
                default:
                    return;
            }

            e.preventDefault();

            this._updateColor();
        });

        const hueDownEvent = (e) => {
            if (e.button) {
                return false;
            }

            $.focus(this._hueGuide);
        };

        const hueMoveEvent = (e) => {
            const pos = ui.getPosition(e);
            this._updateHue(pos.x, pos.y);
        };

        const hueDragEvent = $.mouseDragFactory(hueDownEvent, hueMoveEvent);

        $.addEvent(this._hue, 'mousedown.ui.colorpicker touchstart.ui.colorpicker', hueDragEvent);

        $.addEvent(this._hue, 'click.ui.colorpicker', (e) => {
            if (e.button) {
                return false;
            }

            const pos = ui.getPosition(e);
            this._updateHue(pos.x, pos.y);

            $.focus(this._hueGuide);
        });

        $.addEvent(this._hueGuide, 'keydown.ui.colorpicker', (e) => {
            switch (e.code) {
                case 'ArrowRight':
                case 'ArrowDown':
                    this._values.hue = Math.max(0, this._values.hue - 1);
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    this._values.hue = Math.min(360, this._values.hue + 1);
                    break;
                default:
                    return;
            }

            e.preventDefault();

            this._updateColor();
        });

        if (this._options.alpha) {
            const alphaDownEvent = (e) => {
                if (e.button) {
                    return false;
                }

                $.focus(this._alphaGuide);
            };

            const alphaMoveEvent = (e) => {
                const pos = ui.getPosition(e);
                this._updateAlpha(pos.x, pos.y);
            };

            const alphaDragEvent = $.mouseDragFactory(alphaDownEvent, alphaMoveEvent);

            $.addEvent(this._alpha, 'mousedown.ui.colorpicker touchstart.ui.colorpicker', alphaDragEvent);

            $.addEvent(this._alpha, 'click.ui.colorpicker', (e) => {
                if (e.button) {
                    return false;
                }

                const pos = ui.getPosition(e);
                this._updateAlpha(pos.x, pos.y);

                $.focus(this._alphaGuide);
            });

            $.addEvent(this._alphaGuide, 'keydown.ui.colorpicker', (e) => {
                switch (e.code) {
                    case 'ArrowRight':
                    case 'ArrowDown':
                        this._values.alpha = Math.max(0, this._values.alpha - .01);
                        break;
                    case 'ArrowLeft':
                    case 'ArrowUp':
                        this._values.alpha = Math.min(1, this._values.alpha + .01);
                        break;
                    default:
                        return;
                }

                e.preventDefault();

                this._updateColor();
            });
        }

        $.addEvent(this._node, 'change.ui.colorpicker', (e) => {
            if (e.skipUpdate) {
                return;
            }

            const value = $.getValue(this._node);
            const color = parseColor(value);

            if (color) {
                this._setColor(color);
            } else if (!this._options.keepInvalid && value) {
                this._setColor(this._color);
            } else {
                this._color = null;
                this._updateAttributes();
                this._refresh();
            }
        });

        $.addEvent(this._menuNode, 'keydown.ui.colorpicker', (e) => {
            switch (e.code) {
                case 'Enter':
                case 'NumpadEnter':
                    e.preventDefault();

                    if (this._options.inline) {
                        return;
                    }

                    if (this._options.modal) {
                        this._keepColor = true;
                    } else {
                        $.focus(this._node);
                    }

                    this.hide();
                    break;
                case 'Tab':
                    if (!this._options.modal && !this._options.inline) {
                        const focusableNodes = $.find('[tabindex="0"]', this._menuNode);
                        const focusIndex = $.indexOf(focusableNodes, e.target);

                        if (e.shiftKey && focusIndex === 0) {
                            e.preventDefault();

                            $.focus(this._node);
                        } else if (!e.shiftKey && focusIndex === focusableNodes.length - 1) {
                            $.focus(this._node);

                            this.hide();
                        }
                    }
                    break;
            }
        });

        if (this._options.inline) {
            return;
        }

        $.addEvent(this._node, 'input.ui.colorpicker', (_) => {
            const value = $.getValue(this._node);
            const color = parseColor(value);

            if (color) {
                this._color = color;
                this._updateAttributes();
                this._refresh();
            }
        });

        $.addEvent(this._node, 'click.ui.colorpicker', (_) => {
            if ($.getDataset(this._menuNode, 'uiAnimating') === 'in') {
                return;
            }

            if (!this._options.modal) {
                $.stop(this._menuNode);
                $.removeDataset(this._menuNode, 'uiAnimating');
            } else {
                this._activeTarget = this._node;
            }

            this.show();
        });

        if (!this._options.modal) {
            $.addEvent(this._node, 'focus.ui.colorpicker', (_) => {
                if (!$.isSame(this._node, document.activeElement)) {
                    return;
                }

                $.stop(this._menuNode);
                $.removeDataset(this._menuNode, 'uiAnimating');

                this.show();
            });
        }

        $.addEvent(this._node, 'keydown.ui.colorpicker', (e) => {
            switch (e.code) {
                case 'Enter':
                case 'NumpadEnter':
                    e.preventDefault();

                    this.toggle();
                    break;
                case 'Escape':
                    if ($.isConnected(this._menuNode)) {
                        // prevent node from closing modal
                        e.stopPropagation();

                        this.hide();
                    }
                    break;
                case 'Tab':
                    if (
                        e.shiftKey &&
                        !this._options.modal &&
                        $.isConnected(this._menuNode)
                    ) {
                        this.hide();
                    } else if (
                        !e.shiftKey &&
                        !this._options.modal &&
                        $.isConnected(this._menuNode) &&
                        !$.getDataset(this._menuNode, 'uiAnimating')
                    ) {
                        e.preventDefault();

                        $.focus(this._saturationGuide);
                    }
                    break;
            }
        });

        if (this._inputGroupColor) {
            $.addEvent(this._inputGroupColor, 'click.ui.colorpicker', (_) => {
                $.focus(this._node);
                this.toggle();
            });
        }
    }
    /**
     * Attach events for the Modal.
     */
    function _eventsModal() {
        let originalColor;
        this._keepColor = false;

        $.addEvent(this._modal, 'show.ui.modal', (_) => {
            if (!$.triggerOne(this._node, 'show.ui.colorpicker')) {
                return false;
            }

            originalColor = this._color;
        });

        $.addEvent(this._modal, 'shown.ui.modal', (_) => {
            $.focus(this._saturationGuide);

            $.triggerEvent(this._node, 'shown.ui.colorpicker');
        });

        $.addEvent(this._modal, 'hide.ui.modal', (_) => {
            if (!$.triggerOne(this._node, 'hide.ui.colorpicker')) {
                this._keepColor = false;
                return false;
            }

            this._activeTarget = null;

            this._values.saturation = 0;
            this._values.hue = 0;

            if (this._keepColor) {
                this._setColor(this._color);
            }
        });

        $.addEvent(this._modal, 'hidden.ui.modal', (_) => {
            if (!this._keepColor) {
                this._setColor(originalColor);
                originalColor = null;
            }

            this._keepColor = false;
            $.detach(this._modal);
            $.triggerEvent(this._node, 'hidden.ui.colorpicker');
        });

        $.addEvent(this._setBtn, 'click.ui.modal', (_) => {
            this._keepColor = true;
        });
    }

    /**
     * Get the color string.
     * @param {Color|null} color The Color.
     * @return {string} The color string.
     */
    function _getString(color) {
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
    }
    /**
     * Determine whether the input is editable.
     * @return {Boolean} TRUE if the input is editable, otherwise FALSE.
     */
    function _isEditable() {
        return !$.is(this._node, ':disabled') && (this._options.ignoreReadonly || !$.is(this._node, ':read-only'));
    }
    /**
     * Refresh the ColorPicker.
     * @param {object} options The options for setting the color.
     * @param {Boolean} [options.updateAttributes=true] Whether to update the input group.
     */
    function _refresh({ updateInputGroup = true } = {}) {
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
    }
    /**
     * Refresh the toggle disabled.
     */
    function _refreshDisabled() {
        const focusableNodes = $.find('[tabindex]', this._menuNode);

        if ($.is(this._node, ':disabled')) {
            $.addClass(this._menuNode, this.constructor.classes.disabled);
            $.setAttribute(focusableNodes, { tabindex: -1 });
        } else {
            $.removeClass(this._menuNode, this.constructor.classes.disabled);
            $.setAttribute(focusableNodes, { tabindex: 0 });
        }
    }
    /**
     * Set the current color.
     * @param {Color} color The new color.
     * @param {object} options The options for setting the color.
     * @param {Boolean} [options.updateAttributes=true] Whether to update the attributes.
     * @param {Boolean} [options.updateInputGroup=true] Whether to update the input group.
     * @param {Boolean} [options.updateValue=true] Whether to update the value.
     */
    function _setColor(color, { updateAttributes = true, updateInputGroup = true, updateValue = true } = {}) {
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
    }
    /**
     * Update the alpha for an X,Y position.
     * @param {number} x The X position.
     * @param {number} y The Y position.
     */
    function _updateAlpha(x, y) {
        const percent = this._options.horizontal ?
            $.percentX(this._alpha, x, { offset: true }) :
            $.percentY(this._alpha, y, { offset: true });

        this._values.alpha = 1 - (percent / 100);

        this._updateColor();
    }
    /**
     * Update the color attributes.
     */
    function _updateAttributes() {
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
    }
    /**
    /**
     * Update the color from attributes.
     */
    function _updateColor() {
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
    }
    /**
     * Update the hue for an X,Y position.
     * @param {number} x The X position.
     * @param {number} y The Y position.
     */
    function _updateHue(x, y) {
        const percent = this._options.horizontal ?
            $.percentX(this._hue, x, { offset: true }) :
            $.percentY(this._hue, y, { offset: true });

        this._values.hue = (100 - percent) * 3.6;

        this._updateColor();
    }
    /**
     * Update the saturation for an X,Y position.
     * @param {number} x The X position.
     * @param {number} y The Y position.
     */
    function _updateSaturation(x, y) {
        this._values.brightness = 100 - $.percentY(this._saturation, y, { offset: true });
        this._values.saturation = $.percentX(this._saturation, x, { offset: true });

        this._updateColor();
    }

    /**
     * Render the ColorPicker.
     */
    function _render() {
        this._menuNode = $.create('div', {
            class: this.constructor.classes.menu,
        });

        this._container = $.create('div', {
            class: this.constructor.classes.container,
        });
        $.append(this._menuNode, this._container);

        this._saturation = $.create('div', {
            class: this.constructor.classes.saturation,
        });
        $.append(this._container, this._saturation);

        this._saturationGuide = $.create('span', {
            class: this.constructor.classes.guide,
            attributes: {
                'role': 'slider',
                'tabindex': 0,
                'aria-label': this.constructor.lang.color,
            },
        });
        $.append(this._saturation, this._saturationGuide);

        this._hue = $.create('div', {
            class: this.constructor.classes.hue,
        });
        $.append(this._container, this._hue);

        this._hueGuide = $.create('span', {
            class: this.constructor.classes.guide,
            attributes: {
                'role': 'slider',
                'tabindex': 0,
                'aria-label': this.constructor.lang.hue,
            },
        });
        $.append(this._hue, this._hueGuide);

        if (this._options.alpha) {
            this._alpha = $.create('div', {
                class: this.constructor.classes.alpha,
            });
            $.append(this._container, this._alpha);

            this._alphaColor = $.create('div', {
                class: this.constructor.classes.alphaColor,
            });
            $.append(this._alpha, this._alphaColor);

            this._alphaGuide = $.create('span', {
                class: this.constructor.classes.guide,
                attributes: {
                    'role': 'slider',
                    'tabindex': 0,
                    'aria-label': this.constructor.lang.alpha,
                },
            });
            $.append(this._alpha, this._alphaGuide);
        }

        this._preview = $.create('div', {
            class: this.constructor.classes.preview,
        });
        $.append(this._menuNode, this._preview);

        this._previewColor = $.create('div');
        $.append(this._preview, this._previewColor);

        if (this._options.horizontal) {
            const spacing = this._options.modal ?
                this.constructor.classes.spacingModal :
                this.constructor.classes.spacingHorizontal;

            $.addClass(this._menuNode, this.constructor.classes.menuHorizontal);
            $.addClass(this._container, this.constructor.classes.containerHorizontal);
            $.addClass(this._hue, spacing);

            if (this._options.alpha) {
                $.addClass(this._alpha, spacing);
            }

            $.addClass(this._preview, spacing);
        } else {
            $.addClass(this._saturation, this.constructor.classes.spacingVertical);

            if (this._options.alpha) {
                $.addClass(this._hue, this.constructor.classes.spacingVertical);
            }

            $.addClass(this._preview, this.constructor.classes.spacingHorizontal);
        }

        if (this._options.modal) {
            $.addClass(this._menuNode, this.constructor.classes.menuModal);
        } else if (this._options.inline) {
            $.addClass(this._menuNode, this.constructor.classes.menuInline);

            $.after(this._node, this._menuNode);
            $.hide(this._node);
        } else {
            $.addClass(this._menuNode, this.constructor.classes.menuPadding);
            $.setAttribute(this._menuNode, {
                'role': 'dialog',
                'aria-modal': true,
            });
        }
    }
    /**
     * Render the Modal.
     */
    function _renderModal() {
        this._modal = $.create('div', {
            class: this.constructor.classes.modal,
            attributes: {
                'tabindex': -1,
                'role': 'dialog',
                'aria-modal': true,
            },
        });

        const modalDialog = $.create('div', {
            class: this.constructor.classes.modalDialog,
        });

        $.append(this._modal, modalDialog);

        const modalContent = $.create('div', {
            class: this.constructor.classes.modalContent,
        });

        $.append(modalDialog, modalContent);

        const modalBody = $.create('div', {
            class: this.constructor.classes.modalBody,
        });

        $.append(modalBody, this._menuNode);

        $.append(modalContent, modalBody);

        const modalFooter = $.create('div', {
            class: this.constructor.classes.modalFooter,
        });

        $.append(modalContent, modalFooter);

        const cancelBtn = $.create('button', {
            class: this.constructor.classes.modalBtnSecondary,
            text: this.constructor.lang.cancel,
            attributes: {
                'type': 'button',
                'data-ui-dismiss': 'modal',
            },
        });

        $.append(modalFooter, cancelBtn);

        this._setBtn = $.create('button', {
            class: this.constructor.classes.modalBtnPrimary,
            text: this.constructor.lang.set,
            attributes: {
                'type': 'button',
                'data-ui-dismiss': 'modal',
                'data-ui-set-color': 'true',
            },
        });

        $.append(modalFooter, this._setBtn);
    }

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
    ui.initComponent('colorpicker', ColorPicker);

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

    exports.ColorPicker = ColorPicker;

}));
//# sourceMappingURL=frost-ui-colorpicker.js.map
