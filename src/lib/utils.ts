import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatNumber(val: string | number): string {
  if (!val && val !== 0) return "";
  const num = typeof val === "string" ? val.replace(/\D/g, "") : val.toString();
  if (!num) return "";
  return new Intl.NumberFormat("vi-VN").format(Number(num));
}

export function parseNumber(val: string): string {
  return val.replace(/\D/g, "");
}
