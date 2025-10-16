import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/*
Custom Helpers
*/

export function validateDecimalInput(value: string): boolean {
  return /^[\d,]*\.?\d{0,2}$/.test(value);
}

export function formatNumber(num: number) {
  if (num !== 0 && !num) return "";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function parseNumber(str: string) {
  if (!str) return 0;
  const cleaned = str.replace(/,/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function calculatePercent(
  numerator: number,
  denominator: number,
): number {
  if (numerator === 0 || denominator === 0) return 0;
  const percent = (numerator / denominator) * 100;
  return Math.round(percent * 100) / 100;
}
