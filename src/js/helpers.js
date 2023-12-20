import Color from '@fr0st/color';

/**
 * Format a number as a percent string.
 * @param {number} number The number.
 * @return {string} The percent string.
 */
export function formatPercent(number) {
    return Number(number).toLocaleString('en-US', { style: 'percent' });
};

/**
 * Get the color format from a value.
 * @param {string} value The color value.
 * @return {string|null} The color format.
 */
export function getFormat(value) {
    if (!value) {
        return null;
    }

    if (value.substring(0, 1) === '#') {
        return 'hex';
    }

    const format = value.substring(0, 3);

    if (['rgb', 'hsl'].includes(format)) {
        return format;
    }

    return null;
};

/**
 * Parse a Color from any value.
 * @param {string|Color} color The color to parse.
 * @return {Color} The parsed Color.
 */
export function parseColor(color) {
    if (!color) {
        return null;
    }

    if (color instanceof Color) {
        return color;
    }

    try {
        return Color.fromString(color);
    } catch (e) {
        return null;
    }
};
