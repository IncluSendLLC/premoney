"use client";

import { createContext, useContext, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { GLOSSARY } from "@/lib/constants";

interface GlossaryContextValue {
  openTerm: (term: string) => void;
}

const GlossaryContext = createContext<GlossaryContextValue>({
  openTerm: () => {},
});

export function useGlossary() {
  return useContext(GlossaryContext);
}

export function GlossaryProvider({ children }: { children: React.ReactNode }) {
  const [activeTerm, setActiveTerm] = useState<string | null>(null);

  const openTerm = useCallback((term: string) => {
    setActiveTerm(term);
  }, []);

  const definition = activeTerm ? GLOSSARY[activeTerm] : "";

  return (
    <GlossaryContext.Provider value={{ openTerm }}>
      {children}
      <Dialog
        open={!!activeTerm}
        onOpenChange={(open) => {
          if (!open) setActiveTerm(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle
              className="caps-label"
              style={{ fontSize: "11px", letterSpacing: "0.14em" }}
            >
              {activeTerm}
            </DialogTitle>
            <DialogDescription
              style={{
                fontSize: "14px",
                lineHeight: 1.65,
                color: "var(--ink)",
                marginTop: "8px",
              }}
            >
              {definition}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </GlossaryContext.Provider>
  );
}
