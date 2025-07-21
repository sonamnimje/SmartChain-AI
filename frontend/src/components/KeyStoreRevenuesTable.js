import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { fetchSalesTrends } from '../api';

const formatINR = (value) => value !== '-' ? `₹${Number(value).toLocaleString('en-IN')}` : '-';

const KeyStoreRevenuesTable = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchSalesTrends();
        // The backend returns sales by date and product, not by store.
        // If you want store-level data, you need to extend the backend.
        // For now, group by product as a proxy for 'store'.
        const productMap = {};
        data.forEach(item => {
          if (!item.product) return;
          if (!productMap[item.product]) {
            productMap[item.product] = { name: item.product, total: 0 };
          }
          productMap[item.product].total += item.sales || 0;
        });
        const tableRows = Object.values(productMap).map(row => ({
          ...row,
          discount: '-',
          net: row.total,
          cogs: '-',
          profit: '-',
          margin: '-',
        }));
        if (isMounted) setRows(tableRows);
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
  if (!rows.length) return <Alert severity="info">No store-level sales data available. Please extend the backend for detailed breakdown.</Alert>;

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 700, color: '#2d3a4b' }}>Key Store Revenues</Typography>
      <TableContainer component={Paper} sx={{ boxShadow: 0, borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ background: '#e3eafc' }}>
              <TableCell>Name</TableCell>
              <TableCell>Total sales</TableCell>
              <TableCell>Discount</TableCell>
              <TableCell>Net sales</TableCell>
              <TableCell>COGS</TableCell>
              <TableCell>Gross profit</TableCell>
              <TableCell>Gross margin</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.name}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{formatINR(row.total)}</TableCell>
                <TableCell>{row.discount}</TableCell>
                <TableCell>{formatINR(row.net)}</TableCell>
                <TableCell>{row.cogs}</TableCell>
                <TableCell>{row.profit}</TableCell>
                <TableCell>{row.margin}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default KeyStoreRevenuesTable; 