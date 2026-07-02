/**
 * FreshNaps — Volume-Based Mattress Pricing Utility
 *
 * The product's stored `price` represents the MRP for the reference size 72×72×5 (inches).
 * Any other L×W×T combination is priced proportionally by volume.
 * Non-standard (custom) sizes receive an additional 7 % surcharge.
 */

// All standard L×W sizes (inches) recognised by FreshNaps
const STANDARD_SIZES = [
  '72x35', '72x36', '72x48',
  '75x35', '75x36', '75x48',
  '78x35', '78x36', '78x48',
  '84x35', '84x36', '84x48',

  '72x70',
  '75x70',
  '78x70',
  '84x70',

  '72x72',
  '75x72',
  '78x72',
  '84x72',
];

// Reference volume — the base price corresponds to this size
const REF_LENGTH = 72;
const REF_WIDTH  = 72;
const REF_THICKNESS = 5;
const BASE_VOLUME = REF_LENGTH * REF_WIDTH * REF_THICKNESS;

/**
 * Calculate the mattress price for the given dimensions.
 *
 * @param {number} basePrice – MRP for the 72×72×5 reference size (product.price)
 * @param {number} L         – Length in inches
 * @param {number} B         – Width (breadth) in inches
 * @param {number} T         – Thickness in inches
 * @returns {number}         – Calculated price (rounded to nearest ₹)
 */
export function calculateFreshNapsPrice(basePrice, L, B, T) {
  if (!basePrice || !L || !B || !T) return 0;

  // Group equivalent sizes for pricing
  let finalL = (L === 70) ? 72 : L;
  let finalB = B;
  if (B === 35) finalB = 36;
  else if (B === 70) finalB = 72;

  // Check if the raw L×B is in the standard list
  const isCustom = !STANDARD_SIZES.includes(`${L}x${B}`);

  // Cubic rate derived from the base reference volume
  const cubicRate = basePrice / BASE_VOLUME;

  // Target volume
  const targetVolume = finalL * finalB * T;

  let calculatedPrice = targetVolume * cubicRate;

  // 7 % custom-size surcharge
  if (isCustom) {
    calculatedPrice *= 1.07;
  }

  return Math.round(calculatedPrice);
}

/**
 * Parse a mattress dimension string from the UI.
 * Handles formats like: '72"x36"', '72x36', '72"x36"'
 *
 * @param {string} sizeStr – e.g. '72"x36"'
 * @returns {{ length: number, width: number } | null}
 */
export function parseMattressDimensions(sizeStr) {
  if (!sizeStr) return null;
  // Strip quotes / inch marks, split on 'x'
  const cleaned = sizeStr.replace(/["″'']/g, '').trim();
  const parts = cleaned.split(/x/i);
  if (parts.length !== 2) return null;
  const length = parseInt(parts[0], 10);
  const width  = parseInt(parts[1], 10);
  if (isNaN(length) || isNaN(width)) return null;
  return { length, width };
}

/**
 * Check whether a given L×B is a standard size.
 */
export function isStandardSize(L, B) {
  return STANDARD_SIZES.includes(`${L}x${B}`);
}

export { STANDARD_SIZES, BASE_VOLUME, REF_LENGTH, REF_WIDTH, REF_THICKNESS };
