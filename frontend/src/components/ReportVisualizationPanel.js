import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, CircularProgress, Alert, TextField, MenuItem, FormControl, InputLabel, Select, Stack } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchSalesTrends } from '../api';

const categoryPlaceholders = {
  'Transactions Reports': null, // Will show real chart
  'Smart Contract Reports': 'Smart contract deployment and status charts',
  'AI Risk & Anomaly Reports': 'Pie/heatmap of risk levels and anomalies',
  'Retail Insights': 'Sales, product, and customer insights charts',
  'Manufacturing & Inventory Reports': 'Inventory turnover, stock levels, production trends',
  'KPI/Performance Reports': 'KPI cards and performance trend lines',
  'Compliance & Audit Logs': 'Audit log timeline and compliance status',
};

const formatINR = (value) => `₹${Number(value).toLocaleString('en-IN')}`;

const TransactionsBarChart = ({ startDate, endDate, product }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const sales = await fetchSalesTrends();
        if (isMounted) {
          setData(sales);
          // Extract unique products for dropdown
          const uniqueProducts = Array.from(new Set(sales.map(s => s.product).filter(Boolean)));
          setProducts(uniqueProducts);
        }
      } catch (e) {
        setError('Failed to load transactions data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  // Filtering will be implemented after backend update

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data.length) return <Alert severity="info">No transaction data available.</Alert>;

  return (
    <>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Start Date"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={startDate}
          disabled
        />
        <TextField
          label="End Date"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={endDate}
          disabled
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Product</InputLabel>
          <Select value={product} label="Product" disabled>
            <MenuItem value="">All</MenuItem>
            {products.map((prod) => (
              <MenuItem key={prod} value={prod}>{prod}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="sales" fill="#4fc3f7" name="Transactions" />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
};

const ReportVisualizationPanel = ({ category }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [product, setProduct] = useState('');

  return (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }} elevation={1}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        Data Visualization for: {category}
      </Typography>
      <Box sx={{ color: 'text.secondary', minHeight: 80 }}>
        {category === 'Transactions Reports' ? (
          <>
            <TransactionsBarChart startDate={startDate} endDate={endDate} product={product} />
          </>
        ) : (
          categoryPlaceholders[category] || '[No visualization available]'
        )}
      </Box>
    </Paper>
  );
};

export default ReportVisualizationPanel; 