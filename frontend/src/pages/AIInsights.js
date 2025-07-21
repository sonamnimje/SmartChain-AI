import React, { useEffect, useState } from 'react';
import api from '../api';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TimelineIcon from '@mui/icons-material/Timeline';

const typeIcon = {
  reorder_recommendation: <LightbulbIcon color="warning" fontSize="large" />,
  vendor_performance: <TrendingUpIcon color="primary" fontSize="large" />,
  price_trend: <TimelineIcon color="success" fontSize="large" />,
  order_delay_risk: <WarningAmberIcon color="error" fontSize="large" />,
  suggested_vendors: <LightbulbIcon color="info" fontSize="large" />,
  prediction: <TrendingUpIcon color="primary" fontSize="large" />,
  anomaly: <WarningAmberIcon color="error" fontSize="large" />,
  recommendation: <LightbulbIcon color="warning" fontSize="large" />,
  forecast: <TimelineIcon color="success" fontSize="large" />,
};

function AIInsights() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchInsights = () => {
      api.get('/ai/smart-insights')
        .then(res => {
          if (isMounted) setInsights(res.data);
        })
        .catch(() => {
          if (isMounted) setError('Failed to fetch AI insights');
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    };

    fetchInsights(); // initial fetch
    const interval = setInterval(fetchInsights, 5000); // fetch every 5 seconds

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>AI Insights</Typography>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {insights
          .filter(insight => insight.type !== 'price_trend' && insight.type !== 'suggested_vendors')
          .map((insight, idx) => (
            <Grid item xs={12} md={6} lg={4} key={idx}>
              <Card elevation={3} sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {typeIcon[insight.type] || <LightbulbIcon color="disabled" fontSize="large" />}
                    <Typography variant="h6" sx={{ ml: 2 }}>
                      {insight.type ? insight.type.charAt(0).toUpperCase() + insight.type.slice(1) : 'Insight'}
                    </Typography>
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>{insight.summary}</Typography>
                  <Typography variant="body2" color="textSecondary">{insight.details}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
      </Grid>
    </Box>
  );
}

export default AIInsights; 