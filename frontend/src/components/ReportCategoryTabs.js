import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';

export const reportCategories = [
  'Transactions Reports',
  'Smart Contract Reports',
  'AI Risk & Anomaly Reports',
  'Retail Insights',
  'Manufacturing & Inventory Reports',
  'KPI/Performance Reports',
  'Compliance & Audit Logs',
];

const ReportCategoryTabs = ({ value, onChange }) => (
  <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
    <Tabs
      value={value}
      onChange={onChange}
      variant="scrollable"
      scrollButtons="auto"
      aria-label="Report Category Tabs"
    >
      {reportCategories.map((cat, idx) => (
        <Tab key={cat} label={cat} value={idx} />
      ))}
    </Tabs>
  </Box>
);

export default ReportCategoryTabs; 