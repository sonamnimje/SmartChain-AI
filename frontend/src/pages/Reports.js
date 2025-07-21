import React, { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Grid, FormControl, InputLabel, Select, MenuItem, TextField, Button, Stack, Switch, FormControlLabel, Chip
} from "@mui/material";
import WarehouseIcon from '@mui/icons-material/Warehouse';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box as MuiBox } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import EmailIcon from '@mui/icons-material/Email';
import SearchIcon from '@mui/icons-material/Search';
import InsightsIcon from '@mui/icons-material/Insights';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { DataGrid } from '@mui/x-data-grid';
import {
  fetchSalesTrends,
  fetchRevenueTrends,
  fetchDashboardKPIs,
  fetchVendors,
  fetchCompletedStats,
  fetchDeliveryHistoryWithOrders,
  fetchInventory,
  fetchCategories,
  fetchReports
} from '../api';
import api from '../api'; // Add this at the top if not present

const REPORT_TYPES = [
  { label: "Inventory", value: "inventory" },
  { label: "Shipments", value: "shipments" },
  { label: "Vendors", value: "vendors" },
];

const Reports = () => {
  const [reportType, setReportType] = useState("inventory");
  const [warehouse, setWarehouse] = useState("all");
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [warehouses, setWarehouses] = useState([]);

  // Remove useEffect for warehouses fetch
  // Add fetchWarehouses function
  const fetchWarehouses = async () => {
    try {
      const res = await api.get('/warehouses');
      setWarehouses(Array.isArray(res.data) ? res.data : []);
    } catch {
      setWarehouses([]);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, background: "#f7f7f7", minHeight: "100vh" }}>
      {/* Header */}
      <Typography variant="h4" fontWeight={700} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AssessmentIcon fontSize="large" color="primary" /> Reports Dashboard
      </Typography>
      {/* Filters */}
      {/* Filter bar removed as per user request */}
      {/* KPI Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 3, boxShadow: 1 }}>
            <Typography variant="h6" color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              📦 Items Low in Stock
            </Typography>
            <Typography variant="h4" fontWeight={700} color="warning.main">12</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 3, boxShadow: 1 }}>
            <Typography variant="h6" color="info.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              🚚 Late Shipments (This Week)
            </Typography>
            <Typography variant="h4" fontWeight={700} color="info.main">3</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 3, boxShadow: 1 }}>
            <Typography variant="h6" color="error.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              📈 Best-selling Item
            </Typography>
            <Typography variant="h5" fontWeight={700} color="error.main">Maggi Noodles</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 3, boxShadow: 1 }}>
            <Typography variant="h6" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              🧾 Total Inventory Value
            </Typography>
            <Typography variant="h4" fontWeight={700} color="success.main">₹3,45,000</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 3, boxShadow: 1 }}>
            <Typography variant="h6" color="primary.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              📊 Vendor Fulfillment Rate
            </Typography>
            <Typography variant="h4" fontWeight={700} color="primary.main">92%</Typography>
          </Paper>
        </Grid>
      </Grid>
      {/* Detailed Reports Tabs */}
      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2, mb: 4 }}>
        <DetailedReportsTabs />
      </Paper>
      {/* Graphs & Charts */}
      <Typography variant="h5" fontWeight={600} mb={2}>Graphs & Charts</Typography>
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 1, height: 320 }}>
            <Typography variant="subtitle1" mb={1}>📊 Monthly Shipment Volume by Vendor</Typography>
            <ShipmentBarChart />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 1, height: 320 }}>
            <Typography variant="subtitle1" mb={1}>🍩 Product Category Contribution</Typography>
            <CategoryDonutChart />
          </Paper>
        </Grid>
      </Grid>
      {/* Auto-generated Monthly Report via Email */}
      <AutoMonthlyEmailSection />
    </Box>
  );
};

export default Reports;

function DetailedReportsTabs() {
  const [tab, setTab] = React.useState(0);
  const [search, setSearch] = React.useState("");

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab label="Inventory" />
          <Tab label="Shipments" />
          <Tab label="Vendors" />
        </Tabs>
        <TextField
          size="small"
          variant="outlined"
          placeholder="Search reports..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1 }} /> }}
          sx={{ ml: 'auto', width: 260 }}
        />
      </Box>
      {tab === 0 && <InventoryReport search={search} />}
      {tab === 1 && <ShipmentReport search={search} />}
      {tab === 2 && <VendorReport search={search} />}
    </>
  );
}

function InventoryReport({ search = "" }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inventoryData, setInventoryData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetchInventory();
        setInventoryData(response);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Ensure each row has a unique id
  const filtered = inventoryData
    .filter(row => Object.values(row).some(val => String(val).toLowerCase().includes(search.toLowerCase())))
    .map((row, i) => ({
      id: row.id || i + 1,
      ...row,
    }));

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', flex: 2, minWidth: 200, renderCell: (params) => (
      <span style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{params.value}</span>
    ) },
    { field: 'stock', headerName: 'Stock', width: 100 },
    { field: 'category', headerName: 'Category', flex: 1, minWidth: 160, renderCell: (params) => (
      <span style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{params.value}</span>
    ) },
    { field: 'location', headerName: 'Warehouse', flex: 1, minWidth: 180, renderCell: (params) => (
      <span style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{params.value}</span>
    ) },
    { field: 'reorder_threshold', headerName: 'Reorder Threshold', width: 150 },
    { field: 'expiry_date', headerName: 'Expiry', minWidth: 140, flex: 1, renderCell: (params) => (
      params.value ? new Date(params.value).toLocaleDateString() : '—'
    ) },
    { field: 'warehouse_id', headerName: 'Warehouse ID', width: 120 },
    { field: 'last_updated', headerName: 'Last Updated', minWidth: 160, flex: 1, renderCell: (params) => (
      params.value ? new Date(params.value).toLocaleString() : '—'
    ) },
    { field: 'created_at', headerName: 'Created At', minWidth: 160, flex: 1, renderCell: (params) => (
      params.value ? new Date(params.value).toLocaleString() : '—'
    ) },
    { field: 'status', headerName: 'Status', width: 120, renderCell: (params) => {
      const stock = params.row.stock;
      const reorder = params.row.reorder_threshold;
      if (stock === 0) return 'Out-of-stock';
      if (reorder && stock < reorder) return 'Low';
      return 'OK';
    } },
  ];

  if (loading) return <Typography>Loading Inventory Report...</Typography>;
  if (error) return <Typography color="error">Error: {error.message}</Typography>;
  if (filtered.length === 0) return <Typography>No inventory data found.</Typography>;

  return (
    <MuiBox>
      <Typography variant="h6" mb={1}>Item-wise Stock Status</Typography>
      <Box sx={{ height: 420, width: '100%', bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2, overflowX: 'auto' }}>
        <DataGrid
          rows={filtered}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
          autoHeight
          sx={{
            '& .MuiDataGrid-row:nth-of-type(even)': { backgroundColor: 'rgba(0,0,0,0.02)' },
            '& .MuiDataGrid-columnHeaders': { backgroundColor: 'rgba(0,0,0,0.04)' },
          }}
        />
      </Box>
      <Typography variant="body2" color="warning.main" mt={2}>Low stock alerts and expiry status highlighted above.</Typography>
    </MuiBox>
  );
}

function ShipmentReport({ search = "" }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shipmentData, setShipmentData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/shipments');
        setShipmentData(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Ensure each row has a unique id
  const filtered = shipmentData
    .filter(row => Object.values(row).some(val => String(val).toLowerCase().includes(search.toLowerCase())))
    .map((row, i) => ({
      id: row.id || i + 1,
      ...row,
    }));

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'order_id', headerName: 'Order ID', width: 100 },
    { field: 'delivery_id', headerName: 'Delivery ID', width: 100 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'tracking_number', headerName: 'Tracking #', width: 140 },
    { field: 'carrier', headerName: 'Carrier', minWidth: 120, flex: 1, renderCell: (params) => (
      <span style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{params.value}</span>
    ) },
    { field: 'shipped_date', headerName: 'Shipped Date', minWidth: 140, flex: 1, renderCell: (params) => (
      params.value ? new Date(params.value).toLocaleDateString() : '—'
    ) },
    { field: 'expected_delivery_date', headerName: 'Expected Delivery', minWidth: 160, flex: 1, renderCell: (params) => (
      params.value ? new Date(params.value).toLocaleDateString() : '—'
    ) },
    { field: 'notes', headerName: 'Notes', minWidth: 200, flex: 1, renderCell: (params) => (
      <span style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{params.value}</span>
    ) },
  ];

  if (loading) return <Typography>Loading Shipment Report...</Typography>;
  if (error) return <Typography color="error">Error: {error.message}</Typography>;
  if (filtered.length === 0) return <Typography>No shipment data found.</Typography>;

  return (
    <MuiBox>
      <Typography variant="h6" mb={1}>Shipment Status Summary</Typography>
      <Box sx={{ height: 420, width: '100%', bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2, overflowX: 'auto' }}>
        <DataGrid
          rows={filtered}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
          autoHeight
          sx={{
            '& .MuiDataGrid-cell': {
              whiteSpace: 'normal !important',
              wordBreak: 'break-word',
              lineHeight: '1.4',
              alignItems: 'flex-start',
              display: 'flex',
            },
            '& .MuiDataGrid-row': { maxHeight: 'none !important' },
            '& .MuiDataGrid-cellContent': { whiteSpace: 'normal !important' },
            '& .MuiDataGrid-row:nth-of-type(even)': { backgroundColor: 'rgba(0,0,0,0.02)' },
            '& .MuiDataGrid-columnHeaders': { backgroundColor: 'rgba(0,0,0,0.04)' },
          }}
        />
      </Box>
      <Typography variant="body2" color="info.main" mt={2}>Delayed shipments and reasons are highlighted above.</Typography>
    </MuiBox>
  );
}

function SalesReport({ search = "" }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetchSalesTrends();
        setSalesData(response);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = salesData.filter(row =>
    Object.values(row).some(val => String(val).toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <Typography>Loading Sales Report...</Typography>;
  if (error) return <Typography color="error">Error: {error.message}</Typography>;
  if (filtered.length === 0) return <Typography>No sales data found.</Typography>;

  return (
    <MuiBox>
      <Typography variant="h6" mb={1}>Sales Report</Typography>
      <TableContainer sx={{ background: '#f7f9fc', borderRadius: 3, boxShadow: '0 2px 8px rgba(44, 62, 80, 0.06)' }}>
        <Table size="small" sx={{ background: '#f5f7fa', borderRadius: 2, overflow: 'hidden' }}>
          <TableHead sx={{ background: '#f0f4fa' }}>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Revenue</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Trend</TableCell>
              <TableCell>Returned/Damaged</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((row, i) => (
              <TableRow key={i}>
                <TableCell>{row.product}</TableCell>
                <TableCell>₹{row.revenue.toLocaleString()}</TableCell>
                <TableCell>{row.category}</TableCell>
                <TableCell>{row.trend}</TableCell>
                <TableCell>{row.returned}</TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={5} align="center">No results found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="body2" color="success.main" mt={2}>Top-selling items and returns are shown above.</Typography>
    </MuiBox>
  );
}

function VendorReport({ search = "" }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [proofs, setProofs] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [proofRes, vendorRes, orderRes] = await Promise.all([
          api.get('/vendor/proof/all'),
          api.get('/vendor/all'),
          api.get('/orders'),
        ]);
        setProofs(proofRes.data);
        setVendors(vendorRes.data);
        setOrders(orderRes.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : '-';

  // Ensure each row has a unique id
  const filtered = proofs
    .filter(row => Object.values(row).some(val => String(val).toLowerCase().includes(search.toLowerCase())))
    .map((row, i) => ({
      id: row.id || i + 1,
      ...row,
    }));

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'vendor_id', headerName: 'Vendor', flex: 1, minWidth: 160, renderCell: (params) => {
      const vendor = vendors.find(v => v.id === params.value);
      return vendor ? vendor.name : 'Unknown';
    } },
    { field: 'order_id', headerName: 'Order', flex: 1, minWidth: 120, renderCell: (params) => {
      const order = orders.find(o => o.id === params.value);
      return order ? order.product : `Order #${params.value}`;
    } },
    { field: 'proof_status', headerName: 'Status', width: 120, renderCell: (params) => (
      <Chip label={params.value} color={getStatusColor(params.value)} size="small" />
    ) },
    { field: 'uploaded_at', headerName: 'Uploaded', minWidth: 160, flex: 1, renderCell: (params) => formatDate(params.value) },
    { field: 'reviewed_at', headerName: 'Reviewed', minWidth: 160, flex: 1, renderCell: (params) => formatDate(params.value) },
  ];

  if (loading) return <Typography>Loading Vendor Report...</Typography>;
  if (error) return <Typography color="error">Error: {error.message}</Typography>;
  if (filtered.length === 0) return <Typography>No vendor proof data found.</Typography>;

  return (
    <MuiBox>
      <Typography variant="h6" mb={1}>Vendor Proofs</Typography>
      <Box sx={{ height: 420, width: '100%', bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2, overflowX: 'auto' }}>
        <DataGrid
          rows={filtered}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
          autoHeight
          sx={{
            '& .MuiDataGrid-row:nth-of-type(even)': { backgroundColor: 'rgba(0,0,0,0.02)' },
            '& .MuiDataGrid-columnHeaders': { backgroundColor: 'rgba(0,0,0,0.04)' },
          }}
        />
      </Box>
      <Typography variant="body2" color="primary.main" mt={2}>Vendor proof status and review times are shown above.</Typography>
    </MuiBox>
  );
}

function InventoryLineChart() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inventoryLineData, setInventoryLineData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/inventory-trends');
        setInventoryLineData(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Typography>Loading Inventory Level Trends...</Typography>;
  if (error) return <Typography color="error">Error: {error.message}</Typography>;
  if (inventoryLineData.length === 0) return <Typography>No inventory level data found.</Typography>;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={inventoryLineData} margin={{ left: 10, right: 10 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="level" stroke="#1976d2" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function ShipmentBarChart() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shipmentBarData, setShipmentBarData] = useState([]);
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/shipment-trends');
        setShipmentBarData(response.data);
        // Get vendor names from keys (excluding 'month')
        if (response.data.length > 0) {
          const keys = Object.keys(response.data[0]).filter(k => k !== 'month');
          setVendors(keys);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Typography>Loading Shipment Volume by Vendor...</Typography>;
  if (error) return <Typography color="error">Error: {error.message}</Typography>;
  if (shipmentBarData.length === 0) return <Typography>No shipment volume data found.</Typography>;

  const COLORS = ['#1976d2', '#ff9800', '#43a047', '#e91e63', '#9c27b0', '#00bcd4'];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={shipmentBarData} margin={{ left: 10, right: 10 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        {vendors.map((vendor, idx) => (
          <Bar key={vendor} dataKey={vendor} fill={COLORS[idx % COLORS.length]} name={vendor} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

function CategoryDonutChart() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryDonutData, setCategoryDonutData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetchCategories();
        setCategoryDonutData(response);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Typography>Loading Product Category Contribution...</Typography>;
  if (error) return <Typography color="error">Error: {error.message}</Typography>;
  if (categoryDonutData.length === 0) return <Typography>No product category data found.</Typography>;

  const COLORS = ['#1976d2', '#ff9800', '#43a047', '#e91e63'];
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={categoryDonutData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          fill="#1976d2"
          label
        >
          {categoryDonutData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Legend />
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

function SalesAreaChart() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salesAreaData, setSalesAreaData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetchSalesTrends();
        setSalesAreaData(response);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Typography>Loading Sales Trend (6 Months)...</Typography>;
  if (error) return <Typography color="error">Error: {error.message}</Typography>;
  if (salesAreaData.length === 0) return <Typography>No sales trend data found.</Typography>;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={salesAreaData}>
        <defs>
          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1976d2" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#1976d2" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis dataKey="month" />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Area type="monotone" dataKey="sales" stroke="#1976d2" fillOpacity={1} fill="url(#colorSales)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}


function AutoMonthlyEmailSection() {
  const [enabled, setEnabled] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [status, setStatus] = React.useState(null);

  const handleSendNow = async () => {
    setSending(true);
    setStatus(null);
    try {
      const res = await api.post('/api/send-monthly-report');
      setStatus(res.data.status || 'Report email sent!');
    } catch (err) {
      setStatus('Failed to send report: ' + (err?.response?.data?.detail || err.message));
    } finally {
      setSending(false);
    }
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2, mb: 4 }}>
      <Typography variant="h6" mb={2}>Auto-generated Monthly Report via Email</Typography>
      <FormControlLabel
        control={<Switch checked={enabled} onChange={e => setEnabled(e.target.checked)} />}
        label={enabled ? 'Enabled' : 'Disabled'}
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        color="primary"
        startIcon={<EmailIcon />}
        disabled={!enabled || sending}
        onClick={handleSendNow}
      >
        {sending ? 'Sending...' : 'Send This Month’s Report Now'}
      </Button>
      {status && <Typography mt={2} color={status.startsWith('Failed') ? 'error' : 'success.main'}>{status}</Typography>}
      <Typography variant="body2" color="text.secondary" mt={2}>
        When enabled, a summary report will be auto-emailed to your team at the end of each month.
      </Typography>
    </Paper>
  );
}

function RealTimeWarehouseTable({ selectedWarehouse }) {
  const [warehouses, setWarehouses] = React.useState([]);
  const [statusMap, setStatusMap] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const fetchWarehouses = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/warehouses', { credentials: 'include' });
      const data = await res.json();
      setWarehouses(data);
      // Fetch status for each warehouse
      const statusResults = await Promise.all(
        data.map(async (w) => {
          try {
            const res = await fetch(`/warehouses/${w.id}/status`, { credentials: 'include' });
            return [w.id, await res.json()];
          } catch {
            return [w.id, { status: 'offline', online: false }];
          }
        })
      );
      const statusObj = Object.fromEntries(statusResults);
      setStatusMap(statusObj);
      setError(null);
    } catch (err) {
      setError('Failed to fetch warehouse data');
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchWarehouses();
    const interval = setInterval(fetchWarehouses, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, [fetchWarehouses]);

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 180 },
    { field: 'location', headerName: 'Location', width: 140 },
    { field: 'status', headerName: 'Status', width: 120, renderCell: (params) => {
        const s = statusMap[params.row.id];
        const isOnline = s?.online;
        return (
          <span style={{ color: isOnline ? '#10b981' : '#ef4444', fontWeight: 600 }}>
            {isOnline ? 'Active' : 'Offline'}
          </span>
        );
      }
    },
    { field: 'items_stored', headerName: 'Items Stored', width: 120 },
    { field: 'stock_capacity', headerName: 'Stock Capacity', width: 140 },
    { field: 'last_sync', headerName: 'Last Sync', width: 180, renderCell: (params) => {
        const s = statusMap[params.row.id];
        return s?.last_sync ? new Date(s.last_sync).toLocaleString() : '—';
      }
    },
  ];

  // Filter warehouses if a specific one is selected
  const filteredWarehouses = selectedWarehouse === 'all'
    ? warehouses
    : warehouses.filter(w => String(w.id) === String(selectedWarehouse));

  return (
    <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2, mb: 4 }}>
      <Typography variant="h6" mb={2}>Real-Time Warehouse Data</Typography>
      {loading ? (
        <Typography>Loading warehouse data...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Box sx={{ height: 420, width: '100%', bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2, overflowX: 'auto' }}>
          <DataGrid
            rows={filteredWarehouses.map((w, i) => ({ id: w.id || i + 1, ...w }))}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
            autoHeight
            sx={{
              '& .MuiDataGrid-row:nth-of-type(even)': { backgroundColor: 'rgba(0,0,0,0.02)' },
              '& .MuiDataGrid-columnHeaders': { backgroundColor: 'rgba(0,0,0,0.04)' },
            }}
          />
        </Box>
      )}
    </Paper>
  );
} 