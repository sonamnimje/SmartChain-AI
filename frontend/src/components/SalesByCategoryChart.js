import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ResponsiveContainer } from 'recharts';
import { fetchSalesTrends } from '../api';

const formatINR = (value) => `₹${Number(value).toLocaleString('en-IN')}`;

const SalesByCategoryChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const sales = await fetchSalesTrends();
        // Group by product (category)
        const productMap = {};
        sales.forEach(item => {
          if (!item.product) return;
          if (!productMap[item.product]) {
            productMap[item.product] = { name: item.product, netSales: 0, grossProfit: 0 };
          }
          productMap[item.product].netSales += item.sales || 0;
          productMap[item.product].grossProfit += item.sales || 0; // Placeholder, adjust if you have profit data
        });
        const chartData = Object.values(productMap);
        if (isMounted) setData(chartData);
      } catch (e) {
        setError('Failed to load sales data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data.length) return <Alert severity="info">No sales data available for categories.</Alert>;

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 700, color: '#2d3a4b' }}>Sales by Category, '000s (INR)</Typography>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" tickFormatter={formatINR} />
          <Tooltip formatter={(value) => formatINR(value)} />
          <Legend />
          <Bar yAxisId="left" dataKey="netSales" fill="#4fc3f7" name="Net sales (INR)" barSize={30} />
          <Line yAxisId="left" type="monotone" dataKey="grossProfit" stroke="#ff8a65" name="Gross profit (INR)" dot />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default SalesByCategoryChart; 