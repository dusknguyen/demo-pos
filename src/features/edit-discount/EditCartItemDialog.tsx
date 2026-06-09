import {
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import type {
  CartItem,
  EditCartItemPayload,
  EditDiscountLinePayload,
} from "../../types/pos";
import {
  clamp,
  formatMoney,
  formatQuantity,
  roundPercent,
  toInputNumber,
} from "../../utils/money";
import type { DiscountLineDraft, FocusTarget } from "./types";
import {
  calculateDiscountAmount,
  calculateDiscountPercentFromFinalAmount,
  calculateFinalAmount,
  calculateGrossAmount,
  createDiscountLine,
  getBaseQuantity,
  getSaleQuantity,
  mergeDraftLinesByDiscount,
  recalculateLine,
  resizeLinesByTotalQuantity,
  updateLineQuantity,
} from "./editDiscountHelpers";

interface EditCartItemDialogProps {
  open: boolean;
  item: CartItem | null;
  relatedItems: CartItem[];
  onClose: () => void;
  onSave: (payload: EditCartItemPayload) => void;
}

export function EditCartItemDialog({
  open,
  item,
  relatedItems,
  onClose,
  onSave,
}: EditCartItemDialogProps) {
  const totalQuantityRef = useRef<HTMLInputElement | null>(null);
  const nextIdRef = useRef(1);

  const [totalBaseQuantity, setTotalBaseQuantity] = useState(0);
  const [lines, setLines] = useState<DiscountLineDraft[]>([]);

  const price = item?.price ?? 0;
  const saleUnit = item?.saleUnit ?? "";
  const baseUnit = item?.baseUnit ?? "";
  const conversionToBase = item?.conversionToBase ?? 1;
  const totalSaleQuantity = totalBaseQuantity / conversionToBase;

  const assignedBaseQuantity = useMemo(() => {
    return lines.reduce((sum, line) => sum + line.baseQuantity, 0);
  }, [lines]);

  useEffect(() => {
    if (!open || !item) return;

    nextIdRef.current = 1;

    const currentTotalBaseQuantity = relatedItems.reduce(
      (sum, row) => sum + row.baseQuantity,
      0
    );

    const nextLines = relatedItems.map((row) => ({
      id: nextIdRef.current++,
      baseQuantity: row.baseQuantity,
      discountPercent: row.discountPercent,
      finalAmount: calculateFinalAmount({
        price: row.price,
        baseQuantity: row.baseQuantity,
        conversionToBase: row.conversionToBase,
        discountPercent: row.discountPercent,
      }),
    }));

    setTotalBaseQuantity(currentTotalBaseQuantity);
    setLines(
      nextLines.length > 0
        ? nextLines
        : [
            createDiscountLine({
              id: nextIdRef.current++,
              baseQuantity: currentTotalBaseQuantity,
              discountPercent: 0,
              price: item.price,
              conversionToBase: item.conversionToBase,
            }),
          ]
    );
  }, [open, item, relatedItems]);

  useEffect(() => {
    if (!open) return;

    window.setTimeout(() => {
      totalQuantityRef.current?.focus();
      totalQuantityRef.current?.select();
    }, 50);
  }, [open]);

  function handleTotalQuantityChange(value: string): void {
    const nextQuantity = Math.max(0, Number(value || 0));
    const nextTotalBaseQuantity = getBaseQuantity(nextQuantity, conversionToBase);

    setLines((currentLines) =>
      resizeLinesByTotalQuantity({
        lines: currentLines,
        previousTotalBaseQuantity: totalBaseQuantity,
        nextTotalBaseQuantity,
        price,
        conversionToBase,
        nextId: nextIdRef.current++,
      })
    );

    setTotalBaseQuantity(nextTotalBaseQuantity);
  }

  function handleSplitQuantityChange(rowIndex: number, value: string): void {
    setLines((currentLines) =>
      updateLineQuantity({
        lines: currentLines,
        rowIndex,
        value,
        totalBaseQuantity,
        price,
        conversionToBase,
        nextId: nextIdRef.current++,
      })
    );
  }

  function handleDiscountPercentChange(rowIndex: number, value: string): void {
    setLines((currentLines) =>
      currentLines.map((line, index) => {
        if (index !== rowIndex) return line;

        return recalculateLine({
          line: {
            ...line,
            discountPercent: clamp(Number(value || 0), 0, 100),
          },
          price,
          conversionToBase,
        });
      })
    );
  }

  function handleFinalAmountChange(rowIndex: number, value: string): void {
    setLines((currentLines) =>
      currentLines.map((line, index) => {
        if (index !== rowIndex) return line;

        const grossAmount = calculateGrossAmount({
          price,
          baseQuantity: line.baseQuantity,
          conversionToBase,
        });

        const finalAmount = clamp(Number(value || 0), 0, grossAmount);

        return {
          ...line,
          finalAmount,
          discountPercent: calculateDiscountPercentFromFinalAmount({
            price,
            baseQuantity: line.baseQuantity,
            conversionToBase,
            finalAmount,
          }),
        };
      })
    );
  }

  function focusInput(target: FocusTarget): void {
    const selectorMap: Record<FocusTarget, string> = {
      totalQuantity: "[data-f3-input='total-quantity']",
      quantity: "[data-f3-input='quantity-0']",
      percent: "[data-f3-input='percent-0']",
      finalAmount: "[data-f3-input='final-amount-0']",
    };

    const input = document.querySelector<HTMLInputElement>(selectorMap[target]);

    input?.focus();
    input?.select();
  }

  function save(): void {
    if (!item) return;

    const payloadLines: EditDiscountLinePayload[] = mergeDraftLinesByDiscount({
      lines,
      price,
      conversionToBase,
    }).map((line) => ({
      baseQuantity: line.baseQuantity,
      discountPercent: roundPercent(line.discountPercent),
      discountAmount: calculateDiscountAmount({
        price,
        baseQuantity: line.baseQuantity,
        conversionToBase,
        discountPercent: line.discountPercent,
      }),
    }));

    onSave({
      sourceUnitCode: item.unitCode,
      targetUnitCode: item.unitCode,
      lines: payloadLines,
    });
  }

  function handleDialogKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();
      save();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onClose();
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      onKeyDown={handleDialogKeyDown}
    >
      <DialogTitle sx={{ fontWeight: 900, bgcolor: "#0f172a", color: "white" }}>
        F3 - Sửa số lượng / giảm giá
      </DialogTitle>

      <DialogContent sx={{ pt: 2, bgcolor: "#f8fafc" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          <Paper sx={{ p: 1.5, borderRadius: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 900 }}>{item?.name}</Typography>

                {item && (
                  <Typography variant="body2" color="text.secondary">
                    {item.unitCode} · {item.saleUnit} · {formatMoney(item.price)}
                  </Typography>
                )}
              </Box>

              <Chip
                color="primary"
                label={`Tồn ${formatQuantity(item?.stockBaseQuantity ?? 0)} ${baseUnit}`}
              />
            </Box>
          </Paper>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Button
              size="small"
              variant="outlined"
              onClick={() => focusInput("totalQuantity")}
            >
              Tổng SL
            </Button>

            <Button
              size="small"
              variant="outlined"
              onClick={() => focusInput("quantity")}
            >
              SL dòng 2
            </Button>

            <Button
              size="small"
              variant="outlined"
              onClick={() => focusInput("percent")}
            >
              % giảm
            </Button>

            <Button
              size="small"
              variant="outlined"
              onClick={() => focusInput("finalAmount")}
            >
              Sau giảm
            </Button>
          </Box>

          <Paper sx={{ overflow: "hidden", borderRadius: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#e2e8f0" }}>
                  <TableCell>Dòng</TableCell>
                  <TableCell align="right">Số lượng</TableCell>
                  <TableCell>ĐVT</TableCell>
                  <TableCell align="right">% giảm</TableCell>
                  <TableCell align="right">Tiền sau giảm</TableCell>
                  <TableCell align="right">Tiền hàng</TableCell>
                  <TableCell align="right">Ghi chú</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                <TableRow sx={{ bgcolor: "#fef3c7" }}>
                  <TableCell>
                    <Typography sx={{ fontWeight: 900 }}>1</Typography>
                  </TableCell>

                  <TableCell align="right">
                    <TextField
                      inputRef={totalQuantityRef}
                      data-f3-input="total-quantity"
                      size="small"
                      type="number"
                      value={toInputNumber(totalSaleQuantity)}
                      onChange={(event) =>
                        handleTotalQuantityChange(event.target.value)
                      }
                      slotProps={{
                        htmlInput: {
                          min: 0,
                          step: 0.001,
                        },
                      }}
                      sx={{ width: 120 }}
                    />
                  </TableCell>

                  <TableCell>{saleUnit}</TableCell>
                  <TableCell align="right">-</TableCell>
                  <TableCell align="right">-</TableCell>

                  <TableCell align="right">
                    {formatMoney(price * totalSaleQuantity)}
                  </TableCell>

                  <TableCell align="right">
                    <Typography sx={{ fontWeight: 800 }}>
                      Tổng {formatQuantity(totalBaseQuantity)} {baseUnit}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      Chia {formatQuantity(assignedBaseQuantity)} /{" "}
                      {formatQuantity(totalBaseQuantity)} {baseUnit}
                    </Typography>
                  </TableCell>
                </TableRow>

                {lines.map((line, index) => {
                  const saleQuantity = getSaleQuantity(
                    line.baseQuantity,
                    conversionToBase
                  );

                  const grossAmount = calculateGrossAmount({
                    price,
                    baseQuantity: line.baseQuantity,
                    conversionToBase,
                  });

                  return (
                    <TableRow key={line.id}>
                      <TableCell>{index + 2}</TableCell>

                      <TableCell align="right">
                        <TextField
                          data-f3-input={`quantity-${index}`}
                          size="small"
                          type="number"
                          value={toInputNumber(saleQuantity)}
                          onChange={(event) =>
                            handleSplitQuantityChange(index, event.target.value)
                          }
                          slotProps={{
                            htmlInput: {
                              min: 0,
                              step: 0.001,
                            },
                          }}
                          sx={{ width: 120 }}
                        />
                      </TableCell>

                      <TableCell>{saleUnit}</TableCell>

                      <TableCell align="right">
                        <TextField
                          data-f3-input={`percent-${index}`}
                          size="small"
                          type="number"
                          value={line.discountPercent}
                          onChange={(event) =>
                            handleDiscountPercentChange(index, event.target.value)
                          }
                          slotProps={{
                            htmlInput: {
                              min: 0,
                              max: 100,
                              step: 0.01,
                            },
                          }}
                          sx={{ width: 110 }}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <TextField
                          data-f3-input={`final-amount-${index}`}
                          size="small"
                          type="number"
                          value={line.finalAmount}
                          onChange={(event) =>
                            handleFinalAmountChange(index, event.target.value)
                          }
                          slotProps={{
                            htmlInput: {
                              min: 0,
                              max: grossAmount,
                            },
                          }}
                          sx={{ width: 140 }}
                        />
                      </TableCell>

                      <TableCell align="right">
                        {formatMoney(grossAmount)}
                      </TableCell>

                      <TableCell align="right">
                        <Typography sx={{ fontWeight: 800 }}>
                          {formatMoney(line.finalAmount)}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          {formatQuantity(line.baseQuantity)} {baseUnit}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Button onClick={onClose}>Hủy</Button>

            <Button variant="contained" onClick={save}>
              Lưu
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}