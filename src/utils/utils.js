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