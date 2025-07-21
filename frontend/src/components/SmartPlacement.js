import React, { useEffect, useState } from 'react';
import api from '../api';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

function SmartPlacement() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState(null);

  useEffect(() => {
    api.get('/warehouses/smart-placement')
      .then(res => {
        setSuggestions(res.data.suggestions || res.data.message || null);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch smart placement suggestions.');
        setLoading(false);
      });
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>AI Smart Placement Suggestions</Typography>
      {Array.isArray(suggestions) && suggestions.length > 0 ? (
        <ul>
          {suggestions.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      ) : (
        <Typography variant="body1" color="textSecondary">
          {typeof suggestions === 'string' ? suggestions : 'No AI suggestions available yet.'}
        </Typography>
      )}
    </Box>
  );
}

export default SmartPlacement; 