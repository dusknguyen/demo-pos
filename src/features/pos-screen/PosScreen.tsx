import { Box, Paper } from "@mui/material";

import { productUnits } from "../../data/productUnits";
import { usePosKeyboard } from "../../hooks/usePosKeyboard";
import { usePosSale } from "../../hooks/usePosSale";
import { CartTable } from "../cart-table/CartTable";
import { ChangeUnitDialog } from "../change-unit/ChangeUnitDialog";
import { EditCartItemDialog } from "../edit-discount/EditCartItemDialog";
import { InvoiceInfoBar } from "../invoice-info/InvoiceInfoBar";
import { PaymentPanel } from "../payment-panel/PaymentPanel";
import { PosHeader } from "../pos-header/PosHeader";
import { ProductLookupDialog } from "../product-lookup/ProductLookupDialog";

export function PosScreen() {
  const pos = usePosSale();

  usePosKeyboard({
    onChangeUnit: () => pos.openUnitDialog(),
    onF3: pos.openEditDialog,
    onF4: pos.openProductLookup,
    onNextUnit: () => pos.cycleSelectedLineUnit("next"),
    onPreviousUnit: () => pos.cycleSelectedLineUnit("previous"),
  });

  return (
    <Box sx={{ height: "100vh", bgcolor: "#eef5ff", overflow: "hidden" }}>
      <PosHeader
        searchText={pos.searchText}
        selectedItem={pos.selectedItem}
        onSearchTextChange={pos.setSearchText}
        onQuickSearch={pos.handleQuickSearch}
        onOpenProductLookup={pos.openProductLookup}
        onOpenEditDialog={pos.openEditDialog}
        onOpenUnitDialog={() => pos.openUnitDialog()}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 360px",
          height: "calc(100vh - 64px)",
        }}
      >
        <Box sx={{ p: 2, overflow: "hidden" }}>
          <InvoiceInfoBar itemCount={pos.cartItems.length} />

          <CartTable
            items={pos.cartItems}
            selectedLineKey={pos.selectedLineKey}
            productUnits={productUnits}
            onSelectLine={pos.setSelectedLineKey}
            onEditLine={pos.openEditDialog}
            onChangeLineUnit={pos.changeLineUnit}
            onOpenUnitDialog={pos.openUnitDialog}
          />
        </Box>

        <Paper
          square
          elevation={0}
          sx={{
            p: 2,
            bgcolor: "white",
            borderLeft: "1px solid #dbeafe",
          }}
        >
          <PaymentPanel
            totalBeforeDiscount={pos.totalBeforeDiscount}
            totalDiscount={pos.totalDiscount}
            totalAmount={pos.totalAmount}
          />
        </Paper>
      </Box>

      <ProductLookupDialog
        open={pos.isProductDialogOpen}
        searchText={pos.searchText}
        products={pos.filteredProducts}
        onSearchTextChange={pos.setSearchText}
        onClose={pos.closeProductLookup}
        onSelectProduct={pos.addProduct}
      />

      <ChangeUnitDialog
        open={pos.isUnitDialogOpen}
        item={pos.selectedItem}
        units={pos.availableUnits}
        onClose={pos.closeUnitDialog}
        onSave={pos.changeSelectedLineUnit}
      />

      <EditCartItemDialog
        open={pos.isEditDialogOpen}
        item={pos.selectedItem}
        relatedItems={pos.relatedItems}
        onClose={pos.closeEditDialog}
        onSave={pos.updateDiscountGroup}
      />
    </Box>
  );
}