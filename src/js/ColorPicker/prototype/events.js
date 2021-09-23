/**
 * ColorPicker Events
 */

Object.assign(ColorPicker.prototype, {

    /**
     * Attach events for the ColorPicker.
     */
    _events() {
        dom.addEvent(this._menuNode, 'contextmenu.ui.colorpicker', e => {
            // prevent menu node from showing right click menu
            e.preventDefault();
        });

        const saturationEvent = dom.mouseDragFactory(
            e => {
                if (e.button) {
                    return false;
                }
            },
            e => {
                const pos = UI.getPosition(e);
                this._updateSaturation(pos.x, pos.y);
            }
        );

        dom.addEvent(this._saturation, 'click.ui.colorpicker', e => {
            if (e.button) {
                return false;
            }

            const pos = UI.getPosition(e);
            this._updateSaturation(pos.x, pos.y);
        });

        dom.addEvent(this._saturation, 'mousedown.ui.colorpicker touchstart.ui.colorpicker', saturationEvent, { passive: true });

        const hueEvent = dom.mouseDragFactory(
            e => {
                if (e.button) {
                    return false;
                }
            },
            e => {
                const pos = UI.getPosition(e);
                this._updateHue(pos.x, pos.y);
            }
        );

        dom.addEvent(this._hue, 'click.ui.colorpicker', e => {
            if (e.button) {
                return false;
            }

            const pos = UI.getPosition(e);
            this._updateHue(pos.x, pos.y);
        });

        dom.addEvent(this._hue, 'mousedown.ui.colorpicker touchstart.ui.colorpicker', hueEvent, { passive: true });

        if (this._settings.alpha) {
            const alphaEvent = dom.mouseDragFactory(
                e => {
                    if (e.button) {
                        return false;
                    }
                },
                e => {
                    const pos = UI.getPosition(e);
                    this._updateAlpha(pos.x, pos.y);
                }
            );

            dom.addEvent(this._alpha, 'click.ui.colorpicker', e => {
                if (e.button) {
                    return false;
                }

                const pos = UI.getPosition(e);
                this._updateAlpha(pos.x, pos.y);
            });

            dom.addEvent(this._alpha, 'mousedown.ui.colorpicker touchstart.ui.colorpicker', alphaEvent, { passive: true });
        }

        dom.addEvent(this._node, 'change.ui.colorpicker', _ => {
            if (this._noChange) {
                return;
            }

            const value = dom.getValue(this._node);
            const color = this._parseColor(value);

            if (this._validColor) {
                this._setColor(color);
            }
        });

        if (this._settings.inline) {
            return;
        }

        dom.addEvent(this._menuNode, 'click.ui.colorpicker', e => {
            // prevent menu node from closing modal
            e.stopPropagation();
        });

        dom.addEvent(this._menuNode, 'mousedown.ui.colorpicker', e => {
            // prevent menu node from triggering blur event
            e.preventDefault();
        });

        dom.addEvent(this._node, 'focus.ui.colorpicker', _ => {
            if (!dom.isSame(this._node, document.activeElement)) {
                return;
            }

            dom.stop(this._menuNode);
            this._animating = false;

            this.show();
        });

        dom.addEvent(this._node, 'blur.ui.colorpicker', _ => {
            if (dom.isSame(this._node, document.activeElement)) {
                return;
            }

            dom.stop(this._menuNode);
            this._animating = false;

            this.hide();
        });

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

            // prevent node from closing modal
            e.stopPropagation();

            this.hide();
        });

        if (this._inputGroupColor) {
            dom.addEvent(this._inputGroupColor, 'mousedown.ui.colorpicker', e => {
                // prevent group color addon from triggering blur event
                e.preventDefault();
            });

            dom.addEvent(this._inputGroupColor, 'click.ui.colorpicker', _ => {
                dom.focus(this._node);
                this.toggle();
            });
        }
    }

});
