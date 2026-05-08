const COMMON_DENOMINATION_WORDS = [
  "church",
  "ministry",
  "ministries",
  "congregation",
  "chapel",
  "international",
  "assembly",
  "fellowship",
  "center",
  "centre",
];

const DENOMINATION_ALIAS_PATTERNS: Array<{
  canonical: string;
  pattern: RegExp;
}> = [
  { canonical: "Peniel", pattern: /\bpeni[el]{1,2}\b/ },
  { canonical: "Catholic", pattern: /\bcatholic\b/ },
  { canonical: "Pentecost", pattern: /\bpentecost|cop\b/ },
  { canonical: "Methodist", pattern: /\bmethodist\b/ },
  { canonical: "Presbyterian", pattern: /\bpresby|pcg\b/ },
  { canonical: "Baptist", pattern: /\bbaptist\b/ },
  { canonical: "Charismatic", pattern: /\bcharis|charismatic\b/ },
];

const REFERRAL_ALIAS_PATTERNS: Array<{
  canonical: string;
  pattern: RegExp;
}> = [
  { canonical: "Social Media", pattern: /\bsocial|instagram|facebook|tiktok|x\b|whatsapp\b/ },
  { canonical: "Friends or Family", pattern: /\bfriend|family|relative|colleague\b/ },
  { canonical: "Church Announcement", pattern: /\bchurch|announcement|pastor|service\b/ },
  { canonical: "Other", pattern: /\bother|others\b/ },
];

export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function normalizeToken(value: string): string {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "");
}

function titleCase(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function stripCommonWords(value: string): string {
  return value
    .split(" ")
    .filter((word) => !COMMON_DENOMINATION_WORDS.includes(word))
    .join(" ")
    .trim();
}

function levenshteinDistance(a: string, b: string): number {
  if (!a) return b.length;
  if (!b) return a.length;

  const matrix = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0),
  );

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[a.length][b.length];
}

function bigrams(value: string): string[] {
  if (value.length < 2) return [value];
  const chunks: string[] = [];
  for (let i = 0; i < value.length - 1; i++) {
    chunks.push(value.slice(i, i + 2));
  }
  return chunks;
}

function diceCoefficient(a: string, b: string): number {
  if (a === b) return 1;
  if (!a || !b) return 0;

  const aBigrams = bigrams(a);
  const bBigrams = bigrams(b);
  const bCopy = [...bBigrams];
  let matches = 0;

  for (const gram of aBigrams) {
    const index = bCopy.indexOf(gram);
    if (index >= 0) {
      matches++;
      bCopy.splice(index, 1);
    }
  }

  return (2 * matches) / (aBigrams.length + bBigrams.length);
}

function similarityScore(a: string, b: string): number {
  const maxLength = Math.max(a.length, b.length);
  const levenshteinScore =
    maxLength === 0 ? 1 : 1 - levenshteinDistance(a, b) / maxLength;
  const diceScore = diceCoefficient(a, b);
  return (levenshteinScore + diceScore) / 2;
}

export function normalizeDenominationSeed(value: string): string {
  const token = normalizeToken(value);
  const stripped = stripCommonWords(token);
  return stripped || token;
}

export function normalizeReferralSource(value: string): string {
  const raw = normalizeWhitespace(value);
  if (!raw) return "Unknown";

  const token = normalizeToken(raw);
  for (const alias of REFERRAL_ALIAS_PATTERNS) {
    if (alias.pattern.test(token)) {
      return alias.canonical;
    }
  }

  return titleCase(raw);
}

export function normalizeLocation(value: string): string {
  const cleaned = normalizeWhitespace(value);
  if (!cleaned) return "Unknown";
  return titleCase(cleaned.toLowerCase());
}

export function resolveDenominationGroup(
  rawDenomination: string,
  knownGroups: string[],
): string {
  const cleaned = normalizeWhitespace(rawDenomination);
  if (!cleaned) return "Unknown";

  const token = normalizeDenominationSeed(cleaned);

  for (const alias of DENOMINATION_ALIAS_PATTERNS) {
    if (alias.pattern.test(token)) {
      return alias.canonical;
    }
  }

  let bestMatch: { group: string; score: number } | null = null;
  for (const group of knownGroups) {
    const normalizedGroup = normalizeDenominationSeed(group);
    const score = similarityScore(token, normalizedGroup);

    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { group, score };
    }
  }

  if (bestMatch && bestMatch.score >= 0.82) {
    return bestMatch.group;
  }

  return titleCase(token);
}
