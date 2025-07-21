import React, { useEffect, useState } from 'react';
import api from '../api';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import MuiAlert from '@mui/material/Alert';

const typeSeverity = {
  capacity: 'warning',
  expiry: 'info',
  sensor: 'error',
  reorder: 'warning',
};

const WarehouseAlerts = ({ warehouseId }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!warehouseId) return;
    setLoading(true);
    api.get(`/warehouses/${warehouseId}/alerts`)
      .then(res => {
        setAlerts(res.data.alerts || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch alerts');
        setLoading(false);
      });
  }, [warehouseId]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}><CircularProgress /></Box>;
  if (error) return <MuiAlert severity="error">{error}</MuiAlert>;
  if (!alerts || alerts.length === 0) return <Typography color="textSecondary">No alerts.</Typography>;

  return (
    <Box>
      {alerts.map((a, i) => (
        <MuiAlert key={i} severity={typeSeverity[a.type] || 'info'} sx={{ mb: 2 }}>
          {a.message}
        </MuiAlert>
      ))}
    </Box>
  );
};

export default WarehouseAlerts; 