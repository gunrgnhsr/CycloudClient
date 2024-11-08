// src/utils/utils.js

/**
 * Calculates the total height of an element, including padding, border, and margin.
 * @param {HTMLElement} element - The DOM element to calculate the height for.
 * @returns {number} - The total height of the element.
 */
export const getTotalHeight = (element) => {
    if (element == null) return 0;

    const rect = element.getBoundingClientRect();
    const styles = window.getComputedStyle(element);

    const margin = parseFloat(styles.marginTop) + parseFloat(styles.marginBottom);
    const totalHeight = rect.height + margin;

    return totalHeight;
};

/**
 * Converts a base64 string to an ArrayBuffer.
 * @param {string} base64 - The base64 string to convert.
 * @returns {ArrayBuffer} - The ArrayBuffer representation of the base64 string.
 */
export const base64ToArrayBuffer = (base64) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}