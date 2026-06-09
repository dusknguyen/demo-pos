import type { DiscountLineDraft } from "./types";
import { clamp, roundPercent } from "../../utils/money";

export function getSaleQuantity(
  baseQuantity: number,
  conversionToBase: number
): number {
  if (conversionToBase <= 0) return 0;

  return baseQuantity / conversionToBase;
}

export function getBaseQuantity(
  saleQuantity: number,
  conversionToBase: number
): number {
  return saleQuantity * conversionToBase;
}

export function calculateGrossAmount(params: {
  price: number;
  baseQuantity: number;
  conversionToBase: number;
}): number {
  return getSaleQuantity(params.baseQuantity, params.conversionToBase) * params.price;
}

export function calculateFinalAmount(params: {
  price: number;
  baseQuantity: number;
  conversionToBase: number;
  discountPercent: number;
}): number {
  const grossAmount = calculateGrossAmount({
    price: params.price,
    baseQuantity: params.baseQuantity,
    conversionToBase: params.conversionToBase,
  });

  return Math.round(grossAmount * (1 - params.discountPercent / 100));
}

export function calculateDiscountAmount(params: {
  price: number;
  baseQuantity: number;
  conversionToBase: number;
  discountPercent: number;
}): number {
  const grossAmount = calculateGrossAmount({
    price: params.price,
    baseQuantity: params.baseQuantity,
    conversionToBase: params.conversionToBase,
  });

  const finalAmount = calculateFinalAmount({
    price: params.price,
    baseQuantity: params.baseQuantity,
    conversionToBase: params.conversionToBase,
    discountPercent: params.discountPercent,
  });

  return Math.max(0, grossAmount - finalAmount);
}

export function calculateDiscountPercentFromFinalAmount(params: {
  price: number;
  baseQuantity: number;
  conversionToBase: number;
  finalAmount: number;
}): number {
  const grossAmount = calculateGrossAmount({
    price: params.price,
    baseQuantity: params.baseQuantity,
    conversionToBase: params.conversionToBase,
  });

  if (grossAmount <= 0) return 0;

  return roundPercent(100 - (params.finalAmount / grossAmount) * 100);
}

export function createDiscountLine(params: {
  id: number;
  baseQuantity: number;
  discountPercent: number;
  price: number;
  conversionToBase: number;
}): DiscountLineDraft {
  return {
    id: params.id,
    baseQuantity: params.baseQuantity,
    discountPercent: roundPercent(params.discountPercent),
    finalAmount: calculateFinalAmount({
      price: params.price,
      baseQuantity: params.baseQuantity,
      conversionToBase: params.conversionToBase,
      discountPercent: params.discountPercent,
    }),
  };
}

export function recalculateLine(params: {
  line: DiscountLineDraft;
  price: number;
  conversionToBase: number;
}): DiscountLineDraft {
  return {
    ...params.line,
    discountPercent: roundPercent(params.line.discountPercent),
    finalAmount: calculateFinalAmount({
      price: params.price,
      baseQuantity: params.line.baseQuantity,
      conversionToBase: params.conversionToBase,
      discountPercent: params.line.discountPercent,
    }),
  };
}

export function mergeDraftLinesByDiscount(params: {
  lines: DiscountLineDraft[];
  price: number;
  conversionToBase: number;
}): DiscountLineDraft[] {
  const mergedMap = new Map<number, DiscountLineDraft>();

  for (const line of params.lines) {
    if (line.baseQuantity <= 0) continue;

    const discountPercent = roundPercent(line.discountPercent);
    const existing = mergedMap.get(discountPercent);

    if (!existing) {
      mergedMap.set(
        discountPercent,
        recalculateLine({
          line: { ...line, discountPercent },
          price: params.price,
          conversionToBase: params.conversionToBase,
        })
      );
      continue;
    }

    mergedMap.set(
      discountPercent,
      recalculateLine({
        line: {
          ...existing,
          baseQuantity: existing.baseQuantity + line.baseQuantity,
          discountPercent,
        },
        price: params.price,
        conversionToBase: params.conversionToBase,
      })
    );
  }

  return Array.from(mergedMap.values());
}

export function resizeLinesByTotalQuantity(params: {
  lines: DiscountLineDraft[];
  previousTotalBaseQuantity: number;
  nextTotalBaseQuantity: number;
  price: number;
  conversionToBase: number;
  nextId: number;
}): DiscountLineDraft[] {
  const {
    lines,
    previousTotalBaseQuantity,
    nextTotalBaseQuantity,
    price,
    conversionToBase,
    nextId,
  } = params;

  if (nextTotalBaseQuantity <= 0) return [];

  if (lines.length === 0) {
    return [
      createDiscountLine({
        id: nextId,
        baseQuantity: nextTotalBaseQuantity,
        discountPercent: 0,
        price,
        conversionToBase,
      }),
    ];
  }

  const delta = nextTotalBaseQuantity - previousTotalBaseQuantity;

  if (delta > 0) {
    return lines.map((line, index) =>
      recalculateLine({
        line:
          index === 0
            ? { ...line, baseQuantity: line.baseQuantity + delta }
            : line,
        price,
        conversionToBase,
      })
    );
  }

  let remainingToRemove = Math.abs(delta);
  const nextLines = [...lines];

  for (let index = nextLines.length - 1; index >= 0; index -= 1) {
    if (remainingToRemove <= 0) break;

    const currentLine = nextLines[index];
    const removableQuantity = Math.min(currentLine.baseQuantity, remainingToRemove);

    nextLines[index] = {
      ...currentLine,
      baseQuantity: currentLine.baseQuantity - removableQuantity,
    };

    remainingToRemove -= removableQuantity;
  }

  return nextLines
    .filter((line) => line.baseQuantity > 0)
    .map((line) => recalculateLine({ line, price, conversionToBase }));
}

export function updateLineQuantity(params: {
  lines: DiscountLineDraft[];
  rowIndex: number;
  value: string;
  totalBaseQuantity: number;
  price: number;
  conversionToBase: number;
  nextId: number;
}): DiscountLineDraft[] {
  const beforeRows = params.lines.slice(0, params.rowIndex);
  const currentRow = params.lines[params.rowIndex];

  const beforeBaseQuantity = beforeRows.reduce(
    (sum, row) => sum + row.baseQuantity,
    0
  );

  const maxCurrentBaseQuantity = Math.max(
    0,
    params.totalBaseQuantity - beforeBaseQuantity
  );

  const inputQuantity = clamp(Number(params.value || 0), 0, Number.MAX_SAFE_INTEGER);

  const nextBaseQuantity = clamp(
    getBaseQuantity(inputQuantity, params.conversionToBase),
    0,
    maxCurrentBaseQuantity
  );

  /**
   * Keep current row even when quantity = 0.
   * This allows row 2 to stay visible as 0.
   */
  const updatedRow = recalculateLine({
    line: {
      ...currentRow,
      baseQuantity: nextBaseQuantity,
    },
    price: params.price,
    conversionToBase: params.conversionToBase,
  });

  const usedBaseQuantity = beforeBaseQuantity + updatedRow.baseQuantity;
  const remainderBaseQuantity = params.totalBaseQuantity - usedBaseQuantity;

  /**
   * Important:
   * Do not filter updatedRow when it is 0.
   * User must be able to see row 2 = 0.
   */
  const nextLines: DiscountLineDraft[] = [...beforeRows, updatedRow];

  if (remainderBaseQuantity > 0) {
    nextLines.push(
      createDiscountLine({
        id: params.nextId,
        baseQuantity: remainderBaseQuantity,
        discountPercent: 0,
        price: params.price,
        conversionToBase: params.conversionToBase,
      })
    );
  }

  return nextLines;
}