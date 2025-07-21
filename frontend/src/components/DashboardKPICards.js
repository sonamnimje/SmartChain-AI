import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, CircularProgress, Alert } from '@mui/material';
import { fetchDashboardKPIs, fetchRevenueTrends } from '../api';

const accentColors = ['#4fc3f7', '#81c784', '#ffd54f', '#ff8a65'];

const DashboardKPICards = () => {
  const [kpis, setKpis] = useState([
    { title: 'Global Sales', value: '-', accent: accentColors[0] },
    { title: 'Daily average sales', value: '-', accent: accentColors[1] },
    { title: 'Value of Customer Transaction (Average)', value: '-', accent: accentColors[2] },
    { title: 'Avg. Units by customers', value: '-', accent: accentColors[3] },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadKPIs() {
      setLoading(true);
      setError(null);
      try {
        const dashboard = await fetchDashboardKPIs();
        const revenue = await fetchRevenueTrends();
        // Example calculations (customize as needed)
        const globalSales = revenue.reduce((sum, r) => sum + (r.revenue || 0), 0);
        const dailyAvgSales = revenue.length ? (globalSales / revenue.length) : 0;
        const avgTransaction = dailyAvgSales; // Placeholder, adjust if you have transaction count
        const avgUnits = dashboard.total_inventory || '-'; // Placeholder, adjust as needed
        if (isMounted) {
          setKpis([
            { title: 'Global Sales', value: `₹${globalSales.toLocaleString('en-IN')}` , accent: accentColors[0] },
            { title: 'Daily average sales', value: `₹${dailyAvgSales.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` , accent: accentColors[1] },
            { title: 'Value of Customer Transaction (Average)', value: `₹${avgTransaction.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` , accent: accentColors[2] },
            { title: 'Avg. Units by customers', value: avgUnits, accent: accentColors[3] },
          ]);
        }
      } catch (e) {
        setError('Failed to load KPI data');
      } finally {
        setLoading(false);
      }
    }
    loadKPIs();
    return () => { isMounted = false; };
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
      {kpis.map((kpi, idx) => (
        <Paper
          key={kpi.title}
          elevation={3}
          sx={{
            flex: 1,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderTop: `6px solid ${kpi.accent}`,
            borderRadius: 2,
            minHeight: 90,
            background: '#fafdff',
          }}
        >
          <Typography variant="subtitle2" sx={{ color: '#6c7a89', fontWeight: 600, mb: 1, textAlign: 'center' }}>
            {kpi.title}
          </Typography>
          <Typography variant="h5" sx={{ color: kpi.accent, fontWeight: 800, fontSize: '2rem', textAlign: 'center' }}>
            {kpi.value}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
};

export default DashboardKPICards; 