import type { CartItem, ProductUnit } from "../types/pos";
import { roundPercent } from "./money";

export function getCartLineKey(
  item: Pick<CartItem, "unitCode" | "discountPercent">
): string {
  return `${item.unitCode}__${roundPercent(item.discountPercent)}`;
}

export function getSaleQuantity(item: CartItem): number {
  if (item.conversionToBase <= 0) return 0;

  return item.baseQuantity / item.conversionToBase;
}

export function getBaseQuantity(item: CartItem): number {
  return item.baseQuantity;
}

export function getLineGross(item: CartItem): number {
  return getSaleQuantity(item) * item.price;
}

export function getLineDiscount(item: CartItem): number {
  return getLineGross(item) * (item.discountPercent / 100);
}

export function getLineTotal(item: CartItem): number {
  return getLineGross(item) - getLineDiscount(item);
}

export function getCartTotalBeforeDiscount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + getLineGross(item), 0);
}

export function getCartTotalDiscount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + getLineDiscount(item), 0);
}

export function getCartTotalAmount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + getLineTotal(item), 0);
}

export function createCartItem(params: {
  unit: ProductUnit;
  baseQuantity: number;
  discountPercent: number;
}): CartItem {
  return {
    ...params.unit,
    baseQuantity: params.baseQuantity,
    discountPercent: roundPercent(params.discountPercent),
  };
}

/**
 * Change sale unit and keep visible quantity unchanged.
 *
 * Example:
 * 2 Lốc 6 -> 2 Lon
 * 2 Lốc 6 -> 2 Thùng 24
 *
 * This is easier for cashier operation:
 * changing unit means changing selling unit, not preserving stock conversion.
 */
export function changeCartItemUnit(
  item: CartItem,
  targetUnit: ProductUnit
): CartItem {
  const currentSaleQuantity = getSaleQuantity(item);

  return {
    ...item,
    unitCode: targetUnit.unitCode,
    barcode: targetUnit.barcode,
    saleUnit: targetUnit.saleUnit,
    conversionToBase: targetUnit.conversionToBase,
    price: targetUnit.price,
    baseQuantity: currentSaleQuantity * targetUnit.conversionToBase,
  };
}

export function mergeCartItems(items: CartItem[]): CartItem[] {
  const mergedMap = new Map<string, CartItem>();

  for (const item of items) {
    if (item.baseQuantity <= 0) continue;

    const key = getCartLineKey(item);
    const existing = mergedMap.get(key);

    if (!existing) {
      mergedMap.set(key, item);
      continue;
    }

    mergedMap.set(key, {
      ...existing,
      baseQuantity: existing.baseQuantity + item.baseQuantity,
    });
  }

  return Array.from(mergedMap.values());
}