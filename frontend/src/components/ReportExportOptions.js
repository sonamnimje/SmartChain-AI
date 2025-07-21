import React from 'react';
import { Stack, Button, Typography, Box } from '@mui/material';

const ReportExportOptions = () => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
      Export Options
    </Typography>
    <Stack direction="row" spacing={2}>
      <Button variant="outlined">Download PDF</Button>
      <Button variant="outlined">Download Excel</Button>
      <Button variant="outlined">Download CSV</Button>
      <Button variant="contained" color="primary">Generate Full Report</Button>
      <Button variant="outlined">Email/Share</Button>
    </Stack>
  </Box>
);

export default ReportExportOptions; 