"use client";

import { useEffect, useRef } from "react";
import { POSSIBLE_SOLUTION } from "@/lib/possible-solution";

type PossibleSolutionViewerProps = {
  open: boolean;
  onClose: () => void;
};

export function PossibleSolutionViewer({
  open,
  onClose,
}: PossibleSolutionViewerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed inset-0 z-50 m-auto w-[min(100%-2rem,42rem)] max-h-[min(85vh,32rem)] rounded-2xl border border-border bg-surface p-0 text-foreground shadow-xl backdrop:bg-black/60 open:flex open:flex-col"
      aria-labelledby="possible-solution-heading"
    >
      <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <h2
            id="possible-solution-heading"
            className="text-base font-semibold text-foreground"
          >
            Possible solution
          </h2>
          <p className="mt-1 text-xs text-muted">
            One approach that might work — paste this into the chat and send it.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg px-2 py-1 text-sm text-muted transition-colors hover:bg-surface-elevated hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Close possible solution"
        >
          ✕
        </button>
      </div>

      <pre className="flex-1 overflow-y-auto whitespace-pre-wrap px-5 py-4 font-mono text-xs leading-relaxed text-foreground/90">
        {POSSIBLE_SOLUTION}
      </pre>
    </dialog>
  );
}
