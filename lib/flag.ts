/** Level 2 workshop flag — validated server-side only. */
export const CORRECT_FLAG = "FLAG{pr0mpt_h4ck3r_2026}";

export function normalizeFlagSubmission(value: string): string {
  return value.trim();
}

export function isCorrectFlag(submission: string): boolean {
  return normalizeFlagSubmission(submission) === CORRECT_FLAG;
}
