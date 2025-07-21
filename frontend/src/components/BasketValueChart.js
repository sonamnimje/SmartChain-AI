import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchRevenueTrends, fetchSalesTrends } from '../api';

const formatINR = (value) => `₹${Number(value).toLocaleString('en-IN')}`;

const BasketValueChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const revenue = await fetchRevenueTrends();
        const sales = await fetchSalesTrends();
        // Map by date for both revenue and sales
        const revenueMap = {};
        revenue.forEach(r => { revenueMap[r.date] = r.revenue; });
        const salesMap = {};
        sales.forEach(s => {
          if (!salesMap[s.date]) salesMap[s.date] = 0;
          salesMap[s.date] += s.sales || 0;
        });
        // Calculate basket value per day
        const chartData = Object.keys(revenueMap).map(date => ({
          date,
          value: salesMap[date] ? (revenueMap[date] / salesMap[date]) : 0,
        }));
        if (isMounted) setData(chartData);
      } catch (e) {
        setError('Failed to load basket value data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data.length) return <Alert severity="info">No basket value data available.</Alert>;

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 700, color: '#2d3a4b' }}>Basket Value (avg, INR)</Typography>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={formatINR} />
          <Tooltip formatter={(value) => formatINR(value)} />
          <Line type="monotone" dataKey="value" stroke="#4fc3f7" strokeWidth={3} dot name="Basket Value (INR)" />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default BasketValueChart; 