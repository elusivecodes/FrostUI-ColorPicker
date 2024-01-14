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
};
