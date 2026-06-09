import { Box, Chip, Paper, TextField } from "@mui/material";

interface InvoiceInfoBarProps {
  itemCount: number;
}

export function InvoiceInfoBar({ itemCount }: InvoiceInfoBarProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        mb: 1.5,
        borderRadius: 3,
        border: "1px solid #dbeafe",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 1.5,
          flexWrap: "wrap",
        }}
      >
        <TextField
          size="small"
          label="Số hóa đơn"
          value="Tự động"
          slotProps={{
            htmlInput: {
              readOnly: true,
            },
          }}
        />

        <TextField
          size="small"
          label="Khách hàng"
          value="Khách lẻ"
          slotProps={{
            htmlInput: {
              readOnly: true,
            },
          }}
        />

        <TextField
          size="small"
          label="Kho bán"
          value="Kho tổng"
          slotProps={{
            htmlInput: {
              readOnly: true,
            },
          }}
        />

        <Chip color="primary" label={`${itemCount} dòng`} />
      </Box>
    </Paper>
  );
}