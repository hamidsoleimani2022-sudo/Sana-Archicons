import type { ReactNode } from "react";

/** Lichte **vet**-rendering zonder markdown-bibliotheek; regels blijven behouden via whitespace-pre-wrap. */
export function renderBold(text: string): ReactNode[] {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}
