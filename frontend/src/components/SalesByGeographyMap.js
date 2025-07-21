import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';

const regions = [
  { name: 'North America', percent: '75%' },
  { name: 'South America', percent: '45%' },
  { name: 'Europe', percent: '68%' },
  { name: 'Asia', percent: '65%' },
  { name: 'Australia', percent: '35%' },
  { name: 'Africa', percent: '25%' },
];

const SalesByGeographyMap = () => (
  <Box>
    <Typography variant="h6" sx={{ mb: 1, fontWeight: 700, color: '#2d3a4b' }}>Sales by Geography</Typography>
    <Paper sx={{ p: 2, borderRadius: 2, minHeight: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fafdff' }}>
      {/* Placeholder for map - replace with SVG or react-simple-maps for real map */}
      <Box sx={{ width: '100%', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
        {regions.map((region) => (
          <Box key={region.name} sx={{ minWidth: 80, bgcolor: '#e3eafc', borderRadius: 1, p: 1, m: 0.5, textAlign: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{region.percent}</Typography>
            <Typography variant="caption" color="text.secondary">{region.name}</Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  </Box>
);

export default SalesByGeographyMap; 