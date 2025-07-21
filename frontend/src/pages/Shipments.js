import React, { useEffect, useState } from 'react';
import api from '../api';
import {
  Box, Typography, Card, CardContent, Grid, Button, TextField, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid } from '@mui/x-data-grid';
import Chip from '@mui/material/Chip';

function Shipments() {
  // State
  const [shipments, setShipments] = useState([]);
  const [filteredShipments, setFilteredShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [form, setForm] = useState({
    order_id: '',
    delivery_id: '',
    status: 'pending',
    tracking_number: '',
    carrier: '',
    shipped_date: '',
    expected_delivery_date: '',
    notes: ''
  });

  // Fetch shipments and analytics
  useEffect(() => {
    setLoading(true);
    api.get('/shipments')
      .then(res => {
        setShipments(res.data);
        setFilteredShipments(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch shipments');
        setLoading(false);
      });
  }, []);

  // Real-time updates via WebSocket
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/alerts/ws');
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'shipment_update') {
          setShipments((prev) => {
            const found = prev.find((s) => s.id === data.shipmentId);
            if (found) {
              return prev.map((s) =>
                s.id === data.shipmentId ? { ...s, ...data.updatedFields } : s
              );
            } else {
              // If not found, add as new
              return [{ id: data.shipmentId, ...data.updatedFields }, ...prev];
            }
          });
        } else if (data.type === 'shipment_delete') {
          setShipments((prev) => prev.filter((s) => s.id !== data.shipmentId));
        } else if (data.type === 'shipment_new') {
          setShipments((prev) => [{ ...data.shipment }, ...prev]);
        } else if (data.type === 'shipment_bulk') {
          setShipments(data.shipments);
        }
      } catch (e) {
        // Ignore invalid messages
      }
    };
    return () => ws.close();
  }, []);

  // Keep filteredShipments in sync with shipments and filters
  useEffect(() => {
    let filtered = shipments;
    if (search) {
      filtered = filtered.filter(s =>
        (s.id && s.id.toString().toLowerCase().includes(search.toLowerCase())) ||
        (s.status && s.status.toLowerCase().includes(search.toLowerCase())) ||
        (s.tracking_number && s.tracking_number.toLowerCase().includes(search.toLowerCase()))
      );
    }
    if (statusFilter) {
      filtered = filtered.filter(s => s.status === statusFilter);
    }
    setFilteredShipments(filtered);
  }, [search, statusFilter, shipments]);

  // Add shipment form state
  const [selectedShipment, setSelectedShipment] = useState(null);

  // Handlers
  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleAddShipment = e => {
    e.preventDefault();
    api.post('/shipments', {
      order_id: form.order_id ? parseInt(form.order_id) : undefined,
      delivery_id: form.delivery_id ? parseInt(form.delivery_id) : undefined,
      status: form.status,
      tracking_number: form.tracking_number,
      carrier: form.carrier,
      shipped_date: form.shipped_date ? new Date(form.shipped_date).toISOString() : undefined,
      expected_delivery_date: form.expected_delivery_date ? new Date(form.expected_delivery_date).toISOString() : undefined,
      notes: form.notes
    })
      .then(res => {
        setShipments([res.data, ...shipments]);
        setShowAddForm(false);
        setForm({
          order_id: '', delivery_id: '', status: 'pending', tracking_number: '', carrier: '', shipped_date: '', expected_delivery_date: '', notes: ''
        });
        setSnackbar({ open: true, message: 'Shipment added successfully!', severity: 'success' });
      })
      .catch(() => setSnackbar({ open: true, message: 'Failed to add shipment', severity: 'error' }));
  };

  if (loading) return <Box p={4}><Typography>Loading shipments...</Typography></Box>;
  if (error) return <Box p={4}><Typography color="error">{error}</Typography></Box>;

  const statusColor = (status) => {
    if (status === 'pending') return 'warning';
    if (status === 'shipped') return 'info';
    if (status === 'delivered') return 'success';
    if (status === 'cancelled') return 'error';
    return 'default';
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'order_id', headerName: 'Order ID', width: 100 },
    { field: 'delivery_id', headerName: 'Delivery ID', width: 100 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'tracking_number', headerName: 'Tracking #', width: 140 },
    { field: 'carrier', headerName: 'Carrier', width: 120 },
    { field: 'shipped_date', headerName: 'Shipped Date', width: 140 },
    { field: 'expected_delivery_date', headerName: 'Expected Delivery', width: 160 },
    { field: 'notes', headerName: 'Notes', width: 200 },
  ];

  // Edit and Delete handlers
  const handleEditShipment = (shipment) => {
    setSelectedShipment(shipment);
    setShowAddForm(true); // Reuse add form for editing
  };

  const handleDeleteShipment = (shipment) => {
    if (window.confirm('Are you sure you want to delete this shipment?')) {
      api.delete(`/shipments/delete/${shipment.id}`)
        .then(() => {
          setShipments(shipments.filter(s => s.id !== shipment.id));
          setSnackbar({ open: true, message: 'Shipment deleted successfully!', severity: 'success' });
        })
        .catch(() => setSnackbar({ open: true, message: 'Failed to delete shipment', severity: 'error' }));
    }
  };

  return (
    <Box maxWidth={1200} mx="auto" p={3}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3} gap={1}>
        <LocalShippingIcon fontSize="large" color="primary" />
        <Typography variant="h4" fontWeight={700}>Shipments Dashboard</Typography>
      </Box>

      {/* Analytics Card */}
      {/* Removed analytics card as per new_code */}

      {/* Filters and Actions */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Search by ID, Status, Tracking #"
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
        <Select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 140, bgcolor: 'background.paper', borderRadius: 2, p: 0.5 }}
          displayEmpty
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
        <Button
          variant="outlined"
          startIcon={<span role="img" aria-label="export">📄</span>}
          onClick={() => {
            const csvRows = [
              ['ID', 'Order ID', 'Delivery ID', 'Status', 'Tracking #', 'Carrier', 'Shipped Date', 'Expected Delivery', 'Notes'],
              ...filteredShipments.map(s => [
                s.id,
                s.order_id || '–',
                s.delivery_id || '–',
                s.status,
                s.tracking_number || '–',
                s.carrier || '–',
                s.shipped_date || '–',
                s.expected_delivery_date || '–',
                s.notes || '–',
              ])
            ];
            const csvContent = csvRows.map(row => row.map(String).map(v => '"' + v.replace(/"/g, '""') + '"').join(',')).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            if (window.navigator.msSaveOrOpenBlob) {
              window.navigator.msSaveOrOpenBlob(blob, 'shipments.csv');
            } else {
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.setAttribute('download', 'shipments.csv');
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
          }}
        >
          Export Shipments (CSV)
        </Button>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowAddForm(true)}>
          Add New Shipment
        </Button>
      </Box>

      {/* DataGrid Table */}
      <Box sx={{ height: 500, width: '100%', bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2, overflowX: 'auto' }}>
        <DataGrid
          rows={filteredShipments.map(s => ({ ...s, id: s.id }))}
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

      {/* Detail Modal */}
      <Dialog open={!!selectedShipment} onClose={() => setSelectedShipment(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Shipment Details</DialogTitle>
        <DialogContent dividers>
          {selectedShipment && (
            <Box>
              <Typography><b>Shipment ID:</b> {selectedShipment.id}</Typography>
              <Typography><b>Order ID:</b> {selectedShipment.order_id || '–'}</Typography>
              <Typography><b>Delivery ID:</b> {selectedShipment.delivery_id || '–'}</Typography>
              <Typography><b>Status:</b> {selectedShipment.status}</Typography>
              <Typography><b>Tracking Number:</b> {selectedShipment.tracking_number || '–'}</Typography>
              <Typography><b>Carrier:</b> {selectedShipment.carrier || '–'}</Typography>
              <Typography><b>Shipped Date:</b> {selectedShipment.shipped_date || '–'}</Typography>
              <Typography><b>Expected Delivery:</b> {selectedShipment.expected_delivery_date || '–'}</Typography>
              <Typography><b>Notes:</b> {selectedShipment.notes || '–'}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedShipment(null)} startIcon={<CloseIcon />}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add Shipment Form */}
      <Dialog open={showAddForm} onClose={() => setShowAddForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Shipment</DialogTitle>
        <form onSubmit={handleAddShipment}>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Order ID"
                  name="order_id"
                  value={form.order_id}
                  onChange={handleFormChange}
                  fullWidth
                  type="number"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Delivery ID"
                  name="delivery_id"
                  value={form.delivery_id}
                  onChange={handleFormChange}
                  fullWidth
                  type="number"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Select
                  label="Status"
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                  fullWidth
                  displayEmpty
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="shipped">Shipped</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Tracking Number"
                  name="tracking_number"
                  value={form.tracking_number}
                  onChange={handleFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Carrier"
                  name="carrier"
                  value={form.carrier}
                  onChange={handleFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Shipped Date"
                  name="shipped_date"
                  type="date"
                  value={form.shipped_date}
                  onChange={handleFormChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Expected Delivery Date"
                  name="expected_delivery_date"
                  type="date"
                  value={form.expected_delivery_date}
                  onChange={handleFormChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Notes"
                  name="notes"
                  value={form.notes}
                  onChange={handleFormChange}
                  fullWidth
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowAddForm(false)} color="secondary">Cancel</Button>
            <Button type="submit" variant="contained">Save & Notify</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}

export default Shipments; 