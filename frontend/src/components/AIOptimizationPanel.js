import React, { useEffect, useState } from 'react';
import api from '../api';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

const typeColors = {
  transfer: 'primary.main',
  stocking: 'success.main',
  anomaly: 'error.main',
};

const AIOptimizationPanel = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get('/warehouses/ai-suggestions')
      .then(res => {
        setSuggestions(res.data.suggestions || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch AI suggestions');
        setLoading(false);
      });
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>AI Optimization Panel</Typography>
      {suggestions.length === 0 ? <Typography color="textSecondary">No suggestions</Typography> : (
        suggestions.map((s, i) => (
          <Card key={i} sx={{ mb: 2, borderLeft: 4, borderColor: typeColors[s.type] || 'grey.500' }}>
            <CardContent>
              <Typography variant="subtitle2" color={typeColors[s.type] || 'textSecondary'} gutterBottom>
                {s.type.charAt(0).toUpperCase() + s.type.slice(1)}
              </Typography>
              <Typography>{s.message}</Typography>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
};

export default AIOptimizationPanel; 