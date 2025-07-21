import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import './App.css';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Shipments from './pages/Shipments';
import AIInsights from './pages/AIInsights';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import InventoryList from './components/InventoryList';
import ProductForm from './components/ProductForm';
import BatchUpload from './components/BatchUpload';
import Warehouses from './pages/Warehouses';
import WarehouseForm from './components/WarehouseForm';
import SmartPlacement from './components/SmartPlacement';
import OrderForm from './components/OrderForm';
import ProofOfDelivery from './components/ProofOfDelivery';
import Deliveries from './pages/Deliveries';
import Drivers from './components/Drivers';
import RouteOptimization from './components/RouteOptimization';
import DeliveryAnalytics from './components/DeliveryAnalytics';
import Reports from './pages/Reports';
import Forecasting from './components/Forecasting';
import Returns from './pages/Returns';
import ModelTraining from './components/ModelTraining';
import ModelPerformance from './components/ModelPerformance';
import StreamlitEmbed from './components/StreamlitEmbed';
import Settings from './pages/Settings';
import UserManagement from './components/UserManagement';
import SystemConfig from './components/SystemConfig';
import SecuritySettings from './components/SecuritySettings';
import VendorOrders from './pages/VendorOrders';
import VendorProof from './pages/VendorProof';
import DeliveryScan from './components/DeliveryScan';
import RouteNavigation from './components/RouteNavigation';
import Profile from './pages/Profile';
import Landing from './pages/Landing';
import UserManagementPage from './pages/UserManagementPage';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import InsightsIcon from '@mui/icons-material/Insights';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import PeopleIcon from '@mui/icons-material/People';
import MobileFriendlyIcon from '@mui/icons-material/MobileFriendly';
import { useState, useEffect, useRef } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import getTheme from './theme';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import Collapse from '@mui/material/Collapse';
import Autocomplete from '@mui/material/Autocomplete';
import { motion, AnimatePresence } from 'framer-motion';
import { SnackbarProvider, useSnackbar } from 'notistack';
import Badge from '@mui/material/Badge';
import Popover from '@mui/material/Popover';
import Button from '@mui/material/Button';
import api from './api';
import PersonIcon from '@mui/icons-material/Person';
import { fetchProfile } from './api';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import { logout } from './api';
import HomeIcon from '@mui/icons-material/Home';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';

const drawerWidth = 240;

const navItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory' },
  { text: 'Warehouses', icon: <WarehouseIcon />, path: '/warehouses' },
  { text: 'Orders', icon: <InboxIcon />, path: '/orders' },
  { text: 'Shipments', icon: <LocalShippingIcon />, path: '/shipments' },
  { text: 'Vendor Orders', icon: <InboxIcon />, path: '/vendor-orders' },
  { text: 'Vendor Proof', icon: <AssessmentIcon />, path: '/vendor-proof' },
  { text: 'Deliveries', icon: <LocalShippingIcon />, path: '/deliveries' },
  { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
  { text: 'Returns', icon: <AssignmentReturnIcon />, path: '/returns' },
  { text: 'AI Insights', icon: <InsightsIcon />, path: '/ai' },
  { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
];

// Role-based menu mapping
const roleMenuMap = {
  'admin': [
    'Dashboard', 'Inventory', 'Warehouses', 'Orders', 'Shipments', 'Vendor Orders', 'Vendor Proof', 'Deliveries', 'Reports', 'AI Insights', 'Profile'
  ],
  'manager': [
    'Dashboard', 'Inventory', 'Warehouses', 'Orders', 'Shipments', 'Vendor Orders', 'Vendor Proof', 'Deliveries', 'Reports', 'AI Insights', 'Profile'
  ],
  'executive': [
    'Dashboard', 'Reports', 'AI Insights', 'Profile'
  ],
  'inventory_manager': [
    'Inventory', 'Warehouses', 'Profile'
  ],
  'storekeeper': [
    'Inventory', 'Warehouses', 'Profile'
  ],
  'logistics_manager': [
    'Warehouses', 'Shipments', 'Deliveries', 'Profile'
  ],
  'warehouse_admin': [
    'Warehouses', 'Shipments', 'Deliveries', 'Profile'
  ],
  'sales_staff': [
    'Orders', 'Profile'
  ],
  'order_manager': [
    'Orders', 'Profile'
  ],
  'shipping_team': [
    'Shipments', 'Profile'
  ],
  'delivery_manager': [
    'Deliveries', 'Profile'
  ],
  'logistics_staff': [
    'Deliveries', 'Profile'
  ],
  'procurement_officer': [
    'Vendor Orders', 'Vendor Proof', 'Profile'
  ],
  'purchase_dept': [
    'Vendor Orders', 'Vendor Proof', 'Profile'
  ],
  'compliance_team': [
    'Vendor Proof', 'Profile'
  ],
  'analyst': [
    'Reports', 'AI Insights', 'Profile'
  ],
  'data_analyst': [
    'AI Insights', 'Profile'
  ],
  'operations_team': [
    'AI Insights', 'Profile'
  ],
  'user': [
    'Profile'
  ],
};

const menuPurpose = {
  'Dashboard': 'Quick overview of KPIs and system status.',
  'Inventory': 'Manage stock, quantities, and reorders.',
  'Warehouses': 'Manage and track storage locations.',
  'Orders': 'Manage customer orders and their statuses.',
  'Shipments': 'Track outgoing shipments and updates.',
  'Vendor Orders': 'Manage orders placed with vendors/suppliers.',
  'Vendor Proof': 'Upload/view vendor documents (invoices, proofs, etc.)',
  'Deliveries': 'Track deliveries to customers or stores.',
  'Reports': 'Analyze data and generate performance reports.',
  'AI Insights': 'Predictive insights (demand, forecasting, alerts).',
  'Profile': 'Manage your account and preferences.'
};

// Helper: role access map for each route
const routeRoleMap = {
  '/dashboard': ['admin','manager','executive'],
  '/inventory': ['admin','manager','inventory_manager','storekeeper'],
  '/warehouses': ['admin','manager','inventory_manager','storekeeper','logistics_manager','warehouse_admin'],
  '/orders': ['admin','manager','sales_staff','order_manager'],
  '/shipments': ['admin','manager','logistics_manager','warehouse_admin','shipping_team'],
  '/vendor-orders': ['admin','manager','procurement_officer','purchase_dept'],
  '/vendor-proof': ['admin','manager','procurement_officer','purchase_dept','compliance_team'],
  '/deliveries': ['admin','manager','logistics_manager','warehouse_admin','delivery_manager','logistics_staff'],
  '/reports': ['admin','manager','executive','analyst'],
  '/ai': ['admin','manager','executive','analyst','data_analyst','operations_team'],
  '/profile': ['*'], // All users
};

// ProtectedRoute wrapper
function ProtectedRoute({ element, path, profile }) {
  if (!profile) return null; // or a loading spinner
  const allowedRoles = routeRoleMap[path] || [];
  if (allowedRoles.includes('*') || allowedRoles.includes(profile.role?.toLowerCase()) || ['admin','manager'].includes(profile.role?.toLowerCase())) {
    return element;
  }
  // Redirect unauthorized users
  return <Navigate to="/dashboard" replace />;
}

function AppContent({ mode, toggleMode }) {
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const handleSidebarToggle = () => setSidebarOpen((prev) => !prev);
  const pathnames = location.pathname.split('/').filter((x) => x);
  const [searchValue, setSearchValue] = useState('');
  const [searchOptions, setSearchOptions] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [alertAnchor, setAlertAnchor] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [alertLoading, setAlertLoading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [profile, setProfile] = useState(null);

  // Chatbot state and logic
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  // Dynamic chatbot response using Omnidimenion backend
  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    setChatLoading(true);
    const userMessage = chatInput;
    setChatMessages([...chatMessages, { user: userMessage, ai: 'typing...' }]);
    setChatInput('');
    try {
      const token = localStorage.getItem('access');
      // Call your backend endpoint that uses Omnidimenion for chat
      const res = await fetch('http://localhost:8000/ai/omnidimenion-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage })
      });
      if (res.status === 403) {
        setChatMessages(msgs => [
          ...msgs.slice(0, -1),
          { user: userMessage, ai: "Access forbidden. Please log in again or check your permissions." }
        ]);
        setChatLoading(false);
        return;
      }
      const data = await res.json();
      const aiReply = data.reply || "Sorry, I couldn't get a response from Omnidimenion.";
      setChatMessages(msgs => {
        const updated = [...msgs];
        for (let i = updated.length - 1; i >= 0; i--) {
          if (updated[i].ai === 'typing...') {
            updated[i] = { ...updated[i], ai: aiReply };
            break;
          }
        }
        return updated;
      });
    } catch (err) {
      setChatMessages(msgs => {
        const updated = [...msgs];
        for (let i = updated.length - 1; i >= 0; i--) {
          if (updated[i].ai === 'typing...') {
            updated[i] = { ...updated[i], ai: 'Sorry, there was an error connecting to the AI service.' };
            break;
          }
        }
        return updated;
      });
    }
    setChatLoading(false);
  };

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetchProfile();
        setProfile(res.data);
      } catch (err) {
        setProfile(null);
      }
    }
    loadProfile();
  }, []);

  const wsRef = useRef(null);

  useEffect(() => {
    // Remove any state, handlers, and useEffect related to alerts/notifications
  }, []);

  // Remove IconButton, Badge, Popover, and all alert/notification logic from the navigation bar and AppContent
  // Remove any state, handlers, and useEffect related to alerts/notifications

  // Fetch search suggestions from backend
  useEffect(() => {
    if (searchValue.length > 1) {
      // Example: fetch from /search?q=searchValue
      fetch(`http://localhost:8000/search?q=${encodeURIComponent(searchValue)}`)
        .then(res => res.json())
        .then(data => setSearchOptions(data))
        .catch(() => setSearchOptions([]));
    } else {
      setSearchOptions([]);
    }
  }, [searchValue]);

  console.log('ALERTS STATE:', alerts);

  const isLanding = location.pathname === '/';
  const isFullscreenPage = ['/','/login','/signup','/forgot-password'].includes(location.pathname);
  if (isFullscreenPage) {
    if (location.pathname === '/') return <Landing />;
    if (location.pathname === '/login') return <Login />;
    if (location.pathname === '/signup') return <Signup />;
    if (location.pathname === '/forgot-password') return <ForgotPassword />;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: 'background.paper', color: 'text.primary', boxShadow: 1 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleSidebarToggle} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Breadcrumbs aria-label="breadcrumb" sx={{ flexGrow: 1 }}>
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
            {pathnames.map((value, idx) => {
              const to = `/${pathnames.slice(0, idx + 1).join('/')}`;
              return (
                <Link key={to} to={to} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </Link>
              );
            })}
          </Breadcrumbs>
          <Box sx={{ bgcolor: 'background.default', borderRadius: 1, px: 1, display: 'flex', alignItems: 'center', mr: 2, minWidth: 220 }}>
            <SearchIcon color="action" />
            <Autocomplete
              freeSolo
              open={searchOpen && searchOptions.length > 0}
              onOpen={() => setSearchOpen(true)}
              onClose={() => setSearchOpen(false)}
              options={searchOptions}
              getOptionLabel={(option) => option.label || ''}
              inputValue={searchValue}
              onInputChange={(_, value) => setSearchValue(value)}
              renderInput={(params) => (
                <InputBase
                  {...params.InputProps}
                  placeholder="Search…"
                  sx={{ ml: 1, flex: 1 }}
                  inputProps={{ ...params.inputProps, 'aria-label': 'search' }}
                />
              )}
              renderOption={(props, option) => (
                <motion.li {...props} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  {option.label}
                </motion.li>
              )}
            />
          </Box>
          <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
            <Switch checked={mode === 'dark'} onChange={toggleMode} color="default" />
          </Tooltip>
          {/* Remove IconButton, Badge, Popover, and all alert/notification logic from the navigation bar and AppContent */}
          {/* Remove any state, handlers, and useEffect related to alerts/notifications */}
          <IconButton color="inherit" onClick={handleMenu} sx={{ ml: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}><AccountCircle /></Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            <MenuItem onClick={() => { handleClose(); window.location.href = '/profile'; }}>Profile</MenuItem>
            <MenuItem onClick={() => { handleClose(); window.location.href = '/settings'; }}>Settings</MenuItem>
            <MenuItem onClick={() => { logout(); handleClose(); window.location.href = '/'; }}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        open={sidebarOpen}
        sx={{
          width: sidebarOpen ? drawerWidth : 64,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: sidebarOpen ? drawerWidth : 64,
            boxSizing: 'border-box',
            transition: 'width 0.2s',
            overflowX: 'hidden',
            bgcolor: '#223046', // Changed from 'transparent'
            background: '#223046', // Changed from linear-gradient
            color: '#fff',
            borderRight: 0,
          },
        }}
      >
        <Toolbar />
        <Box sx={{ px: 2, py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: '#223046', background: '#223046' }}>
          <Avatar
            src={profile?.avatar || undefined}
            sx={{ width: 72, height: 72, mb: 1, bgcolor: '#fff', color: '#a18cd1', fontWeight: 700, fontSize: 32 }}
          >
            {profile?.name ? profile.name[0] : 'U'}
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff', mb: 0.5 }}>{profile?.name || 'User'}</Typography>
          <Typography variant="body2" sx={{ color: '#e0e7ff', mb: 2 }}>{profile?.role || ''}</Typography>
        </Box>
        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.12)', mb: 2 }} />
        <Box sx={{ overflow: 'auto', px: 1 }}>
          <List>
            {/* Role-based menu filtering */}
            {(navItems.filter(item => {
              if (!profile?.role) return true; // Show all if role is not loaded yet
              const allowed = roleMenuMap[profile.role?.toLowerCase()] || [];
              // Admins/managers see all
              if (['admin','manager'].includes(profile.role?.toLowerCase())) return true;
              return allowed.includes(item.text);
            })).map((item) => (
              <ListItem key={item.text} disablePadding sx={{ justifyContent: sidebarOpen ? 'flex-start' : 'center' }}>
                <Tooltip title={menuPurpose[item.text] || ''} placement="right" arrow>
                  <ListItemButton
                    component={Link}
                    to={item.path}
                    selected={location.pathname === item.path}
                    sx={{
                      minHeight: 48,
                      justifyContent: sidebarOpen ? 'flex-start' : 'center',
                      px: 2.5,
                      borderRadius: 2,
                      color: '#fff',
                      fontWeight: 600,
                      '&.Mui-selected': {
                        bgcolor: '#bb8efb',
                        color: '#fff',
                      },
                      '&:hover': {
                        bgcolor: '#d1a4f7',
                        color: '#fff',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 0, mr: sidebarOpen ? 2 : 'auto', justifyContent: 'center', color: '#fff' }}>{item.icon}</ListItemIcon>
                    <Collapse in={sidebarOpen} orientation="horizontal">
                      <ListItemText primary={item.text} />
                    </Collapse>
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3, minHeight: '100vh' }}>
        <Toolbar />
        <Container maxWidth="lg">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard profile={profile} />} path="/dashboard" profile={profile} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/inventory" element={<ProtectedRoute element={<InventoryList />} path="/inventory" profile={profile} />} />
            <Route path="/inventory/add" element={<ProtectedRoute element={<ProductForm />} path="/inventory" profile={profile} />} />
            <Route path="/inventory/batch-upload" element={<ProtectedRoute element={<BatchUpload />} path="/inventory" profile={profile} />} />
            <Route path="/warehouses" element={<ProtectedRoute element={<Warehouses />} path="/warehouses" profile={profile} />} />
            <Route path="/warehouses/add" element={<ProtectedRoute element={<WarehouseForm />} path="/warehouses" profile={profile} />} />
            <Route path="/smart-placement" element={<ProtectedRoute element={<SmartPlacement />} path="/warehouses" profile={profile} />} />
            <Route path="/orders" element={<ProtectedRoute element={<Orders />} path="/orders" profile={profile} />} />
            <Route path="/shipments" element={<ProtectedRoute element={<Shipments />} path="/shipments" profile={profile} />} />
            <Route path="/orders/create" element={<ProtectedRoute element={<OrderForm />} path="/orders" profile={profile} />} />
            <Route path="/orders/proof" element={<ProtectedRoute element={<ProofOfDelivery />} path="/orders" profile={profile} />} />
            <Route path="/deliveries" element={<ProtectedRoute element={<Deliveries />} path="/deliveries" profile={profile} />} />
            <Route path="/drivers" element={<ProtectedRoute element={<Drivers />} path="/deliveries" profile={profile} />} />
            <Route path="/route-optimization" element={<ProtectedRoute element={<RouteOptimization />} path="/shipments" profile={profile} />} />
            <Route path="/delivery-analytics" element={<ProtectedRoute element={<DeliveryAnalytics />} path="/deliveries" profile={profile} />} />
            <Route path="/reports" element={<ProtectedRoute element={<Reports />} path="/reports" profile={profile} />} />
            <Route path="/forecasting" element={<ProtectedRoute element={<Forecasting />} path="/ai" profile={profile} />} />
            <Route path="/returns" element={<ProtectedRoute element={<Returns />} path="/returns" profile={profile} />} />
            <Route path="/ai" element={<ProtectedRoute element={<AIInsights />} path="/ai" profile={profile} />} />
            <Route path="/ai/model-training" element={<ProtectedRoute element={<ModelTraining />} path="/ai" profile={profile} />} />
            <Route path="/ai/model-performance" element={<ProtectedRoute element={<ModelPerformance />} path="/ai" profile={profile} />} />
            <Route path="/ai/streamlit" element={<ProtectedRoute element={<StreamlitEmbed />} path="/ai" profile={profile} />} />
            <Route path="/settings" element={<ProtectedRoute element={<Settings />} path="/settings" profile={profile} />} />
            <Route path="/settings/users" element={<UserManagement />} />
            <Route path="/settings/system" element={<SystemConfig />} />
            <Route path="/settings/security" element={<SecuritySettings />} />
            <Route path="/vendor-orders" element={<ProtectedRoute element={<VendorOrders />} path="/vendor-orders" profile={profile} />} />
            <Route path="/vendor-proof" element={<ProtectedRoute element={<VendorProof />} path="/vendor-proof" profile={profile} />} />
            <Route path="/delivery-scan" element={<ProtectedRoute element={<DeliveryScan />} path="/deliveries" profile={profile} />} />
            <Route path="/route-navigation" element={<ProtectedRoute element={<RouteNavigation />} path="/deliveries" profile={profile} />} />
            <Route path="/profile" element={<ProtectedRoute element={<Profile />} path="/profile" profile={profile} />} />
            <Route path="/users" element={<ProtectedRoute element={<UserManagementPage />} path="/users" profile={profile} />} />
          </Routes>
        </Container>
      </Box>
    </Box>
  );
}

function App() {
  const [mode, setMode] = useState('light');
  const toggleMode = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  return (
    <ThemeProvider theme={getTheme(mode)}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Router>
          <AppContent mode={mode} toggleMode={toggleMode} />
        </Router>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
