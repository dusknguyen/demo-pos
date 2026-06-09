export interface ProductUnit {
  productId: string;
  unitCode: string;
  barcode: string;
  name: string;
  baseUnit: string;
  saleUnit: string;
  conversionToBase: number;
  stockBaseQuantity: number;
  price: number;
}

export interface CartItem extends ProductUnit {
  /**
   * Real quantity in smallest unit.
   * Example: 2 Lốc 6 = 12 Lon.
   */
  baseQuantity: number;
  discountPercent: number;
}

export interface EditDiscountLinePayload {
  baseQuantity: number;
  discountPercent: number;
  discountAmount: number;
}

export interface EditCartItemPayload {
  sourceUnitCode: string;
  targetUnitCode: string;
  lines: EditDiscountLinePayload[];
}