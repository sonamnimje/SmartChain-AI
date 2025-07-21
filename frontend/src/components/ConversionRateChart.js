import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchCustomerStats } from '../api';

const COLORS = ['#4fc3f7', '#e3eafc'];

const ConversionRateChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const stats = await fetchCustomerStats();
        // Buyers: customers with orders > 0
        const buyers = stats.filter(c => c.orders > 0).length;
        // Non-buyers: not available unless you have total customer count
        // For now, show only buyers
        const chartData = [
          { name: 'Buyers', value: buyers },
        ];
        if (isMounted) setData(chartData);
      } catch (e) {
        setError('Failed to load customer stats');
      } finally {
        setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data.length) return <Alert severity="info">No customer stats available.</Alert>;

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 700, color: '#2d3a4b' }}>Conversion Rate</Typography>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={70}
            fill="#8884d8"
            paddingAngle={3}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default ConversionRateChart; 