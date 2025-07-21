import React, { useEffect, useState } from 'react';
import api from '../api';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import { useSnackbar } from 'notistack';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [form, setForm] = useState({ customer_name: '', product: '', quantity: 1, status: 'pending', address: '' });
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [maxQuantity, setMaxQuantity] = useState(1);
  const [location, setLocation] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [shipmentInfo, setShipmentInfo] = useState(null);
  const [lowStockAlert, setLowStockAlert] = useState('');
  const [salesRange, setSalesRange] = useState('month');

  const fetchOrders = () => {
    setLoading(true);
    let url = '/orders';
    if (statusFilter) url += `?status=${statusFilter}`;
    api.get(url)
      .then(res => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch orders');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]); // Add statusFilter to dependency array

  // Fetch products for dropdown
  useEffect(() => {
    api.get('/inventory').then(res => {
      setProducts(res.data);
    });
  }, []);

  // Fetch analytics
  useEffect(() => {
    api.get(`/orders/analytics?range=${salesRange}`).then(res => setAnalytics(res.data));
  }, [salesRange]);

  // Update max quantity when product changes
  useEffect(() => {
    const prod = products.find(p => p.name === selectedProduct);
    setMaxQuantity(prod ? prod.stock : 1);
  }, [selectedProduct, products]);

  const handleOpenDialog = (order = null) => {
    setEditOrder(order);
    setForm(order ? { customer_name: order.customer_name, product: order.product, quantity: order.quantity, status: order.status, address: order.address || '' } : { customer_name: '', product: '', quantity: 1, status: 'pending', address: '' });
    setSelectedProduct(order ? order.product : ''); // Set selected product for dropdown
    setLocation(order ? order.location : ''); // Set location for new orders
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditOrder(null);
    setForm({ customer_name: '', product: '', quantity: 1, status: 'pending', address: '' });
    setSelectedProduct(''); // Reset selected product
    setLocation(''); // Reset location
  };

  const handleChange = (e) => {
    if (e.target.name === 'product') {
      setSelectedProduct(e.target.value);
      setForm({ ...form, product: e.target.value });
    } else if (e.target.name === 'quantity') {
      setForm({ ...form, quantity: Number(e.target.value) });
    } else if (e.target.name === 'location') {
      setLocation(e.target.value);
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async () => {
    try {
      // Only include fields expected by backend
      const payload = {
        customer_name: form.customer_name,
        product: selectedProduct,
        quantity: form.quantity,
        status: form.status || 'pending',
        address: form.address,
      };
      if (editOrder) {
        await api.put(`/orders/edit/${editOrder.id}`, payload);
        enqueueSnackbar('Order updated!', { variant: 'success' });
      } else {
        const res = await api.post('/orders/add/', payload);
        setConfirmation({ ...payload, id: res.data.id });
        // Fetch shipment for this order
        const shipmentsRes = await api.get('/shipments');
        const shipment = shipmentsRes.data.find(s => s.order_id === res.data.id);
        setShipmentInfo(shipment || null);
        enqueueSnackbar('Order placed!', { variant: 'success' });
      }
      fetchOrders();
      handleCloseDialog();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail && err.response.status === 400) {
        setLowStockAlert(err.response.data.detail);
      } else {
        enqueueSnackbar('Operation failed.', { variant: 'error' });
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/orders/delete/${id}`);
      enqueueSnackbar('Order deleted!', { variant: 'success' });
      fetchOrders();
    } catch (err) {
      enqueueSnackbar('Delete failed.', { variant: 'error' });
    }
  };

  const filteredOrders = orders.filter(order =>
    (order.customer_name && order.customer_name.toLowerCase().includes(search.toLowerCase())) ||
    (order.product && order.product.toLowerCase().includes(search.toLowerCase()))
  );

  // Helper for status color
  const statusColor = (status) => {
    if (status === 'pending') return 'warning';
    if (status === 'shipped') return 'info';
    if (status === 'delivered') return 'success';
    if (status === 'cancelled') return 'error';
    return 'default';
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    {
      field: 'customer_name',
      headerName: 'Customer',
      flex: 1,
      renderCell: (params) => (
        <span title={params.value}>{params.value}</span>
      ),
    },
    {
      field: 'product',
      headerName: 'Product',
      flex: 1,
      renderCell: (params) => (
        <span title={params.value}>{params.value}</span>
      ),
    },
    { field: 'quantity', headerName: 'Quantity', width: 120, type: 'number' },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      renderCell: (params) => (
        <span style={{ color: statusColor(params.value) }}>{params.value.charAt(0).toUpperCase() + params.value.slice(1)}</span>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <>
          <IconButton onClick={() => handleOpenDialog(params.row)} size="small"><EditIcon /></IconButton>
          <IconButton onClick={() => handleDelete(params.row.id)} size="small" color="error"><DeleteIcon /></IconButton>
        </>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Top row: Place New Order (left) and Order Analytics (right) */}
      <Grid container spacing={3} alignItems="flex-start" justifyContent="space-between" wrap="nowrap">
        {/* Place Order Card */}
        <Grid item xs={12} md={4} sx={{ minWidth: 350 }}>
          <Card elevation={3} sx={{ minHeight: 400 }}>
            <CardHeader title="Place New Order" />
            <CardContent>
              <form>
                <TextField
                  margin="dense"
                  label="Customer Name"
                  name="customer_name"
                  value={form.customer_name}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <Autocomplete
                  options={products}
                  getOptionLabel={option => option.name || ''}
                  value={products.find(p => p.name === selectedProduct) || null}
                  onChange={(_, value) => {
                    setSelectedProduct(value ? value.name : '');
                    setForm({ ...form, product: value ? value.name : '' });
                  }}
                  renderInput={params => <TextField {...params} label="Product" margin="dense" fullWidth />}
                  sx={{ mb: 2 }}
                />
                <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
                  <InputLabel>Quantity</InputLabel>
                  <Select
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    label="Quantity"
                  >
                    {[...Array(maxQuantity).keys()].map(i => (
                      <MenuItem key={i+1} value={i+1}>{i+1}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  margin="dense"
                  label="Delivery Address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mb: 2 }}
                  required
                />
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleSubmit}
                  fullWidth
                  size="large"
                  sx={{ mt: 2 }}
                >
                  {editOrder ? 'Update Order' : 'Place Order'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>
        {/* Order Analytics Card (top right, visually distinct) */}
        <Grid item xs={12} md={8} sx={{ minWidth: 500 }}>
          <Card elevation={6} sx={{ minHeight: 400, border: '2px solid #1976d2', boxShadow: 6 }}>
            <CardHeader title="Order Analytics" />
            <CardContent>
              {analytics ? (
                <Grid container spacing={4} alignItems="center">
                  <Grid item xs={12} md={3} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                    <Typography variant="subtitle1">Total Orders</Typography>
                    <Typography variant="h4" color="primary.main">{analytics.total_orders}</Typography>
                  </Grid>
                  <Grid item xs={12} md={5} sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle1">Orders per Product</Typography>
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={Object.entries(analytics?.orders_per_product || {}).map(([name, value]) => ({ name: name.length > 15 ? name.slice(0, 15) + '…' : name, value }))}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="45%"
                          outerRadius={80}
                          fill="#8884d8"
                          label
                          isAnimationActive
                        >
                          {Object.entries(analytics?.orders_per_product || {}).map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1'][idx % 5]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
                      {Object.entries(analytics?.orders_per_product || {}).map(([name], idx) => (
                        <Chip key={name} label={name.length > 15 ? name.slice(0, 15) + '…' : name} size="small" style={{ background: ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1'][idx % 5], color: '#fff' }} />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Typography color="textSecondary">Loading analytics...</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Order History Card (full width, below top row) */}
      <Box sx={{ mt: 3, width: '100%' }}>
        <Typography variant="h4" gutterBottom>Order History</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search by customer or product"
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            size="small"
            sx={{ minWidth: 220 }}
          />
          <FormControl size="small" sx={{ minWidth: 140, bgcolor: 'background.paper', borderRadius: 2, p: 0.5 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={e => { setStatusFilter(e.target.value); fetchOrders(); }}
              renderValue={selected =>
                selected ? (
                  <Chip
                    label={selected.charAt(0).toUpperCase() + selected.slice(1)}
                    color={statusColor(selected)}
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                ) : 'All'
              }
            >
              <MenuItem value="">
                <Chip label="All" size="small" />
              </MenuItem>
              <MenuItem value="pending">
                <Chip label="Pending" color="warning" size="small" />
              </MenuItem>
              <MenuItem value="shipped">
                <Chip label="Shipped" color="info" size="small" />
              </MenuItem>
              <MenuItem value="delivered">
                <Chip label="Delivered" color="success" size="small" />
              </MenuItem>
              <MenuItem value="cancelled">
                <Chip label="Cancelled" color="error" size="small" />
              </MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<span role="img" aria-label="export">📄</span>}
            onClick={() => {
              const csvRows = [
                ['ID', 'Customer', 'Product', 'Quantity', 'Status'],
                ...filteredOrders.map(order => [order.id, order.customer_name, order.product, order.quantity, order.status])
              ];
              const csvContent = csvRows.map(row => row.map(String).map(v => '"' + v.replace(/"/g, '""') + '"').join(',')).join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              if (window.navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveOrOpenBlob(blob, 'orders.csv');
              } else {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.setAttribute('download', 'orders.csv');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
            }}
          >
            Export Orders (CSV)
          </Button>
        </Box>
        <Box sx={{ height: 500, width: '100%', bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2, overflowX: 'auto' }}>
          {filteredOrders.length === 0 ? (
            <Typography variant="body1" color="textSecondary" sx={{ mt: 4, textAlign: 'center' }}>
              No orders found.
            </Typography>
          ) : (
            <DataGrid
              rows={filteredOrders}
              columns={columns.map(col =>
                col.field === 'status'
                  ? { ...col, renderCell: params => (
                      <Chip
                        label={params.value.charAt(0).toUpperCase() + params.value.slice(1)}
                        color={
                          params.value === 'pending' ? 'warning' :
                          params.value === 'shipped' ? 'info' :
                          params.value === 'delivered' ? 'success' :
                          params.value === 'cancelled' ? 'error' : 'default'
                        }
                        size="small"
                        sx={{ fontWeight: 700 }}
                      />
                    ) }
                  : col
              )}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              disableSelectionOnClick
              autoHeight
              sx={{
                '& .MuiDataGrid-row:nth-of-type(even)': { backgroundColor: 'rgba(0,0,0,0.02)' },
                '& .MuiDataGrid-columnHeaders': { backgroundColor: 'rgba(0,0,0,0.04)' },
              }}
            />
          )}
        </Box>
      </Box>
      {/* Confirmation Modal */}
      <Dialog open={!!confirmation} onClose={() => { setConfirmation(null); setShipmentInfo(null); }}>
        <DialogTitle>Order Placed</DialogTitle>
        <DialogContent sx={{ textAlign: 'center', p: 4 }}>
          <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h6" gutterBottom>Order placed successfully!</Typography>
          {confirmation && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Product: {confirmation.product}</Typography>
              <Typography variant="subtitle2">Quantity: {confirmation.quantity}</Typography>
              {confirmation.location && <Typography variant="subtitle2">Location: {confirmation.location}</Typography>}
            </Box>
          )}
          {shipmentInfo && (
            <Box sx={{ mt: 3, p: 2, border: '1px solid #1976d2', borderRadius: 2, bgcolor: '#f5faff' }}>
              <Typography variant="subtitle1" color="primary">Shipment Details</Typography>
              <Typography variant="body2">Shipment ID: {shipmentInfo.id}</Typography>
              <Typography variant="body2">Status: {shipmentInfo.status}</Typography>
              <Typography variant="body2">Tracking #: {shipmentInfo.tracking_number || '–'}</Typography>
              <Typography variant="body2">Carrier: {shipmentInfo.carrier || '–'}</Typography>
              <Typography variant="body2">Shipped Date: {shipmentInfo.shipped_date ? new Date(shipmentInfo.shipped_date).toLocaleString() : '–'}</Typography>
              <Typography variant="body2">Expected Delivery: {shipmentInfo.expected_delivery_date ? new Date(shipmentInfo.expected_delivery_date).toLocaleString() : '–'}</Typography>
              <Typography variant="body2">Notes: {shipmentInfo.notes || '–'}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setConfirmation(null); setShipmentInfo(null); }} variant="contained">Close</Button>
        </DialogActions>
      </Dialog>
      {/* Low Stock Alert */}
      <Snackbar open={!!lowStockAlert} autoHideDuration={6000} onClose={() => setLowStockAlert('')}>
        <MuiAlert onClose={() => setLowStockAlert('')} severity="warning" sx={{ width: '100%' }}>
          {lowStockAlert}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}

export default Orders; 