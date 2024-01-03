import $ from '@fr0st/query';
import { getPosition } from '@fr0st/ui';
import { parseColor } from './../helpers.js';

/**
 * Attach events for the ColorPicker.
 */
export function _events() {
    const saturationDownEvent = (e) => {
        if (e.button) {
            return false;
        }

        $.focus(this._saturationGuide);
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
};

/**
 * Attach events for the Modal.
 */
export function _eventsModal() {
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
};
