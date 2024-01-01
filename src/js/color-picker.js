import Color from '@fr0st/color';
import $ from '@fr0st/query';
import { BaseComponent, Modal, Popper } from '@fr0st/ui';
import { getFormat, parseColor } from './helpers.js';

/**
 * ColorPicker Class
 * @class
 */
export default class ColorPicker extends BaseComponent {
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

        if (!this._color && value && !this._options.keepInvalid) {
            this._color = this._defaultColor;
        }

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

        if (this._color) {
            const newValue = this._getString(this._color);
            $.setValue(this._node, newValue);
        }

        this._render();
        this._events();

        if (this._options.modal) {
            this._renderModal();
            this._eventsModal();
        }

        $.setData(this._menuNode, { input: this._node });

        this._values = {
            alpha: 1,
            brightness: 0,
            hue: 0,
            saturation: 0,
        };

        this._updateAttributes();
        this._refresh();
        this._refreshDisabled();
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
            Modal.init(this._modal).dispose();
            this._modal = null;
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
        this._dateOptions = null;
        this._modal = null;
        this._setBtn = null;

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
            Modal.init(this._modal).hide();
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

        const focusableNodes = $.find('[tabindex="0"]', this._menuNode);
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

            const modal = Modal.init(this._modal);

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

        const focusableNodes = $.find('[tabindex="-1"]', this._menuNode);
        $.setAttribute(focusableNodes, { tabindex: 0 });

        if (this._options.appendTo) {
            $.append(this._options.appendTo, this._menuNode);
        } else {
            $.after(this._node, this._menuNode);
        }

        this._popper = new Popper(
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
