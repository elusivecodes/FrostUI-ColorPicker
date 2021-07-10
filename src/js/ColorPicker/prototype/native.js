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
