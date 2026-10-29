/**
 * Branch aliases and synonym matching helper.
 * Bridges abbreviations like "MECH", "CSE", "ECE" with natural search terms
 * like "mechanical", "computer science", "electronics", etc.
 */

export const BRANCH_SYNONYMS: Record<string, string[]> = {
  MECH: ['mech', 'mechanical', 'mechanics', 'mechanical engineering', 'automotive'],
  CSE: ['cse', 'computer science', 'cs', 'comp sci', 'computer', 'software', 'coding'],
  IT: ['it', 'information technology', 'info tech', 'software'],
  ECE: ['ece', 'electronics', 'electronics and communication', 'communication', 'telecom'],
  EEE: ['eee', 'electrical', 'electrical engineering', 'electrical and electronics'],
  CIVIL: ['civil', 'civil engineering', 'structures', 'construction'],
};

/**
 * Returns true if a student's branch or a drive's allowed branch matches a user search term.
 * Handles both "MECH" matching "mechanical" and "mechanical" matching "MECH".
 */
export function matchesBranch(branch: string | undefined | null, query: string): boolean {
  if (!branch || !query) return false;
  const b = branch.trim().toUpperCase();
  const q = query.trim().toLowerCase();
  if (!q) return false;

  // Direct substring check
  if (b.toLowerCase().includes(q) || q.includes(b.toLowerCase())) {
    return true;
  }

  // Check mapped synonyms
  for (const [code, synonyms] of Object.entries(BRANCH_SYNONYMS)) {
    const isTargetBranch = b === code || synonyms.some((s) => s.toLowerCase() === b.toLowerCase());
    if (isTargetBranch) {
      if (synonyms.some((s) => s.toLowerCase().includes(q) || q.includes(s.toLowerCase()))) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Returns true if any branch in the allowedBranches array matches the query.
 */
export function matchesBranchList(branches: string[] | undefined | null, query: string): boolean {
  if (!branches || !Array.isArray(branches) || branches.length === 0) return false;
  return branches.some((branch) => matchesBranch(branch, query));
}

/**
 * Extracts all matching branch codes from a search query.
 * For example, "mechanical" -> ["MECH"], "computer" -> ["CSE", "IT"].
 */
export function getBranchCodesFromQuery(query: string): string[] {
  if (!query) return [];
  const q = query.trim().toLowerCase();
  const matchedCodes = new Set<string>();

  for (const [code, synonyms] of Object.entries(BRANCH_SYNONYMS)) {
    if (code.toLowerCase().includes(q) || q.includes(code.toLowerCase())) {
      matchedCodes.add(code);
      continue;
    }
    for (const syn of synonyms) {
      if (syn.toLowerCase().includes(q) || q.includes(syn.toLowerCase())) {
        matchedCodes.add(code);
        break;
      }
    }
  }

  return Array.from(matchedCodes);
}

