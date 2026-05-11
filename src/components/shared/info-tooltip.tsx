"use client";

import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InfoTooltipProps {
  term: string;
  definition: string;
}

export function InfoTooltip({ term, definition }: InfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        className="inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors ml-1"
        aria-label={`Learn about ${term}`}
        onClick={(e) => e.preventDefault()}
      >
        <Info className="h-3.5 w-3.5" />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-sm">
        <p className="font-medium mb-1">{term}</p>
        <p className="text-muted-foreground">{definition}</p>
      </TooltipContent>
    </Tooltip>
  );
}
