import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

const AIInsightsPanel = () => (
  <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }} elevation={1}>
    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
      AI Insights & Forecasts
    </Typography>
    <Box sx={{ color: 'text.secondary', minHeight: 80 }}>
      [Placeholder for demand prediction, maintenance prediction, risk scoring, recommendations]
    </Box>
  </Paper>
);

export default AIInsightsPanel; 