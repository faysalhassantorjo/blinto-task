/**
 * Formats runtime minutes into hours and minutes, e.g. 148 -> "2h 28m"
 */
export function formatRuntime(minutes) {
  if (!minutes && minutes !== 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0 && remainingMinutes > 0) {
    return `${hours}h ${remainingMinutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  }
  return `${remainingMinutes}m`;
}

/**
 * Formats minutes into exact minutes label, e.g. "148 mins"
 */
export function formatExactMinutes(minutes) {
  if (!minutes && minutes !== 0) return '0 mins';
  return `${minutes} ${minutes === 1 ? 'min' : 'mins'}`;
}

/**
 * Formats an array of bundle sizes into a dot-separated string
 * e.g. [2, 5, 10] -> "2 seats · 5 seats · 10 seats"
 */
export function formatBundleSizes(sizes) {
  if (!sizes || sizes.length === 0) return 'None';
  return sizes
    .map(size => `${size} ${size === 1 ? 'seat' : 'seats'}`)
    .join(' · ');
}

/**
 * Formats a release year
 */
export function formatYear(year) {
  if (!year) return 'TBA';
  return String(year);
}
