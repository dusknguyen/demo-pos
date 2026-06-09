import { Box, Button, Divider, Paper, TextField, Typography } from "@mui/material";
import { Payment } from "@mui/icons-material";

import { formatMoney } from "../../utils/money";

interface PaymentPanelProps {
  totalBeforeDiscount: number;
  totalDiscount: number;
  totalAmount: number;
}

export function PaymentPanel({
  totalBeforeDiscount,
  totalDiscount,
  totalAmount,
}: PaymentPanelProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 900 }}>
        Thanh toán
      </Typography>

      <Divider />

      <SummaryRow label="Tiền hàng" value={totalBeforeDiscount} />
      <SummaryRow label="Giảm giá" value={totalDiscount} />

      <Paper sx={{ p: 1.5, bgcolor: "#eff6ff", borderRadius: 3 }}>
        <Typography sx={{ fontWeight: 700 }}>Khách cần trả</Typography>

        <Typography
          color="primary"
          sx={{
            fontWeight: 900,
            fontSize: 34,
          }}
        >
          {formatMoney(totalAmount)}
        </Typography>
      </Paper>

      <TextField
        size="small"
        label="Khách thanh toán"
        value={formatMoney(totalAmount)}
        slotProps={{
          htmlInput: {
            readOnly: true,
          },
        }}
      />

      <TextField
        size="small"
        label="Tiền thừa"
        value={formatMoney(0)}
        slotProps={{
          htmlInput: {
            readOnly: true,
          },
        }}
      />

      <TextField multiline minRows={4} label="Ghi chú" />

      <Button
        variant="contained"
        size="large"
        startIcon={<Payment />}
        sx={{
          height: 56,
          fontWeight: 900,
          borderRadius: 2,
        }}
      >
        THANH TOÁN
      </Button>

      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 3 }}>
        <Typography sx={{ fontWeight: 900 }}>Phím tắt</Typography>
        <Typography variant="body2">F4 tra cứu · F3 giảm giá</Typography>
        <Typography variant="body2">Alt+U đổi ĐVT</Typography>
        <Typography variant="body2">Ctrl+Alt+←/→ đổi nhanh ĐVT</Typography>
      </Paper>
    </Box>
  );
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Typography>{label}</Typography>

      <Typography sx={{ fontWeight: 800 }}>{formatMoney(value)}</Typography>
    </Box>
  );
}