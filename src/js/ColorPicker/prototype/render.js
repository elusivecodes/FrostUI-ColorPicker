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

        this._container = dom.create('div', {
            class: this.constructor.classes.container
        });
        dom.append(this._menuNode, this._container);

        this._saturation = dom.create('div', {
            class: this.constructor.classes.saturation
        });
        dom.append(this._container, this._saturation);

        this._saturationGuide = dom.create('div', {
            class: this.constructor.classes.guide
        });
        dom.append(this._saturation, this._saturationGuide);

        this._hue = dom.create('div', {
            class: this.constructor.classes.hue
        });
        dom.append(this._container, this._hue);

        this._hueGuide = dom.create('div', {
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

            this._alphaGuide = dom.create('div', {
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
