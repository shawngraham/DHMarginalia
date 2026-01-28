/**
 * Fuzzy date parser for DH-style date strings.
 * Handles: "c. 1850", "1850?", "1850-06", "Winter 1914", plain years, ISO dates.
 * Returns a Date object (midpoint estimate) or null if unparseable.
 */

const SEASON_MAP = {
  spring: 3,
  summer: 6,
  autumn: 9,
  fall: 9,
  winter: 0,
};

const MONTH_MAP = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, september: 8, sept: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

/**
 * Parse a fuzzy date string into a Date object.
 * @param {string} input - The date string to parse.
 * @returns {{ date: Date|null, approximate: boolean, original: string }}
 */
export function parseFuzzyDate(input) {
  if (input == null) return { date: null, approximate: false, original: String(input) };

  const raw = String(input).trim();
  if (!raw) return { date: null, approximate: false, original: raw };

  let approximate = false;
  let cleaned = raw;

  // Strip approximate markers
  if (/^c\.\s*/i.test(cleaned) || /^circa\s+/i.test(cleaned) || /\?$/.test(cleaned) || /^~/.test(cleaned) || /^\[.*\]$/.test(cleaned)) {
    approximate = true;
    cleaned = cleaned
      .replace(/^c\.\s*/i, '')
      .replace(/^circa\s+/i, '')
      .replace(/\?$/, '')
      .replace(/^~/, '')
      .replace(/^\[/, '').replace(/\]$/, '')
      .trim();
  }

  // Season/Month + Year: "Winter 1914", "March 1850" — check before ISO to avoid
  // Date.parse interpreting season names as valid dates with wrong results.
  const seasonMatch = cleaned.match(/^(\w+)\s+(\d{4})$/i);
  if (seasonMatch) {
    const season = seasonMatch[1].toLowerCase();
    const year = parseInt(seasonMatch[2], 10);
    if (SEASON_MAP[season] !== undefined) {
      return { date: new Date(year, SEASON_MAP[season], 1), approximate: true, original: raw };
    }
    if (MONTH_MAP[season] !== undefined) {
      return { date: new Date(year, MONTH_MAP[season], 1), approximate, original: raw };
    }
  }

  // Try ISO / standard date first
  const iso = Date.parse(cleaned);
  if (!isNaN(iso) && cleaned.length > 4) {
    return { date: new Date(iso), approximate, original: raw };
  }

  // Year-Month: "1850-06"
  const ymMatch = cleaned.match(/^(\d{4})-(\d{1,2})$/);
  if (ymMatch) {
    const year = parseInt(ymMatch[1], 10);
    const month = parseInt(ymMatch[2], 10) - 1;
    return { date: new Date(year, month, 1), approximate, original: raw };
  }

  // Plain year: "1850"
  const yearMatch = cleaned.match(/^(\d{4})$/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1], 10);
    return { date: new Date(year, 6, 1), approximate: true, original: raw };
  }

  // Fallback: unparseable
  return { date: null, approximate, original: raw };
}

/**
 * Parse all dates in an array, returning results with indices.
 */
export function parseDateColumn(values) {
  return values.map((v, i) => ({ index: i, ...parseFuzzyDate(v) }));
}
