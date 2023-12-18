import $ from '@fr0st/query';
import { getPosition } from '@fr0st/ui';
import { parseColor } from './../helpers.js';

/**
 * Attach events for the ColorPicker.
 */
export function _events() {
    $.addEvent(this._menuNode, 'contextmenu.ui.colorpicker', (e) => {
        // prevent menu node from showing right click menu
        e.preventDefault();
    });

    const saturationDownEvent = (e) => {
        if (e.button) {
            return false;
        }
    };

    const saturationMoveEvent = (e) => {
        const pos = getPosition(e);
        this._updateSaturation(pos.x, pos.y);
    };

    const saturationDragEvent = $.mouseDragFactory(saturationDownEvent, saturationMoveEvent);

    $.addEvent(this._saturation, 'mousedown.ui.colorpicker touchstart.ui.colorpicker', saturationDragEvent);

    $.addEvent(this._saturation, 'click.ui.colorpicker', (e) => {
        if (e.button) {
            return false;
        }

        const pos = getPosition(e);
        this._updateSaturation(pos.x, pos.y);
    });

    const hueDownEvent = (e) => {
        if (e.button) {
            return false;
        }
    };

    const hueMoveEvent = (e) => {
        const pos = getPosition(e);
        this._updateHue(pos.x, pos.y);
    };

    const hueDragEvent = $.mouseDragFactory(hueDownEvent, hueMoveEvent);

    $.addEvent(this._hue, 'mousedown.ui.colorpicker touchstart.ui.colorpicker', hueDragEvent);

    $.addEvent(this._hue, 'click.ui.colorpicker', (e) => {
        if (e.button) {
            return false;
        }

        const pos = getPosition(e);
        this._updateHue(pos.x, pos.y);
    });

    if (this._options.alpha) {
        const alphaDownEvent = (e) => {
            if (e.button) {
                return false;
            }
        };

        const alphaMoveEvent = (e) => {
            const pos = getPosition(e);
            this._updateAlpha(pos.x, pos.y);
        };

        const alphaDragEvent = $.mouseDragFactory(alphaDownEvent, alphaMoveEvent);

        $.addEvent(this._alpha, 'mousedown.ui.colorpicker touchstart.ui.colorpicker', alphaDragEvent);

        $.addEvent(this._alpha, 'click.ui.colorpicker', (e) => {
            if (e.button) {
                return false;
            }

            const pos = getPosition(e);
            this._updateAlpha(pos.x, pos.y);
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
            this._color = this._defaultColor;
            this._updateAttributes();
            this._refresh();
        }
    });

    if (this._options.inline) {
        return;
    }

    $.addEvent(this._menuNode, 'click.ui.colorpicker', (e) => {
        // prevent menu node from closing modal
        e.stopPropagation();
    });

    $.addEvent(this._menuNode, 'mousedown.ui.colorpicker', (e) => {
        // prevent menu node from triggering blur event
        e.preventDefault();
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

        $.addEvent(this._node, 'blur.ui.colorpicker', (_) => {
            if ($.isSame(this._node, document.activeElement)) {
                return;
            }

            if ($.getDataset(this._menuNode, 'uiAnimating') === 'out') {
                return;
            }

            $.stop(this._menuNode);
            $.removeDataset(this._menuNode, 'uiAnimating');

            this.hide();
        });
    }

    $.addEvent(this._node, 'keydown.ui.colorpicker', (e) => {
        switch (e.code) {
            case 'Enter':
            case 'NumpadEnter':
                e.preventDefault();

                this.toggle();
                break;
        }
    });

    $.addEvent(this._node, 'keyup.ui.colorpicker', (e) => {
        if (e.code !== 'Escape' || !$.isConnected(this._menuNode)) {
            return;
        }

        // prevent node from closing modal
        e.stopPropagation();

        this.hide();
    });

    if (this._inputGroupColor) {
        $.addEvent(this._inputGroupColor, 'mousedown.ui.colorpicker', (e) => {
            // prevent group color addon from triggering blur event
            e.preventDefault();
        });

        $.addEvent(this._inputGroupColor, 'click.ui.colorpicker', (_) => {
            $.focus(this._node);
            this.toggle();
        });
    }
};

/**
 * Attach events for the Modal.
 */
export function _eventsModal() {
    let originalValue;
    let keepColor = false;

    $.addEvent(this._modal, 'show.ui.modal', (_) => {
        if (!$.triggerOne(this._node, 'show.ui.colorpicker')) {
            return false;
        }

        originalValue = $.getValue(this._node);
    });

    $.addEvent(this._modal, 'shown.ui.modal', (_) => {
        $.triggerEvent(this._node, 'shown.ui.colorpicker');
    });

    $.addEvent(this._modal, 'hide.ui.modal', (_) => {
        if (!$.triggerOne(this._node, 'hide.ui.colorpicker')) {
            keepColor = false;
            return false;
        }

        this._activeTarget = null;

        if (!keepColor) {
            $.setValue(this._node, originalValue);
            $.triggerEvent(this._node, 'change.ui.colorpicker');
        }
    });

    $.addEvent(this._modal, 'hidden.ui.modal', (_) => {
        keepColor = false;
        $.detach(this._modal);
        $.triggerEvent(this._node, 'hidden.ui.colorpicker');
    });

    $.addEvent(this._setBtn, 'click.ui.modal', (_) => {
        keepColor = true;
    });
};
