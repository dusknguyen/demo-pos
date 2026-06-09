import { useMemo, useState } from "react";

import { productUnits } from "../data/productUnits";
import type { CartItem, EditCartItemPayload, ProductUnit } from "../types/pos";
import {
  changeCartItemUnit,
  createCartItem,
  getCartLineKey,
  getCartTotalAmount,
  getCartTotalBeforeDiscount,
  getCartTotalDiscount,
  mergeCartItems,
} from "../utils/cart";
import { roundPercent } from "../utils/money";

export function usePosSale() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedLineKey, setSelectedLineKey] = useState<string | null>(null);

  const [searchText, setSearchText] = useState("");
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false);

  const selectedItem = useMemo(() => {
    return (
      cartItems.find((item) => getCartLineKey(item) === selectedLineKey) ?? null
    );
  }, [cartItems, selectedLineKey]);

  const relatedItems = useMemo(() => {
    if (!selectedItem) return [];

    return cartItems.filter((item) => item.unitCode === selectedItem.unitCode);
  }, [cartItems, selectedItem]);

  const availableUnits = useMemo(() => {
    if (!selectedItem) return [];

    return productUnits.filter(
      (unit) => unit.productId === selectedItem.productId
    );
  }, [selectedItem]);

  const filteredProducts = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    if (!keyword) return productUnits;

    return productUnits.filter((item) => {
      return (
        item.productId.toLowerCase().includes(keyword) ||
        item.unitCode.toLowerCase().includes(keyword) ||
        item.barcode.toLowerCase().includes(keyword) ||
        item.name.toLowerCase().includes(keyword) ||
        item.saleUnit.toLowerCase().includes(keyword)
      );
    });
  }, [searchText]);

  const totalBeforeDiscount = useMemo(
    () => getCartTotalBeforeDiscount(cartItems),
    [cartItems]
  );

  const totalDiscount = useMemo(
    () => getCartTotalDiscount(cartItems),
    [cartItems]
  );

  const totalAmount = useMemo(() => getCartTotalAmount(cartItems), [cartItems]);

  function addProduct(unit: ProductUnit): void {
    const nextItem = createCartItem({
      unit,
      baseQuantity: unit.conversionToBase,
      discountPercent: 0,
    });

    setCartItems((currentItems) => mergeCartItems([...currentItems, nextItem]));

    setSelectedLineKey(getCartLineKey(nextItem));
    setIsProductDialogOpen(false);
    setSearchText("");
  }

  function changeLineUnit(lineKey: string, targetUnitCode: string): void {
    const targetUnit = productUnits.find(
      (unit) => unit.unitCode === targetUnitCode
    );

    if (!targetUnit) return;

    setCartItems((currentItems) => {
      const sourceItem = currentItems.find(
        (item) => getCartLineKey(item) === lineKey
      );

      if (!sourceItem) return currentItems;
      if (sourceItem.productId !== targetUnit.productId) return currentItems;

      const changedItem = changeCartItemUnit(sourceItem, targetUnit);

      const remainingItems = currentItems.filter(
        (item) => getCartLineKey(item) !== lineKey
      );

      return mergeCartItems([...remainingItems, changedItem]);
    });

    const discountText = lineKey.split("__")[1] ?? "0";
    setSelectedLineKey(`${targetUnitCode}__${discountText}`);
  }

  function changeSelectedLineUnit(targetUnitCode: string): void {
    if (!selectedLineKey) return;

    changeLineUnit(selectedLineKey, targetUnitCode);
    setIsUnitDialogOpen(false);
  }

  function cycleSelectedLineUnit(direction: "next" | "previous"): void {
    if (!selectedItem || !selectedLineKey || availableUnits.length === 0) return;

    const currentIndex = availableUnits.findIndex(
      (unit) => unit.unitCode === selectedItem.unitCode
    );

    if (currentIndex < 0) return;

    const nextIndex =
      direction === "next"
        ? (currentIndex + 1) % availableUnits.length
        : (currentIndex - 1 + availableUnits.length) % availableUnits.length;

    changeLineUnit(selectedLineKey, availableUnits[nextIndex].unitCode);
  }

  function openUnitDialog(lineKey?: string): void {
    if (lineKey) {
      setSelectedLineKey(lineKey);
      setIsUnitDialogOpen(true);
      return;
    }

    if (!selectedItem) return;

    setIsUnitDialogOpen(true);
  }

  function closeUnitDialog(): void {
    setIsUnitDialogOpen(false);
  }

  function openProductLookup(): void {
    setIsProductDialogOpen(true);
  }

  function closeProductLookup(): void {
    setIsProductDialogOpen(false);
  }

  function openEditDialog(): void {
    if (!selectedItem) return;

    setIsEditDialogOpen(true);
  }

  function closeEditDialog(): void {
    setIsEditDialogOpen(false);
  }

  function handleQuickSearch(): void {
    const keyword = searchText.trim().toLowerCase();

    if (!keyword) {
      openProductLookup();
      return;
    }

    const exactItem = productUnits.find((item) => {
      return (
        item.unitCode.toLowerCase() === keyword ||
        item.barcode.toLowerCase() === keyword
      );
    });

    if (exactItem) {
      addProduct(exactItem);
      return;
    }

    openProductLookup();
  }

  function updateDiscountGroup(payload: EditCartItemPayload): void {
    const targetUnit = productUnits.find(
      (unit) => unit.unitCode === payload.targetUnitCode
    );

    if (!targetUnit) return;

    setCartItems((currentItems) => {
      const otherItems = currentItems.filter(
        (item) => item.unitCode !== payload.sourceUnitCode
      );

      const nextItems = payload.lines.map((line) =>
        createCartItem({
          unit: targetUnit,
          baseQuantity: line.baseQuantity,
          discountPercent: roundPercent(line.discountPercent),
        })
      );

      return mergeCartItems([...otherItems, ...nextItems]);
    });

    const firstLine = payload.lines[0];

    if (!firstLine) {
      setSelectedLineKey(null);
      closeEditDialog();
      return;
    }

    setSelectedLineKey(
      `${payload.targetUnitCode}__${roundPercent(firstLine.discountPercent)}`
    );

    closeEditDialog();
  }

  return {
    cartItems,
    selectedLineKey,
    selectedItem,
    relatedItems,
    availableUnits,

    searchText,
    filteredProducts,

    isProductDialogOpen,
    isEditDialogOpen,
    isUnitDialogOpen,

    totalBeforeDiscount,
    totalDiscount,
    totalAmount,

    setSelectedLineKey,
    setSearchText,

    addProduct,
    changeLineUnit,
    changeSelectedLineUnit,
    cycleSelectedLineUnit,

    openProductLookup,
    closeProductLookup,
    openEditDialog,
    closeEditDialog,
    openUnitDialog,
    closeUnitDialog,

    handleQuickSearch,
    updateDiscountGroup,
  };
}