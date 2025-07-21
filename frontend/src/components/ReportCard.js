import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

const ReportCard = ({ title, children, minHeight = 220 }) => (
  <Paper sx={{ p: 3, borderRadius: 2, minHeight }} elevation={1}>
    {title && <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>{title}</Typography>}
    <Box>
      {children}
    </Box>
  </Paper>
);

export default ReportCard; 