import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

const EventsTimeline = () => (
  <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }} elevation={1}>
    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
      Notable Events Timeline
    </Typography>
    <Box sx={{ color: 'text.secondary', minHeight: 80 }}>
      [Placeholder for AI-detected anomalies, unauthorized access attempts, high-value transactions, failed/flagged contracts]
    </Box>
  </Paper>
);

export default EventsTimeline; 