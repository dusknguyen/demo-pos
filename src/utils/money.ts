export function formatMoney(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value || 0);
}

export function formatQuantity(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 3,
  }).format(Math.round(value * 1000) / 1000);
}

export function toInputNumber(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;

  return Math.min(max, Math.max(min, value));
}

export function roundPercent(value: number): number {
  return Math.round(value * 100) / 100;
}