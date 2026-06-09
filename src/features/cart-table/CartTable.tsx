import {
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import type { CartItem, ProductUnit } from "../../types/pos";
import {
  getBaseQuantity,
  getCartLineKey,
  getLineDiscount,
  getLineTotal,
  getSaleQuantity,
} from "../../utils/cart";
import { formatMoney, formatQuantity } from "../../utils/money";

interface CartTableProps {
  items: CartItem[];
  selectedLineKey: string | null;
  productUnits: ProductUnit[];
  onSelectLine: (lineKey: string) => void;
  onEditLine: () => void;
  onChangeLineUnit: (lineKey: string, targetUnitCode: string) => void;
  onOpenUnitDialog: (lineKey?: string) => void;
}

export function CartTable({
  items,
  selectedLineKey,
  productUnits,
  onSelectLine,
  onEditLine,
  onChangeLineUnit,
  onOpenUnitDialog,
}: CartTableProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        height: "calc(100vh - 190px)",
        overflow: "auto",
        borderRadius: 3,
        border: "1px solid #dbeafe",
      }}
    >
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Mốc</TableCell>
            <TableCell>Mã bán</TableCell>
            <TableCell>Tên hàng</TableCell>
            <TableCell>ĐVT</TableCell>
            <TableCell align="right">SL</TableCell>
            <TableCell align="right">Trừ kho</TableCell>
            <TableCell align="right">Đơn giá</TableCell>
            <TableCell align="right">Giảm</TableCell>
            <TableCell align="right">Thành tiền</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {items.map((item, index) => {
            const lineKey = getCartLineKey(item);
            const availableUnits = productUnits.filter(
              (unit) => unit.productId === item.productId
            );

            return (
              <TableRow
                key={lineKey}
                hover
                selected={lineKey === selectedLineKey}
                onClick={() => onSelectLine(lineKey)}
                onDoubleClick={onEditLine}
                sx={{
                  cursor: "pointer",
                  "&.Mui-selected": { bgcolor: "#e0f2fe" },
                  "&.Mui-selected:hover": { bgcolor: "#bae6fd" },
                }}
              >
                <TableCell>{index + 1}</TableCell>

                <TableCell>
                  <Chip
                    size="small"
                    color={item.discountPercent > 0 ? "success" : "default"}
                    label={`${item.discountPercent}%`}
                  />
                </TableCell>

                <TableCell>
                  <Typography sx={{ fontWeight: 900 }}>
                    {item.unitCode}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {lineKey}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Box>
                    <Typography sx={{ fontWeight: 700 }}>
                      {item.name}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      {item.productId}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 0.75,
                    }}
                  >
                    <TextField
                      select
                      size="small"
                      value={item.unitCode}
                      onClick={(event) => event.stopPropagation()}
                      onDoubleClick={(event) => event.stopPropagation()}
                      onChange={(event) =>
                        onChangeLineUnit(lineKey, event.target.value)
                      }
                      sx={{ width: 130 }}
                    >
                      {availableUnits.map((unit) => (
                        <MenuItem key={unit.unitCode} value={unit.unitCode}>
                          {unit.saleUnit}
                        </MenuItem>
                      ))}
                    </TextField>

                    <Button
                      size="small"
                      variant="outlined"
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpenUnitDialog(lineKey);
                      }}
                    >
                      ĐVT
                    </Button>
                  </Box>
                </TableCell>

                <TableCell align="right">
                  <Typography sx={{ fontWeight: 900 }}>
                    {formatQuantity(getSaleQuantity(item))}
                  </Typography>

                  <Typography variant="caption">{item.saleUnit}</Typography>
                </TableCell>

                <TableCell align="right">
                  {formatQuantity(getBaseQuantity(item))} {item.baseUnit}
                </TableCell>

                <TableCell align="right">{formatMoney(item.price)}</TableCell>

                <TableCell align="right">
                  {formatMoney(getLineDiscount(item))}
                </TableCell>

                <TableCell align="right">
                  <Typography color="primary" sx={{ fontWeight: 900 }}>
                    {formatMoney(getLineTotal(item))}
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}

          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={10} align="center" sx={{ py: 10 }}>
                <Typography color="text.secondary">
                  Chưa có hàng. Nhấn F4 để tra cứu.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Paper>
  );
}