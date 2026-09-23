import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a consistent HSL color from a string.
 * @param {string} str The string to generate a color from.
 * @param {number} saturation The saturation of the color (0-100).
 * @param {number} lightness The lightness of the color (0-100).
 * @returns {string} The HSL color string.
 */
export function generateHslColorFromString(str, saturation = 50, lightness = 60) {
  if (!str) {
    return `hsl(0, ${saturation}%, ${lightness}%)`;
  }

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash &= hash; // Convert to 32bit integer
  }

  const hue = hash % 360;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Gets the initials from a name string.
 * @param {string} name The name to get initials from.
 * @returns {string} The initials.
 */
export function getInitials(name) {
  if (!name) return '?';
  const nameParts = name.trim().split(' ');
  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase();
  }
  return (
    (nameParts[0].charAt(0) || '') + (nameParts[nameParts.length - 1].charAt(0) || '')
  ).toUpperCase();
}
