import { type KeyboardEvent, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import type { CartItem, ProductUnit } from "../../types/pos";
import { getSaleQuantity } from "../../utils/cart";
import { formatMoney, formatQuantity } from "../../utils/money";

interface ChangeUnitDialogProps {
  open: boolean;
  item: CartItem | null;
  units: ProductUnit[];
  onClose: () => void;
  onSave: (targetUnitCode: string) => void;
}

export function ChangeUnitDialog({
  open,
  item,
  units,
  onClose,
  onSave,
}: ChangeUnitDialogProps) {
  const [keyword, setKeyword] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const filteredUnits = useMemo(() => {
    const value = keyword.trim().toLowerCase();

    if (!value) return units;

    return units.filter((unit) => {
      return (
        unit.unitCode.toLowerCase().includes(value) ||
        unit.barcode.toLowerCase().includes(value) ||
        unit.saleUnit.toLowerCase().includes(value)
      );
    });
  }, [keyword, units]);

  const activeUnit = filteredUnits[activeIndex] ?? filteredUnits[0] ?? null;
  const currentSaleQuantity = item ? getSaleQuantity(item) : 0;

  useEffect(() => {
    if (!open || !item) return;

    const currentIndex = units.findIndex((unit) => unit.unitCode === item.unitCode);

    setKeyword("");
    setActiveIndex(Math.max(0, currentIndex));
  }, [open, item, units]);

  function save(): void {
    if (!activeUnit) return;

    onSave(activeUnit.unitCode);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key === "ArrowDown") {
      event.preventDefault();

      setActiveIndex((index) => Math.min(index + 1, filteredUnits.length - 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();

      save();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();

      onClose();
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      onKeyDown={handleKeyDown}
    >
      <DialogTitle sx={{ fontWeight: 900, bgcolor: "#0f172a", color: "white" }}>
        Alt+U - Đổi đơn vị tính
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
            <Typography sx={{ fontWeight: 900 }}>{item?.name}</Typography>

            {item && (
              <Typography variant="body2" color="text.secondary">
                Hiện tại: {formatQuantity(currentSaleQuantity)} {item.saleUnit} ·{" "}
                {formatQuantity(item.baseQuantity)} {item.baseUnit}
              </Typography>
            )}
          </Paper>

          <TextField
            autoFocus
            size="small"
            label="Tìm đơn vị"
            placeholder="Mã bán, mã vạch, tên đơn vị..."
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value);
              setActiveIndex(0);
            }}
          />

          <Paper sx={{ overflow: "hidden", borderRadius: 3 }}>
            <List dense disablePadding>
              {filteredUnits.map((unit, index) => {
                const selected = item?.unitCode === unit.unitCode;
                const active = index === activeIndex;

                return (
                  <ListItemButton
                    key={unit.unitCode}
                    selected={active}
                    onMouseEnter={() => setActiveIndex(index)}
                    onDoubleClick={() => onSave(unit.unitCode)}
                    sx={{
                      borderBottom: "1px solid #e5e7eb",
                      bgcolor: active ? "#e0f2fe" : "white",
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            flexWrap: "wrap",
                          }}
                        >
                          <Typography sx={{ fontWeight: 900 }}>
                            {unit.saleUnit}
                          </Typography>

                          <Chip size="small" label={unit.unitCode} />

                          {selected && (
                            <Chip size="small" color="primary" label="Đang dùng" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            Sau đổi: {formatQuantity(currentSaleQuantity)}{" "}
                            {unit.saleUnit}
                          </Typography>

                          <Typography variant="body2" color="text.secondary">
                            1 {unit.saleUnit} = {unit.conversionToBase}{" "}
                            {unit.baseUnit} · {formatMoney(unit.price)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                );
              })}

              {filteredUnits.length === 0 && (
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <Typography color="text.secondary">
                    Không tìm thấy đơn vị tính.
                  </Typography>
                </Box>
              )}
            </List>
          </Paper>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              ↑ ↓ chọn · Enter lưu · Esc đóng
            </Typography>

            <Box
              sx={{
                display: "flex",
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
        </Box>
      </DialogContent>
    </Dialog>
  );
}