"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GLOSSARY } from "@/lib/constants";
import { useGlossary } from "./glossary-provider";

interface GlossaryTermProps {
  /** The key in the GLOSSARY object */
  term: string;
  /** Display text (defaults to term) */
  children?: React.ReactNode;
}

export function GlossaryTerm({ term, children }: GlossaryTermProps) {
  const { openTerm } = useGlossary();
  const definition = GLOSSARY[term];

  if (!definition) return <>{children || term}</>;

  return (
    <Tooltip>
      <TooltipTrigger
        className="glossary-term"
        onClick={(e) => {
          e.preventDefault();
          openTerm(term);
        }}
        render={<button type="button" />}
      >
        {children || term}
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-xs"
        style={{
          background: "var(--paper)",
          color: "var(--ink)",
          border: "1px solid var(--ink-10)",
          borderRadius: "var(--r-md)",
          boxShadow: "var(--shadow-md)",
          padding: "10px 14px",
        }}
      >
        <p
          className="caps-label-sm"
          style={{ marginBottom: "4px", color: "var(--navy-500)" }}
        >
          {term}
        </p>
        <p style={{ fontSize: "12.5px", lineHeight: 1.5, color: "var(--ink-60)" }}>
          {definition.length > 120
            ? definition.slice(0, 120).trim() + "..."
            : definition}
        </p>
        <p
          style={{
            fontSize: "10.5px",
            marginTop: "6px",
            color: "var(--accent-deep)",
            fontWeight: 500,
          }}
        >
          Click for details
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
