/**
 * Smart text utilities for CrazyGrowMind Studio.
 */

/**
 * Truncate a string to a max length without cutting off words in the middle.
 * This guarantees "proper words" are displayed in the UI instead of broken syllables.
 * 
 * @param {string} str - The target string to truncate
 * @param {number} maxLength - The maximum character length permitted
 * @returns {string} - The safely truncated string ending with an ellipsis if shortened
 */
export function truncateToWordBoundary(str, maxLength) {
  if (!str) return "";
  if (str.length <= maxLength) return str;
  
  // Slice to max length
  const sub = str.substring(0, maxLength);
  
  // Find the last index of space to break on a full word
  const lastSpace = sub.lastIndexOf(" ");
  
  if (lastSpace > 0) {
    return sub.substring(0, lastSpace) + "...";
  }
  
  return sub + "...";
}
