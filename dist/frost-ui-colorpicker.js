/**
 * FrostUI-ColorPicker v1.0
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

            // destroy nodes

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
                dom.append(document.body, this._menuNode);
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


    // ColorPicker events
    dom.addEvent(document, 'click.ui.colorpicker', e => {
        const target = UI.getClickTarget(e);
        const menus = dom.find('.colorpicker:not(.colorpicker-inline)');

        for (const menu of menus) {
            const trigger = ColorPicker._triggers.get(menu);

            if (dom.isSame(target, trigger) || dom.hasDescendent(menu, target)) {
                continue;
            }

            const colorpicker = ColorPicker.init(trigger);
            colorpicker.hide();
        }
    });


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


    /**
     * ColorPicker Events
     */

    Object.assign(ColorPicker.prototype, {

        /**
         * Attach events for the ColorPicker.
         */
        _events() {
            if (this._settings.showOnFocus) {
                dom.addEvent(this._node, 'focus.ui.colorpicker', _ => {
                    this.show();
                });
            }

            dom.addEvent(this._node, 'keydown.ui.colorpicker', e => {
                switch (e.code) {
                    case 'Enter':
                        e.preventDefault();
                        return this.toggle();
                    case 'Escape':
                    case 'Tab':
                        return this.hide();
                    default:
                        return;
                }
            });

            dom.addEvent(this._container, 'click.ui.colorpicker mousedown.ui.colorpicker', e => {
                e.preventDefault();
                e.stopPropagation();
            });

            const saturationEvent = dom.mouseDragFactory(
                e => {
                    if (e.button) {
                        return false;
                    }
                },
                e => {
                    this._updateSaturation(e.pageX, e.pageY);
                }
            );

            dom.addEvent(this._saturation, 'click.ui.colorpicker', e => {
                if (e.button) {
                    return false;
                }

                this._updateSaturation(e.pageX, e.pageY);
                dom.focus(this._saturationGuide);
            });
            dom.addEvent(this._saturation, 'mousedown.ui.colorpicker touchstart.ui.colorpicker', saturationEvent);

            const getKeyPosition = e => {
                const position = dom.center(e.target, true);

                switch (e.key) {
                    case 'ArrowUp':
                        position.y--;
                        break;
                    case 'ArrowRight':
                        position.x++;
                        break;
                    case 'ArrowDown':
                        position.y++;
                        break;
                    case 'ArrowLeft':
                        position.x--;
                        break;
                    default:
                        return null;
                }

                return position;
            };

            dom.addEvent(this._saturationGuide, 'keydown.ui.colorpicker', DOM.debounce(e => {
                const position = getKeyPosition(e);

                if (!position) {
                    return;
                }

                this._updateSaturation(position.x, position.y);
            }));

            const hueEvent = dom.mouseDragFactory(
                e => {
                    if (e.button) {
                        return false;
                    }
                },
                e => {
                    this._updateHue(e.pageX, e.pageY);
                }
            );

            dom.addEvent(this._hue, 'click.ui.colorpicker', e => {
                if (e.button) {
                    return false;
                }

                this._updateHue(e.pageX, e.pageY);
                dom.focus(this._hueGuide);
            });
            dom.addEvent(this._hue, 'mousedown.ui.colorpicker touchstart.ui.colorpicker', hueEvent);

            dom.addEvent(this._hueGuide, 'keydown.ui.colorpicker', DOM.debounce(e => {
                const position = getKeyPosition(e);

                if (!position) {
                    return;
                }

                this._updateHue(position.x, position.y);
            }));

            if (this._settings.alpha) {
                const alphaEvent = dom.mouseDragFactory(
                    e => {
                        if (e.button) {
                            return false;
                        }
                    },
                    e => {
                        this._updateAlpha(e.pageX, e.pageY);
                    }
                );

                dom.addEvent(this._alpha, 'click.ui.colorpicker', e => {
                    if (e.button) {
                        return false;
                    }

                    this._updateAlpha(e.pageX, e.pageY);
                    dom.focus(this._alphaGuide);
                });
                dom.addEvent(this._alpha, 'mousedown.ui.colorpicker touchstart.ui.colorpicker', alphaEvent);

                dom.addEvent(this._alphaGuide, 'keydown.ui.colorpicker', DOM.debounce(e => {
                    const position = getKeyPosition(e);

                    if (!position) {
                        return;
                    }

                    this._updateAlpha(position.x, position.y);
                }));
            }

            dom.addEvent(this._node, 'input.ui.color change.ui.color', _ => {
                const value = dom.getValue(this._node);
                const color = this._parseColor(value);

                if (this._validColor) {
                    this._setColor(color);
                }
            });
        }

    });


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
                old: this._color ?
                    this._color.clone() :
                    null,
                new: color ?
                    color.clone() :
                    null
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


    /**
     * ColorPicker Native
     */

    Object.assign(ColorPicker.prototype, {

        _disposeNative() {
            const id = dom.getAttribute(this._nativeInput, 'id');

            if (id) {
                dom.setAttribute(this._node, id);
            }

            dom.remove(this._nativeInput);
            dom.show(this._node);

            super.dispose();
        },

        _eventsNative() {
            dom.addEvent(this._nativeInput, 'change.ui.colorpicker', _ => {
                const value = dom.getValue(this._nativeInput);
                const date = value ?
                    Color.fromString(value) :
                    null;
                this._setColor(date);
            });
        },

        _renderNative() {
            const attributes = { type: 'color' };

            const id = dom.getAttribute(this._node, 'id');

            if (id) {
                attributes.id = id;
                dom.removeAttribute(this._node, 'id');
            }

            this._nativeInput = dom.create('input', {
                class: dom.getAttribute(this._node, 'class'),
                attributes
            });

            if (this._color) {
                this._updateNativeColor();
            }

            dom.before(this._node, this._nativeInput);
            dom.hide(this._node);
        },

        /**
         * Update the native color.
         */
        _updateNativeColor() {
            dom.setValue(this._nativeInput, `${this._color}`);
        }

    });


    /**
     * ColorPicker Render
     */

    Object.assign(ColorPicker.prototype, {

        /**
         * Refresh the ColorPicker.
         */
        _refresh() {
            const saturationColor = Color.fromHSV(this._values.hue, 100, 100);
            dom.setStyle(this._saturation, {
                backgroundColor: saturationColor
            });

            dom.setStyle(this._saturationGuide, {
                top: `${100 - this._values.brightness}%`,
                left: `${this._values.saturation}%`
            });

            const hueOffset = `${100 - (this._values.hue / 3.6)}%`;
            if (this._settings.horizontal) {
                dom.setStyle(this._hueGuide, { left: hueOffset });
            } else {
                dom.setStyle(this._hueGuide, { top: hueOffset });
            }

            if (this._settings.alpha) {
                const alphaColor = Color.fromHSV(this._values.hue, this._values.saturation, this._values.brightness);
                let direction = this._settings.horizontal ?
                    'to right,' :
                    '';
                dom.setStyle(this._alphaColor, {
                    background: `linear-gradient(${direction}${alphaColor} 0%, transparent 100%)`
                });

                const alphaOffset = `${100 - (this._values.alpha * 100)}%`;
                if (this._settings.horizontal) {
                    dom.setStyle(this._alphaGuide, { left: alphaOffset });
                } else {
                    dom.setStyle(this._alphaGuide, { top: alphaOffset });
                }
            }

            dom.setStyle(this._previewColor, {
                backgroundColor: this._color
            });

            if (this._inputGroupColor) {
                dom.setStyle(this._inputGroupColor, {
                    backgroundColor: this._color
                });
            }
        },

        /**
         * Render the ColorPicker.
         */
        _render() {
            this._menuNode = dom.create('div', {
                class: this.constructor.classes.menu
            });

            this.constructor._triggers.set(this._menuNode, this._node);

            this._container = dom.create('div', {
                class: this.constructor.classes.container
            });
            dom.append(this._menuNode, this._container);

            this._saturation = dom.create('div', {
                class: this.constructor.classes.saturation
            });
            dom.append(this._container, this._saturation);

            this._saturationGuide = dom.create('button', {
                class: this.constructor.classes.guide
            });
            dom.append(this._saturation, this._saturationGuide);

            this._hue = dom.create('div', {
                class: this.constructor.classes.hue
            });
            dom.append(this._container, this._hue);

            this._hueGuide = dom.create('button', {
                class: this.constructor.classes.guide
            });
            dom.append(this._hue, this._hueGuide);

            if (this._settings.alpha) {
                this._alpha = dom.create('div', {
                    class: this.constructor.classes.alpha
                });
                dom.append(this._container, this._alpha);

                this._alphaColor = dom.create('div', {
                    class: this.constructor.classes.alphaColor
                });
                dom.append(this._alpha, this._alphaColor);

                this._alphaGuide = dom.create('button', {
                    class: this.constructor.classes.guide
                });
                dom.append(this._alpha, this._alphaGuide);
            }

            this._preview = dom.create('div', {
                class: this.constructor.classes.preview
            });
            dom.append(this._menuNode, this._preview);

            this._previewColor = dom.create('div');
            dom.append(this._preview, this._previewColor);

            if (this._settings.horizontal) {
                dom.addClass(this._menuNode, this.constructor.classes.menuHorizontal);
                dom.addClass(this._container, this.constructor.classes.containerHorizontal);
                dom.addClass(this._hue, this.constructor.classes.spacingHorizontal);

                if (this._settings.alpha) {
                    dom.addClass(this._alpha, this.constructor.classes.spacingHorizontal);
                }
            } else {
                dom.addClass(this._saturation, this.constructor.classes.spacingVertical);

                if (this._settings.alpha) {
                    dom.addClass(this._hue, this.constructor.classes.spacingVertical);
                }
            }

            if (this._settings.inline) {
                dom.addClass(this._menuNode, this.constructor.classes.menuInline);

                dom.after(this._node, this._menuNode);
                dom.hide(this._node);
            } else {
                dom.addClass(this._menuNode, this.constructor.classes.menuPadding);
                dom.addClass(this._menuNode, this.constructor.classes.menuShadow);

                this._popper = new UI.Popper(
                    this._menuNode,
                    {
                        reference: this._node,
                        placement: this._settings.placement,
                        position: this._settings.position,
                        fixed: this._settings.fixed,
                        spacing: this._settings.spacing,
                        minContact: this._settings.minContact
                    }
                );
            }
        }

    });


    // ColorPicker default options
    ColorPicker.defaults = {
        format: 'auto',
        defaultColor: null,
        alpha: true,
        showOnFocus: true,
        focusOnShow: true,
        inline: false,
        horizontal: false,
        keepInvalid: true,
        ignoreReadonly: false,
        mobileNative: true,
        duration: 100,
        appendTo: null,
        placement: 'bottom',
        position: 'start',
        fixed: false,
        spacing: 0,
        minContact: false
    };

    // Default classes
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
        menuPadding: 'p-2',
        menuShadow: 'shadow-sm',
        preview: 'colorpicker-bar colorpicker-preview mt-2',
        saturation: 'colorpicker-saturation',
        spacingHorizontal: 'mt-2',
        spacingVertical: 'me-2'
    };

    ColorPicker._triggers = new WeakMap();

    UI.initComponent('colorpicker', ColorPicker);

    UI.ColorPicker = ColorPicker;

});