import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { Close } from "@mui/icons-material";

import type { ProductUnit } from "../../types/pos";
import { formatMoney } from "../../utils/money";

interface ProductLookupDialogProps {
  open: boolean;
  searchText: string;
  products: ProductUnit[];
  onSearchTextChange: (value: string) => void;
  onClose: () => void;
  onSelectProduct: (product: ProductUnit) => void;
}

export function ProductLookupDialog({
  open,
  searchText,
  products,
  onSearchTextChange,
  onClose,
  onSelectProduct,
}: ProductLookupDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ fontWeight: 900, bgcolor: "#0f172a", color: "white" }}>
        F4 - Tra cứu sản phẩm
        <IconButton onClick={onClose} sx={{ position: "absolute", right: 8, top: 8, color: "white" }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2, bgcolor: "#f8fafc" }}>
        <TextField
          autoFocus
          fullWidth
          size="small"
          label="Tìm sản phẩm"
          value={searchText}
          onChange={(event) => onSearchTextChange(event.target.value)}
          sx={{ mb: 2, bgcolor: "white" }}
        />

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Mã bán</TableCell>
              <TableCell>Mã vạch</TableCell>
              <TableCell>Tên hàng</TableCell>
              <TableCell>ĐVT</TableCell>
              <TableCell align="right">Quy đổi</TableCell>
              <TableCell align="right">Giá</TableCell>
              <TableCell align="center">Chọn</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {products.map((product) => (
              <TableRow
                key={product.unitCode}
                hover
                onDoubleClick={() => onSelectProduct(product)}
                sx={{ cursor: "pointer" }}
              >
                <TableCell>{product.unitCode}</TableCell>
                <TableCell>{product.barcode}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.saleUnit}</TableCell>
                <TableCell align="right">
                  1 {product.saleUnit} = {product.conversionToBase} {product.baseUnit}
                </TableCell>
                <TableCell align="right">{formatMoney(product.price)}</TableCell>
                <TableCell align="center">
                  <Button size="small" variant="contained" onClick={() => onSelectProduct(product)}>
                    Thêm
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}