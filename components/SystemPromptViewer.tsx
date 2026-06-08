"use client";

import { useEffect, useRef } from "react";
import { DISPLAY_SYSTEM_PROMPT } from "@/lib/display-system-prompt";

type SystemPromptViewerProps = {
  open: boolean;
  onClose: () => void;
};

export function SystemPromptViewer({ open, onClose }: SystemPromptViewerProps) {
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
      aria-labelledby="system-prompt-heading"
    >
      <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <h2
            id="system-prompt-heading"
            className="text-base font-semibold text-foreground"
          >
            System prompt
          </h2>
          <p className="mt-1 text-xs text-muted">
            This is what MathBot is instructed to follow. The hidden flag value
            is omitted.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg px-2 py-1 text-sm text-muted transition-colors hover:bg-surface-elevated hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Close system prompt"
        >
          ✕
        </button>
      </div>

      <pre className="flex-1 overflow-y-auto whitespace-pre-wrap px-5 py-4 font-mono text-xs leading-relaxed text-foreground/90">
        {DISPLAY_SYSTEM_PROMPT}
      </pre>
    </dialog>
  );
}
