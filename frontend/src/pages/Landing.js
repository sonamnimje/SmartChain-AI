import React from 'react';
import { Box, Button, Typography, Container, Stack, AppBar, Toolbar, IconButton, Grid, Paper, Divider, Link as MuiLink, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import InsightsIcon from '@mui/icons-material/Insights';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import DashboardIcon from '@mui/icons-material/Dashboard';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import PersonIcon from '@mui/icons-material/Person';
import AssessmentIcon from '@mui/icons-material/Assessment';

const features = [
  {
    icon: <InsightsIcon sx={{ fontSize: 48, color: 'primary.main' }} />, 
    title: 'AI Demand Forecasting',
    desc: 'Predict demand with advanced machine learning.'
  },
  {
    icon: <LocalShippingIcon sx={{ fontSize: 48, color: 'primary.main' }} />, 
    title: 'Real-Time Delivery Tracking',
    desc: 'Monitor deliveries as they happen.'
  },
  {
    icon: <InventoryIcon sx={{ fontSize: 48, color: 'primary.main' }} />, 
    title: 'Smart Inventory Management',
    desc: 'Optimize stock levels and reduce waste.'
  },
  {
    icon: <NotificationsActiveIcon sx={{ fontSize: 48, color: 'primary.main' }} />, 
    title: 'AI Suggestions & Alerts',
    desc: 'Get actionable insights and instant alerts.'
  },
];

const navGuide = [
  { icon: <DashboardIcon color="primary" />, label: 'Dashboard', desc: 'Overview of key metrics and quick actions.' },
  { icon: <InventoryIcon color="primary" />, label: 'Inventory', desc: 'Manage and track your inventory items.' },
  { icon: <WarehouseIcon color="primary" />, label: 'Warehouses', desc: 'View and manage warehouse locations.' },
  { icon: <InboxIcon color="primary" />, label: 'Orders', desc: 'Create and track customer orders.' },
  { icon: <LocalShippingIcon color="primary" />, label: 'Deliveries', desc: 'Monitor and optimize deliveries.' },
  { icon: <AssessmentIcon color="primary" />, label: 'Reports', desc: 'Generate and view business reports.' },
  { icon: <InsightsIcon color="primary" />, label: 'AI Insights', desc: 'Access AI-driven analytics and suggestions.' },
  { icon: <PersonIcon color="primary" />, label: 'Profile', desc: 'Manage your user profile and settings.' },
];

const Landing = () => {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = React.useState(null); // 'about', 'docs', 'contact', or null
  const handleOpen = (modal) => setOpenModal(modal);
  const handleClose = () => setOpenModal(null);
  return (
    <Box sx={{ 
      bgcolor: 'background.default', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundImage: 'linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url(/home.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}>
      {/* Header */}
      <AppBar position="static" elevation={0} color="transparent" sx={{ py: 1 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img src="/logo1.png" alt="SmartChainAI Logo" style={{ height: 40, marginRight: 12 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
              SmartChain AI
            </Typography>
          </Box>
          <Box>
            <Button variant="outlined" sx={{ mr: 2 }} onClick={() => navigate('/login')}>Login</Button>
            <Button variant="contained" onClick={() => navigate('/signup')}>Sign Up</Button>
          </Box>
        </Toolbar>
      </AppBar>
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ flex: 1, mt: 6, mb: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <Box sx={{ width: '100%', maxWidth: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 8, mx: 'auto', position: 'relative', zIndex: 2 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            Transforming Retail Supply Chains with AI
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, color: '#e0e0e0', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
            SmartChainAI uses machine learning to optimize inventory, deliveries, and demand forecasts in real-time.
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            sx={{ mt: 2, px: 6, py: 2, fontSize: '1.25rem', fontWeight: 'bold', borderRadius: 3, zIndex: 2 }} 
            onClick={() => navigate('/login')}
          >
            Get Started
          </Button>
        </Box>
        {/* Key Features */}
        <Typography variant="h4" sx={{ mt: 10, mb: 4, fontWeight: 700, textAlign: 'center', color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.5)'  }}>
          Key Features
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {features.map((feature, idx) => (
            <Grid item xs={12} sm={6} md={3} key={feature.title}>
              <Paper elevation={2} sx={{ p: 3, textAlign: 'center', height: '100%', transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'scale(1.04)', boxShadow: 6 } }}>
                {feature.icon}
                <Typography variant="h6" sx={{ fontWeight: 600, mt: 2 }}>{feature.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{feature.desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        {/* Removed Explore the Platform section */}
        
      </Container>
      <Divider sx={{ my: 0 }} />
      {/* Footer */}
      <Box sx={{ py: 3, px: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', bgcolor: 'background.paper' }}>
        <Stack direction="row" spacing={4}>
          <MuiLink href="#" underline="hover" color="inherit" onClick={() => handleOpen('about')}>About</MuiLink>
          <MuiLink href="#" underline="hover" color="inherit" onClick={() => handleOpen('docs')}>Docs</MuiLink>
          <MuiLink href="#" underline="hover" color="inherit" onClick={() => handleOpen('contact')}>Contact</MuiLink>
        </Stack>
        <Typography color="text.secondary" sx={{ mt: { xs: 2, sm: 0 } }}>
          © 2025 SmartChainAI
        </Typography>
      </Box>
      {/* Modals for footer links */}
      <Dialog open={openModal === 'about'} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>About SmartChainAI</DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            SmartChainAI is an AI-powered platform designed to optimize retail supply chains. We leverage advanced machine learning to improve inventory management, demand forecasting, and delivery tracking for modern businesses.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openModal === 'docs'} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Documentation</DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            Access our comprehensive documentation to learn how to integrate, configure, and maximize the benefits of SmartChainAI. For API references, user guides, and tutorials, please visit our Docs section (coming soon).
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openModal === 'contact'} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Contact Us</DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            Have questions or need support? Reach out to our team at <a href="mailto:support@smartchainai.com">support@smartchainai.com</a> or use the contact form on our website. We're here to help you succeed with AI-driven supply chain solutions.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Landing; 