import {
  AppBar,
  Box,
  Button,
  InputAdornment,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  Add,
  Edit,
  Search,
  ShoppingCart,
  SwapHoriz,
} from "@mui/icons-material";

import type { CartItem } from "../../types/pos";

interface PosHeaderProps {
  searchText: string;
  selectedItem: CartItem | null;
  onSearchTextChange: (value: string) => void;
  onQuickSearch: () => void;
  onOpenProductLookup: () => void;
  onOpenEditDialog: () => void;
  onOpenUnitDialog: () => void;
}

export function PosHeader({
  searchText,
  selectedItem,
  onSearchTextChange,
  onQuickSearch,
  onOpenProductLookup,
  onOpenEditDialog,
  onOpenUnitDialog,
}: PosHeaderProps) {
  return (
    <AppBar position="static" elevation={0} sx={{ bgcolor: "#0f172a" }}>
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          minHeight: 64,
        }}
      >
        <ShoppingCart />

        <Typography sx={{ mr: 1, fontWeight: 900 }}>
          POS Bán hàng
        </Typography>

        <TextField
          value={searchText}
          onChange={(event) => onSearchTextChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onQuickSearch();
            }
          }}
          size="small"
          placeholder="Mã bán, mã vạch, tên hàng..."
          sx={{
            width: 460,
            bgcolor: "white",
            borderRadius: 2,
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            },
          }}
        />

        <Button
          variant="contained"
          color="warning"
          onClick={onOpenProductLookup}
        >
          F4 Tra cứu
        </Button>

        <Button
          variant="contained"
          color="info"
          startIcon={<SwapHoriz />}
          disabled={!selectedItem}
          onClick={onOpenUnitDialog}
        >
          Alt+U ĐVT
        </Button>

        <Button
          variant="contained"
          color="secondary"
          startIcon={<Edit />}
          disabled={!selectedItem}
          onClick={onOpenEditDialog}
        >
          F3 Giảm giá
        </Button>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onQuickSearch}
        >
          Thêm
        </Button>

        <Box sx={{ flex: 1 }} />

        <Typography sx={{ fontWeight: 700 }}>
          Thu ngân: ANHVU
        </Typography>
      </Toolbar>
    </AppBar>
  );
}