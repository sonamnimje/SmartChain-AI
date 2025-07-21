import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

const TrustScorePanel = () => (
  <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }} elevation={1}>
    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
      Security & Trust Score
    </Typography>
    <Box sx={{ color: 'text.secondary', minHeight: 80 }}>
      [Placeholder for AI-generated trust score, alerts, and compliance status]
    </Box>
  </Paper>
);

export default TrustScorePanel; 