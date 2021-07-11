/**
 * ColorPicker Events
 */

Object.assign(ColorPicker.prototype, {

    /**
     * Attach events for the ColorPicker.
     */
    _events() {
        dom.addEvent(this._menuNode, 'contextmenu.ui.datetimepicker', e => {
            // prevent menu node from showing right click menu
            e.preventDefault();
        });

        dom.addEvent(this._menuNode, 'mousedown.ui.datetimepicker', e => {
            if (this._settings.inline) {
                return;
            }

            // prevent menu node from triggering blur event
            e.preventDefault();
        });

        dom.addEvent(this._container, 'click.ui.datetimepicker', e => {
            // prevent menu node from closing modal
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
        });
        dom.addEvent(this._saturation, 'mousedown.ui.colorpicker touchstart.ui.colorpicker', saturationEvent);

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
        });
        dom.addEvent(this._hue, 'mousedown.ui.colorpicker touchstart.ui.colorpicker', hueEvent);

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
            });
            dom.addEvent(this._alpha, 'mousedown.ui.colorpicker touchstart.ui.colorpicker', alphaEvent);
        }

        dom.addEvent(this._node, 'input.ui.color change.ui.color', _ => {
            const value = dom.getValue(this._node);
            const color = this._parseColor(value);

            if (this._validColor) {
                this._setColor(color);
            }
        });

        dom.addEvent(this._node, 'blur.ui.datetimepicker', _ => {
            if (dom.isSame(this._node, document.activeElement)) {
                return;
            }

            this.hide();
        });

        if (this._settings.showOnFocus) {
            dom.addEvent(this._node, 'focus.ui.colorpicker', _ => {
                if (!dom.isSame(this._node, document.activeElement)) {
                    return;
                }

                this.show();
            });
        }

        if (!this._settings.inline) {
            dom.addEvent(this._node, 'keydown.ui.colorpicker', e => {
                if (e.code !== 'Enter') {
                    return;
                }

                e.preventDefault();
                this.toggle();
            });

            dom.addEvent(this._node, 'keyup.ui.colorpicker', e => {
                if (e.code !== 'Escape' || !dom.isConnected(this._menuNode)) {
                    return;
                }

                e.stopPropagation();
                this.hide();
            });
        }
    }

});
