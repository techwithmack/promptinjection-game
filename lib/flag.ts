import { FLAG } from "@/lib/system-prompt";

export function normalizeFlagSubmission(value: string): string {
  return value.trim();
}

export function isCorrectFlag(submission: string): boolean {
  return normalizeFlagSubmission(submission) === FLAG;
}
