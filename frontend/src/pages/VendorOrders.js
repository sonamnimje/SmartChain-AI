// VendorOrders.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import api from '../api';
import { fetchVendors, placeOrder } from '../api';
import axios from 'axios';
import MuiAlert from '@mui/material/Alert';
import DeleteIcon from '@mui/icons-material/Delete';

const VendorOrders = () => {
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [vendorForm, setVendorForm] = useState({ name: '', company: '', email: '', phone: '', address: '' });
  const [vendorSnackbar, setVendorSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [orderSnackbar, setOrderSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [orderDialogMsg, setOrderDialogMsg] = useState('');

  useEffect(() => {
    // Fetch inventory products
    api.get('/inventory')
      .then(res => setProducts(res.data))
      .catch(() => setProducts([]));
    // Fetch warehouses
    api.get('/warehouses')
      .then(res => setWarehouses(res.data))
      .catch(() => setWarehouses([]));
    // Fetch orders
    api.get('/orders')
      .then(res => setOrders(res.data))
      .catch(() => setOrders([]));
    // Fetch vendors from backend
    fetchVendors()
      .then(data => setVendors(data))
      .catch(() => setVendors([]));
  }, []);

  const addItem = () => {
    setOrderItems([...orderItems, { product: "", quantity: 1, unitCost: 0 }]);
  };

  const updateItem = (index, field, value) => {
    const updated = [...orderItems];
    updated[index][field] = value;
    setOrderItems(updated);
  };

  const totalCost = orderItems.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);

  const handleVendorFormChange = (e) => {
    setVendorForm({ ...vendorForm, [e.target.name]: e.target.value });
  };

  const handleVendorFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/vendor/', vendorForm); // You may need to adjust the endpoint
      setVendorSnackbar({ open: true, message: 'Vendor added!', severity: 'success' });
      setVendorForm({ name: '', company: '', email: '', phone: '', address: '' });
      fetchVendors()
        .then(data => setVendors(data))
        .catch(() => setVendors([]));
    } catch (err) {
      setVendorSnackbar({ open: true, message: 'Failed to add vendor', severity: 'error' });
    }
  };

  const handleOrderSubmit = async () => {
    if (!selectedVendor || !selectedWarehouse || orderItems.length === 0) {
      setOrderDialogMsg('Please fill all fields and add at least one item.');
      setOrderDialogOpen(true);
      return;
    }
    let allSuccess = true;
    for (const item of orderItems) {
      try {
        await placeOrder({
          customer_name: selectedVendor,
          product: item.product,
          quantity: item.quantity,
          address: selectedWarehouse // Using warehouse as address for now
        });
      } catch (err) {
        allSuccess = false;
        setOrderDialogMsg(`Failed to submit order for ${item.product}`);
        setOrderDialogOpen(true);
      }
    }
    if (allSuccess) {
      setOrderDialogMsg('All orders submitted successfully!');
      setOrderDialogOpen(true);
      setOrderItems([]);
      setSelectedVendor("");
      setSelectedWarehouse("");
      setExpectedDate("");
      // Optionally refresh orders list
      api.get('/orders')
        .then(res => setOrders(res.data))
        .catch(() => setOrders([]));
    }
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 3 }, maxWidth: 900, mx: 'auto' }}>
      <Paper elevation={4} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3, mb: 4 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>Add New Vendor</Typography>
        <Box component="form" onSubmit={handleVendorFormSubmit} display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mb={3}>
          <TextField label="Name" name="name" value={vendorForm.name} onChange={handleVendorFormChange} required size="small" fullWidth />
          <TextField label="Company" name="company" value={vendorForm.company} onChange={handleVendorFormChange} size="small" fullWidth />
          <TextField label="Email" name="email" value={vendorForm.email} onChange={handleVendorFormChange} size="small" fullWidth />
          <TextField label="Phone" name="phone" value={vendorForm.phone} onChange={handleVendorFormChange} size="small" fullWidth />
          <TextField label="Address" name="address" value={vendorForm.address} onChange={handleVendorFormChange} size="small" fullWidth />
          <Button type="submit" variant="contained" color="primary" sx={{ minWidth: 120 }}>Add Vendor</Button>
        </Box>
        <Snackbar open={vendorSnackbar.open} autoHideDuration={3000} onClose={() => setVendorSnackbar({ ...vendorSnackbar, open: false })}>
          <MuiAlert elevation={6} variant="filled" onClose={() => setVendorSnackbar({ ...vendorSnackbar, open: false })} severity={vendorSnackbar.severity}>
            {vendorSnackbar.message}
          </MuiAlert>
        </Snackbar>
      </Paper>
      <Paper elevation={4} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3, background: '#f7f9fc', boxShadow: '0 2px 8px rgba(44, 62, 80, 0.06)' }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <ShoppingCartIcon color="primary" fontSize="large" />
          <Typography variant="h5" fontWeight={700}>
            Create Vendor Order
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mb={3}>
          <FormControl fullWidth>
            <InputLabel id="vendor-label">Vendor</InputLabel>
            <Select
              labelId="vendor-label"
              value={selectedVendor}
              label="Vendor"
              onChange={e => setSelectedVendor(e.target.value)}
              size="small"
            >
              <MenuItem value=""><em>Select Vendor</em></MenuItem>
              {vendors.map((v) => (
                <MenuItem key={v.id} value={v.name}>{v.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="warehouse-label">Warehouse</InputLabel>
            <Select
              labelId="warehouse-label"
              value={selectedWarehouse}
              label="Warehouse"
              onChange={e => setSelectedWarehouse(e.target.value)}
              size="small"
            >
              <MenuItem value=""><em>Select Warehouse</em></MenuItem>
              {warehouses.map((w) => (
                <MenuItem key={w.id} value={w.name}>{w.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Expected Date"
            type="date"
            value={expectedDate}
            onChange={e => setExpectedDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
            size="small"
          />
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={addItem}
          sx={{ mb: 2 }}
        >
          Add Item
        </Button>
        <Table size="small" sx={{ mb: 2, background: '#f5f7fa', borderRadius: 2, overflow: 'hidden' }}>
          <TableHead sx={{ background: '#f0f4fa' }}>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Unit Cost (₹)</TableCell>
              <TableCell>Total (₹)</TableCell>
              <TableCell></TableCell> {/* For delete button */}
            </TableRow>
          </TableHead>
          <TableBody>
            {orderItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ color: 'text.secondary' }}>
                  No items added yet.
                </TableCell>
              </TableRow>
            ) : orderItems.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  <FormControl fullWidth size="small">
                    <Select
                      value={item.product}
                      onChange={e => updateItem(index, 'product', e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value=""><em>Select Product</em></MenuItem>
                      {products.map((p) => (
                        <MenuItem key={p.id} value={p.name}>
                          {p.name}{p.category ? ` (${p.category})` : ''}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    inputProps={{ min: 1, style: { width: 60 } }}
                    value={item.quantity}
                    onChange={e => updateItem(index, 'quantity', Number(e.target.value))}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    inputProps={{ min: 0, style: { width: 80 } }}
                    value={item.unitCost}
                    onChange={e => updateItem(index, 'unitCost', Number(e.target.value))}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography fontWeight={500}>
                    ₹{(item.quantity * item.unitCost).toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <IconButton color="error" onClick={() => {
                    const updated = [...orderItems];
                    updated.splice(index, 1);
                    setOrderItems(updated);
                  }}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Box display="flex" justifyContent="flex-end" alignItems="center" mt={2} mb={1}>
          <Typography variant="subtitle1" fontWeight={700}>
            Grand Total: ₹{totalCost.toFixed(2)}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="success"
          size="large"
          sx={{ mt: 2, borderRadius: 2, fontWeight: 600 }}
          onClick={handleOrderSubmit}
        >
          Submit Order
        </Button>
        <Snackbar open={orderSnackbar.open} autoHideDuration={3000} onClose={() => setOrderSnackbar({ ...orderSnackbar, open: false })}>
          <MuiAlert elevation={6} variant="filled" onClose={() => setOrderSnackbar({ ...orderSnackbar, open: false })} severity={orderSnackbar.severity}>
            {orderSnackbar.message}
          </MuiAlert>
        </Snackbar>
      </Paper>
      <Dialog open={orderDialogOpen} onClose={() => setOrderDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Order Status</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ py: 2, textAlign: 'center' }}>{orderDialogMsg}</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button onClick={() => setOrderDialogOpen(false)} variant="contained" color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VendorOrders; 