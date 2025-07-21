import React, { useEffect, useState } from 'react';
import api from '../api';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

const COLORS = ['#0088FE', '#00C49F'];

const WarehouseStockSummary = ({ warehouseId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!warehouseId) return;
    setLoading(true);
    api.get(`/warehouses/${warehouseId}/stock-summary`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch stock summary');
        setLoading(false);
      });
  }, [warehouseId]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data) return null;

  const used = data.items_stored || 0;
  const capacity = data.stock_capacity || 0;
  const remaining = Math.max(capacity - used, 0);
  const pieData = [
    { name: 'Used', value: used },
    { name: 'Remaining', value: remaining },
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Stock Usage</Typography>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
            {pieData.map((entry, idx) => <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />)}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <Typography variant="subtitle1" sx={{ mt: 2 }}>Top 10 Products</Typography>
      <ul>
        {data.top_products.map(p => (
          <li key={p.id}>{p.name} – {p.quantity}</li>
        ))}
      </ul>
      <Typography variant="subtitle1" sx={{ mt: 2 }}>Low Stock</Typography>
      {data.low_stock.length === 0 ? <Typography color="textSecondary">None</Typography> : (
        <ul>
          {data.low_stock.map(p => (
            <li key={p.id}>{p.name} – {p.quantity}</li>
          ))}
        </ul>
      )}
      <Typography variant="subtitle1" sx={{ mt: 2 }}>Overstock</Typography>
      {data.overstock.length === 0 ? <Typography color="textSecondary">None</Typography> : (
        <ul>
          {data.overstock.map(p => (
            <li key={p.id}>{p.name} – {p.quantity}</li>
          ))}
        </ul>
      )}
    </Box>
  );
};

export default WarehouseStockSummary; 