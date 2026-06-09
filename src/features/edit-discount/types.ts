export interface DiscountLineDraft {
  id: number;
  baseQuantity: number;
  discountPercent: number;
  finalAmount: number;
}

export type FocusTarget = "totalQuantity" | "quantity" | "percent" | "finalAmount";