import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import ReportCard from './ReportCard';

const pieData = [
  { name: 'Certified', value: 20 },
  { name: 'Warning', value: 20 },
  { name: 'Flagged', value: 20 },
  { name: 'Pending', value: 20 },
  { name: 'Other', value: 20 },
];
const COLORS = ['#4fc3f7', '#81c784', '#ffd54f', '#ff8a65', '#e3eafc'];

const TrustScoreCard = ({ variant }) => (
  <ReportCard title="Security & Trust Score" minHeight={variant === 'compact' ? 180 : 220}>
    <Stack direction={variant === 'compact' ? 'row' : 'column'} alignItems="center" spacing={2}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 700, color: '#1976d2' }}>82</Typography>
        <Typography variant="body2">Active Alerts</Typography>
        <Typography variant="body2" color="success.main">Compliance</Typography>
      </Box>
      <Box sx={{ width: variant === 'compact' ? 100 : 140, height: variant === 'compact' ? 100 : 140 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={variant === 'compact' ? 30 : 45}
              outerRadius={variant === 'compact' ? 45 : 60}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Stack>
  </ReportCard>
);

export default TrustScoreCard; 