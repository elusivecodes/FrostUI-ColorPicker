// ColorPicker default options
ColorPicker.defaults = {
    format: 'auto',
    defaultColor: null,
    alpha: true,
    showOnFocus: true,
    focusOnShow: true,
    inline: false,
    horizontal: false,
    keepInvalid: true,
    ignoreReadonly: false,
    mobileNative: true,
    duration: 100,
    appendTo: null,
    placement: 'bottom',
    position: 'start',
    fixed: false,
    spacing: 0,
    minContact: false
};

// Default classes
ColorPicker.classes = {
    alpha: 'colorpicker-alpha flex-grow-1',
    alphaColor: 'colorpicker-alpha-color',
    container: 'd-flex justify-content-between',
    containerHorizontal: 'flex-column',
    disabled: 'colorpicker-disabled',
    guide: 'colorpicker-guide',
    hue: 'colorpicker-hue flex-grow-1',
    menu: 'colorpicker',
    menuHorizontal: 'colorpicker-horizontal',
    menuInline: 'colorpicker-inline',
    menuPadding: 'p-2',
    menuShadow: 'shadow-sm',
    preview: 'colorpicker-bar colorpicker-preview mt-2',
    saturation: 'colorpicker-saturation',
    spacingHorizontal: 'mt-2',
    spacingVertical: 'me-2'
};

UI.initComponent('colorpicker', ColorPicker);

UI.ColorPicker = ColorPicker;
