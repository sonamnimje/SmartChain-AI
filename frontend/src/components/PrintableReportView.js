import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

const PrintableReportView = () => (
  <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }} elevation={1}>
    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
      Printable View + Versioning
    </Typography>
    <Box sx={{ color: 'text.secondary', minHeight: 80 }}>
      [Placeholder for printable layout, version label, analyst notes, watermark]
    </Box>
  </Paper>
);

export default PrintableReportView; 