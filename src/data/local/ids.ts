/**
 * Deterministic UUID derived from a string (used for stable seed IDs). Uses the
 * cyrb128 hash to produce 128 bits, then formats them as a syntactically valid
 * v5-style UUID. Not cryptographic, but stable and collision-safe for seeds.
 */
export function uuidFromString(input: string): string {
  const [a, b, c, d] = cyrb128(input);
  const h = (n: number) => (n >>> 0).toString(16).padStart(8, '0');
  const hex = h(a) + h(b) + h(c) + h(d); // 32 hex chars
  const version = '5' + hex.slice(13, 16);
  const variantNibble = ((parseInt(hex[16] ?? '0', 16) & 0x3) | 0x8).toString(16);
  const variant = variantNibble + hex.slice(17, 20);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${version}-${variant}-${hex.slice(20, 32)}`;
}

/** cyrb128: fast 128-bit string hash (public-domain algorithm). */
function cyrb128(str: string): [number, number, number, number] {
  let h1 = 1779033703;
  let h2 = 3144134277;
  let h3 = 1013904242;
  let h4 = 2773480762;
  for (let i = 0; i < str.length; i++) {
    const k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  h1 ^= h2 ^ h3 ^ h4;
  return [h1, h2, h3, h4];
}
