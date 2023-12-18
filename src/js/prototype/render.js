import $ from '@fr0st/query';

/**
 * Render the ColorPicker.
 */
export function _render() {
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

    this._saturationGuide = $.create('div', {
        class: this.constructor.classes.guide,
    });
    $.append(this._saturation, this._saturationGuide);

    this._hue = $.create('div', {
        class: this.constructor.classes.hue,
    });
    $.append(this._container, this._hue);

    this._hueGuide = $.create('div', {
        class: this.constructor.classes.guide,
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

        this._alphaGuide = $.create('div', {
            class: this.constructor.classes.guide,
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
        $.addClass(this._menuNode, this.constructor.classes.menuHorizontal);
        $.addClass(this._container, this.constructor.classes.containerHorizontal);
        $.addClass(this._hue, this.constructor.classes.spacingHorizontal);

        if (this._options.alpha) {
            $.addClass(this._alpha, this.constructor.classes.spacingHorizontal);
        }
    } else {
        $.addClass(this._saturation, this.constructor.classes.spacingVertical);

        if (this._options.alpha) {
            $.addClass(this._hue, this.constructor.classes.spacingVertical);
        }
    }

    if (this._options.modal) {
        $.addClass(this._menuNode, 'colorpicker-modal');
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
};

/**
 * Render the Modal.
 */
export function _renderModal() {
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

    const btnContainer = $.create('div', {
        class: this.constructor.classes.modalBtnContainer,
    });

    $.append(modalBody, btnContainer);

    const cancelBtn = $.create('button', {
        class: this.constructor.classes.modalBtnSecondary,
        text: 'Cancel',
        attributes: {
            'type': 'button',
            'data-ui-dismiss': 'modal',
        },
    });

    $.append(btnContainer, cancelBtn);

    this._setBtn = $.create('button', {
        class: this.constructor.classes.modalBtnPrimary,
        text: 'Set',
        attributes: {
            'type': 'button',
            'data-ui-dismiss': 'modal',
            'data-ui-set-color': 'true',
        },
    });

    $.append(btnContainer, this._setBtn);

    $.append(modalContent, modalBody);
};
