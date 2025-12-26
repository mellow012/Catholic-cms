// lib/fuzzySearch.ts - Fuzzy search implementation

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  if (len1 === 0) return len2;
  if (len2 === 0) return len1;

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate similarity score between two strings (0-1)
 * 1 = exact match, 0 = completely different
 */
export function similarityScore(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  const distance = levenshteinDistance(s1, s2);
  const maxLength = Math.max(s1.length, s2.length);
  
  return 1 - distance / maxLength;
}

/**
 * Fuzzy search in an array of objects
 * @param items - Array to search
 * @param searchTerm - Search query
 * @param keys - Object keys to search in
 * @param threshold - Minimum similarity score (0-1, default 0.5)
 */
export function fuzzySearch<T extends Record<string, any>>(
  items: T[],
  searchTerm: string,
  keys: (keyof T)[],
  threshold: number = 0.5
): T[] {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return items;
  }

  const search = searchTerm.toLowerCase().trim();

  // Score each item
  const scoredItems = items.map(item => {
    let maxScore = 0;

    // Check each key
    for (const key of keys) {
      const value = item[key];
      if (value == null) continue;

      const valueStr = String(value).toLowerCase();

      // Exact substring match gets bonus
      if (valueStr.includes(search)) {
        maxScore = Math.max(maxScore, 0.9);
      }

      // Calculate fuzzy score
      const score = similarityScore(search, valueStr);
      maxScore = Math.max(maxScore, score);

      // Check if search term matches start of words
      const words = valueStr.split(' ');
      for (const word of words) {
        if (word.startsWith(search)) {
          maxScore = Math.max(maxScore, 0.85);
        }
        const wordScore = similarityScore(search, word);
        maxScore = Math.max(maxScore, wordScore);
      }
    }

    return { item, score: maxScore };
  });

  // Filter by threshold and sort by score
  return scoredItems
    .filter(({ score }) => score >= threshold)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}

/**
 * Simple contains search (fallback for large datasets)
 */
export function simpleSearch<T extends Record<string, any>>(
  items: T[],
  searchTerm: string,
  keys: (keyof T)[]
): T[] {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return items;
  }

  const search = searchTerm.toLowerCase().trim();

  return items.filter(item => {
    for (const key of keys) {
      const value = item[key];
      if (value == null) continue;
      
      const valueStr = String(value).toLowerCase();
      if (valueStr.includes(search)) {
        return true;
      }
    }
    return false;
  });
}