import React from 'react';
import { Stack, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const ReportFilterBar = () => (
  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
    <FormControl size="small" sx={{ minWidth: 140 }}>
      <InputLabel>Time</InputLabel>
      <Select value="all" label="Time">
        <MenuItem value="all">All Time</MenuItem>
        <MenuItem value="daily">Daily</MenuItem>
        <MenuItem value="weekly">Weekly</MenuItem>
        <MenuItem value="monthly">Monthly</MenuItem>
        <MenuItem value="quarterly">Quarterly</MenuItem>
      </Select>
    </FormControl>
    <FormControl size="small" sx={{ minWidth: 180 }}>
      <InputLabel>Product/Category</InputLabel>
      <Select value="all" label="Product/Category">
        <MenuItem value="all">All</MenuItem>
        <MenuItem value="prodA">Product A</MenuItem>
        <MenuItem value="prodB">Product B</MenuItem>
      </Select>
    </FormControl>
    <FormControl size="small" sx={{ minWidth: 180 }}>
      <InputLabel>Store/Warehouse</InputLabel>
      <Select value="all" label="Store/Warehouse">
        <MenuItem value="all">All</MenuItem>
        <MenuItem value="store1">Store 1</MenuItem>
        <MenuItem value="store2">Store 2</MenuItem>
      </Select>
    </FormControl>
    <FormControl size="small" sx={{ minWidth: 140 }}>
      <InputLabel>Risk Level</InputLabel>
      <Select value="all" label="Risk Level">
        <MenuItem value="all">All</MenuItem>
        <MenuItem value="low">Low</MenuItem>
        <MenuItem value="medium">Medium</MenuItem>
        <MenuItem value="high">High</MenuItem>
      </Select>
    </FormControl>
  </Stack>
);

export default ReportFilterBar; 