import React from 'react';
import { Box, Typography } from '@mui/material';

const DashboardHeader = () => (
  <Box sx={{ width: '100%', mb: 3, textAlign: 'center' }}>
    <Typography
      variant="h4"
      sx={{
        fontWeight: 800,
        letterSpacing: 1,
        color: '#2d3a4b',
        textTransform: 'uppercase',
        background: '#e3eafc',
        borderRadius: 2,
        py: 2,
        px: 1,
        boxShadow: 1,
        fontSize: { xs: '1.2rem', sm: '2rem', md: '2.5rem' },
      }}
    >
      RETAIL DASHBOARD – SALES BY GEO, KEY STORES & CONV. RATE
    </Typography>
  </Box>
);

export default DashboardHeader; 