// ColorPicker events
dom.addEvent(document, 'click.ui.colorpicker', e => {
    const target = UI.getClickTarget(e);
    const menus = dom.find('.colorpicker:not(.colorpicker-inline)');

    for (const menu of menus) {
        const trigger = ColorPicker._triggers.get(menu);

        if (dom.isSame(target, trigger) || dom.hasDescendent(menu, target)) {
            continue;
        }

        const colorpicker = ColorPicker.init(trigger);
        colorpicker.hide();
    }
});
