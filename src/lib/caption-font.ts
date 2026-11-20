/**
 * Glyph coverage of the bundled Noto Sans Regular (Latin, Greek, Cyrillic).
 * Generated from the font cmap. Characters outside these ranges are not in the file.
 */
export const CAPTION_FONT_FAMILY = "Noto Sans";

const RANGES: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [13, 13],
  [32, 126],
  [160, 887],
  [890, 895],
  [900, 906],
  [908, 908],
  [910, 929],
  [931, 993],
  [1008, 1327],
  [6832, 6848],
  [7296, 7304],
  [7424, 7673],
  [7675, 7957],
  [7960, 7965],
  [7968, 8005],
  [8008, 8013],
  [8016, 8023],
  [8025, 8025],
  [8027, 8027],
  [8029, 8029],
  [8031, 8061],
  [8064, 8116],
  [8118, 8132],
  [8134, 8147],
  [8150, 8155],
  [8157, 8175],
  [8178, 8180],
  [8182, 8190],
  [8192, 8292],
  [8294, 8305],
  [8308, 8334],
  [8336, 8348],
  [8352, 8383],
  [8432, 8432],
  [8448, 8543],
  [8580, 8580],
  [8585, 8585],
  [9676, 9676],
  [11360, 11391],
  [11744, 11858],
  [42560, 42655],
  [42752, 42943],
  [42946, 42954],
  [42997, 43007],
  [43310, 43310],
  [43824, 43883],
  [64256, 64262],
  [65024, 65024],
  [65056, 65071],
  [65279, 65279],
  [65532, 65533],
];

export function captionFontCovers(codePoint: number): boolean {
  let lo = 0;
  let hi = RANGES.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const [start, end] = RANGES[mid];
    if (codePoint < start) hi = mid - 1;
    else if (codePoint > end) lo = mid + 1;
    else return true;
  }
  return false;
}

/** Unique characters the bundled font cannot draw, capped so the warning stays short. */
export function unsupportedCaptionGlyphs(text: string, limit = 24): string[] {
  const seen = new Set<number>();
  const out: string[] = [];
  for (const char of text) {
    const codePoint = char.codePointAt(0) ?? 0;
    if (codePoint <= 32 || codePoint === 0xfeff) continue;
    if (captionFontCovers(codePoint) || seen.has(codePoint)) continue;
    seen.add(codePoint);
    out.push(char);
    if (out.length >= limit) break;
  }
  return out;
}
