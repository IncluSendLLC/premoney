"use client";

import { Input } from "@/components/ui/input";
import { formatCurrency, parseCurrencyInput } from "@/lib/formatters";
import { useState, useCallback } from "react";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  id?: string;
}

export function CurrencyInput({
  value,
  onChange,
  className,
  id,
}: CurrencyInputProps) {
  const [focused, setFocused] = useState(false);
  const [displayValue, setDisplayValue] = useState(value.toString());

  const handleFocus = useCallback(() => {
    setFocused(true);
    setDisplayValue(value.toString());
  }, [value]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    const parsed = parseCurrencyInput(displayValue);
    onChange(parsed);
  }, [displayValue, onChange]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDisplayValue(e.target.value);
    },
    []
  );

  return (
    <Input
      id={id}
      type={focused ? "text" : "text"}
      value={focused ? displayValue : formatCurrency(value)}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={className}
    />
  );
}
