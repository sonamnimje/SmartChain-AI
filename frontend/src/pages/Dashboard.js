import React, { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography, Container, List, ListItem, ListItemText, Divider } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InsightsIcon from '@mui/icons-material/Insights';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api, { fetchDashboardKPIs } from '../api';
import DashboardQuickActions from '../components/DashboardQuickActions';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const palette = {
  primary: '#4CAF50', // Eco Green
  accent: '#5BC0EB', // Soft Blue
  background: '#f7f7f7', // Modern Neutral
  text: '#333333', // Charcoal/Dark Gray
};

const cardData = [
  {
    icon: <InventoryIcon sx={{ fontSize: 44, color: palette.primary }} />, 
    title: 'Inventory',
    route: '/inventory',
  },
  {
    icon: <InboxIcon sx={{ fontSize: 44, color: palette.primary }} />, 
    title: 'Orders',
    route: '/orders',
  },
  {
    icon: <LocalShippingIcon sx={{ fontSize: 44, color: palette.primary }} />, 
    title: 'Deliveries',
    route: '/deliveries',
  },
  {
    icon: <InsightsIcon sx={{ fontSize: 44, color: palette.primary }} />, 
    title: 'Insights',
    route: '/ai-insights',
  },
];

const salesData = [
  { name: 'Jan', sales: 120 },
  { name: 'Feb', sales: 210 },
  { name: 'Mar', sales: 320 },
  { name: 'Apr', sales: 450 },
  { name: 'May', sales: 300 },
  { name: 'Jun', sales: 520 },
  { name: 'Jul', sales: 780 },
];

export default function Dashboard({ profile }) {
  const [recentOrders, setRecentOrders] = useState([]);
  const [kpis, setKpis] = useState({ total_inventory: 0, total_orders: 0, total_shipments: 0 });
  const [alertsCount, setAlertsCount] = useState(0);
  const [loadingKPIs, setLoadingKPIs] = useState(true);

  useEffect(() => {
    api.get('/orders').then(res => {
      setRecentOrders(Array.isArray(res.data) ? res.data.slice(-5).reverse() : []);
    });
  }, []);

  useEffect(() => {
    setLoadingKPIs(true);
    fetchDashboardKPIs().then(data => {
      setKpis(data);
      setLoadingKPIs(false);
    });
    api.get('/alerts').then(res => {
      const alerts = Array.isArray(res.data) ? res.data : [];
      setAlertsCount(alerts.filter(a => !a.read).length);
    });
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: palette.background }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: 0, py: 0, height: 84, borderBottom: '1.5px solid #e0e0e0', bgcolor: '#fff', boxShadow: '0 2px 8px 0 rgba(91,192,235,0.04)' }}>
        <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', py: 0 }}>
          <DashboardIcon sx={{ fontSize: 38, color: palette.primary, mr: 2 }} />
          <Typography variant="h3" sx={{ fontWeight: 900, color: palette.text, letterSpacing: 0.5, fontSize: { xs: 28, sm: 36 } }}>
            Dashboard
          </Typography>
        </Container>
      </Box>
      {/* Quick Actions */}
      <DashboardQuickActions profile={profile} />
      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 2, mb: 0, p: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Four Main Cards Row */}
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mb: 6 }}>
          <Grid container spacing={4} justifyContent="center" alignItems="center" sx={{ width: 'auto' }}>
            {cardData.map(card => (
              <Grid item key={card.title} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Paper
                  component="a"
                  href={card.route}
                  elevation={3}
                  sx={{
                    p: 0,
                    py: 5,
                    px: 4,
                    textAlign: 'center',
                    borderRadius: 8,
                    boxShadow: '0 4px 16px 0 rgba(91,192,235,0.10)',
                    background: '#fff',
                    color: palette.text,
                    textDecoration: 'none',
                    transition: 'transform 0.18s, box-shadow 0.18s',
                    '&:hover, &:focus': {
                      transform: 'translateY(-6px) scale(1.035)',
                      boxShadow: '0 12px 32px 0 rgba(91,192,235,0.18)',
                      textDecoration: 'none',
                    },
                    minWidth: 150,
                    minHeight: 160,
                    width: 170,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: '1.5px solid #e3eafc',
                  }}
                >
                  {card.icon}
                  <Typography variant="h6" sx={{ fontWeight: 700, mt: 1.5, fontSize: 22 }}>{card.title}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
        {/* Visual Charts Section as a single card */}
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, mb: 4 }}>
          <Paper sx={{ px: { xs: 2, md: 5 }, py: 4, borderRadius: '32px', width: '100%', maxWidth: 1500, boxShadow: '0 4px 16px 0 rgba(91,192,235,0.10)' }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: palette.text, mb: 3, textAlign: 'left' }}>
              Visual Analytics
            </Typography>
            <Grid container spacing={{ xs: 2, md: 5 }} justifyContent="center" alignItems="stretch">
              <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ bgcolor: '#fff', borderRadius: 6, p: 3, boxShadow: 2, height: 340, width: 280, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingUpIcon sx={{ color: palette.accent, mr: 1, fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: palette.text }}>
                      Demand Trends
                    </Typography>
                  </Box>
                  <Box sx={{ width: '100%', height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={salesData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="sales" stroke={palette.primary} strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ bgcolor: '#fff', borderRadius: 6, p: 3, boxShadow: 2, height: 340, width: 280, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <InventoryIcon sx={{ color: palette.primary, mr: 1.5, fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: palette.text }}>
                      Stock Levels
                    </Typography>
                  </Box>
                  <Box sx={{ width: '100%', height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={salesData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="sales" stroke={palette.accent} strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ bgcolor: '#fff', borderRadius: 6, p: 3, boxShadow: 2, height: 340, width: 280, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocalShippingIcon sx={{ color: palette.text, mr: 1.5, fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: palette.text }}>
                      Route Performance
                    </Typography>
                  </Box>
                  <Box sx={{ width: '100%', height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={salesData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="sales" stroke={palette.text} strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
        {/* Lower Section: Sales Overview & Recent Orders */}
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 5, mt: 2 }}>
          <Paper sx={{ px: 5, py: 4, borderRadius: '50px', minWidth: 480, maxWidth: 480, width: 480, height: 480, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', boxShadow: '0 4px 16px 0 rgba(91,192,235,0.10)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, width: '100%' }}>
              <InsightsIcon sx={{ color: palette.accent, mr: 1, fontSize: 28 }} />
              <Typography variant="h5" sx={{ fontWeight: 800, color: palette.text, fontSize: 22 }}>
                Sales Overview
              </Typography>
            </Box>
            <Box sx={{ width: '100%', height: 260, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="sales" stroke={palette.primary} strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
          <Paper sx={{ px: 5, py: 4, borderRadius: '50px', minWidth: 480, maxWidth: 480, width: 480, height: 480, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', boxShadow: '0 4px 16px 0 rgba(91,192,235,0.10)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, width: '100%' }}>
              <InboxIcon sx={{ color: palette.primary, mr: 1.5, fontSize: 40 }} />
              <Typography variant="h5" sx={{ fontWeight: 800, color: palette.text, fontSize: 22 }}>
                Recent Orders
              </Typography>
            </Box>
            <List sx={{ p: 0, width: '100%' }}>
              {recentOrders.length === 0 && (
                <ListItem sx={{ px: 0 }}><ListItemText primary="No recent orders." /></ListItem>
              )}
              {recentOrders.map(order => (
                <React.Fragment key={order.id}>
                  <ListItem alignItems="flex-start" sx={{ px: 0, py: 1.2 }}>
                    <ListItemText
                      primary={<span style={{ fontWeight: 600 }}>{order.product}</span>}
                      secondary={<span style={{ color: '#666', fontSize: 15 }}>{order.customer_name} &mdash; Qty: {order.quantity} &mdash; <b>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</b></span>}
                    />
                  </ListItem>
                  <Divider component="li" sx={{ my: 0 }} />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}
