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
