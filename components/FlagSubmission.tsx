"use client";

import { FormEvent, useState } from "react";
import { Celebration } from "./Celebration";

export function FlagSubmission() {
  const [flagInput, setFlagInput] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [flagError, setFlagError] = useState<string | null>(null);
  const [hasWon, setHasWon] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  async function handleFlagSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = flagInput.trim();
    if (!trimmed || isChecking || hasWon) return;

    setIsChecking(true);
    setFlagError(null);

    try {
      const res = await fetch("/api/verify-flag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flag: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFlagError(data.error ?? "Could not verify flag.");
        return;
      }

      if (data.correct) {
        setHasWon(true);
        setShowCelebration(true);
        setFlagError(null);
      } else {
        setFlagError("Incorrect flag — keep probing MathBot!");
      }
    } catch {
      setFlagError("Could not verify flag. Try again.");
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <>
      <Celebration
        active={showCelebration}
        onComplete={() => setShowCelebration(false)}
      />

      <section
        className={`mt-4 rounded-2xl border p-4 transition-colors ${
          hasWon
            ? "border-green-500/50 bg-green-500/10"
            : "border-border bg-surface"
        }`}
        aria-labelledby="flag-submit-heading"
      >
        <h2
          id="flag-submit-heading"
          className="text-sm font-semibold text-foreground"
        >
          Submit your flag
        </h2>
        <p className="mt-1 text-xs text-muted">
          Found Secret 2? Enter the full flag below to complete the challenge.
        </p>

        {hasWon ? (
          <div
            className="celebration-success-message mt-4 text-center"
            role="status"
          >
            <p className="text-2xl" aria-hidden>
              🎉
            </p>
            <p className="mt-2 text-lg font-semibold text-green-400">
              Challenge complete!
            </p>
            <p className="mt-1 text-sm text-muted">
              You successfully extracted and submitted the hidden flag.
            </p>
          </div>
        ) : (
          <form onSubmit={handleFlagSubmit} className="mt-3 flex gap-2">
            <input
              type="text"
              value={flagInput}
              onChange={(e) => setFlagInput(e.target.value)}
              placeholder="FLAG{...}"
              disabled={isChecking}
              spellCheck={false}
              autoComplete="off"
              className={`min-w-0 flex-1 rounded-xl border bg-surface-elevated px-4 py-2.5 font-mono text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50 ${
                flagError ? "border-red-400/60 flag-shake" : "border-border"
              }`}
              aria-label="Flag submission"
              aria-invalid={flagError ? true : undefined}
              aria-describedby={flagError ? "flag-error" : undefined}
            />
            <button
              type="submit"
              disabled={isChecking || !flagInput.trim()}
              className="shrink-0 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isChecking ? "Checking…" : "Submit"}
            </button>
          </form>
        )}

        {flagError && !hasWon && (
          <p id="flag-error" className="mt-2 text-sm text-red-400" role="alert">
            {flagError}
          </p>
        )}
      </section>
    </>
  );
}
