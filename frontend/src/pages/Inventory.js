import React, { useEffect, useState } from 'react';
import api from '../api';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSnackbar } from 'notistack';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import DownloadIcon from '@mui/icons-material/Download';
import { saveAs } from 'file-saver';
import Tooltip from '@mui/material/Tooltip';
import useMediaQuery from '@mui/material/useMediaQuery';

function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', stock: 0, category: '', warehouse_id: '', reorder_threshold: '', expiry_date: '' });
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [warehouses, setWarehouses] = useState([]);
  const isSmallScreen = useMediaQuery('(max-width:600px)');

  const fetchItems = () => {
    setLoading(true);
    api.get('/inventory')
      .then(res => {
        console.log('API /inventory response:', res.data); // Debug log
        setItems(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch inventory');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // WebSocket for real-time inventory updates
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/alerts/ws');
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'inventory_update') {
          setItems(prevItems => {
            // Find the item by name and update its stock
            return prevItems.map(item =>
              item.name === data.product
                ? { ...item, stock: data.new_stock, last_updated: new Date().toISOString() }
                : item
            );
          });
          enqueueSnackbar(`Inventory updated: ${data.product} now has ${data.new_stock} in stock.`, { variant: 'info' });
        }
      } catch (e) {
        // Ignore invalid messages
      }
    };
    return () => ws.close();
  }, []);

  const handleOpenDialog = async (item = null) => {
    // Fetch all warehouses when dialog opens
    try {
      const res = await api.get('/warehouses');
      setWarehouses(res.data);
    } catch (err) {
      setWarehouses([]);
    }
    setEditItem(item);
    setForm(item ? {
      name: item.name,
      stock: item.stock,
      category: item.category,
      warehouse_id: item.warehouse_id || '',
      reorder_threshold: item.reorder_threshold,
      expiry_date: item.expiry_date
    } : { name: '', stock: 0, category: '', warehouse_id: '', reorder_threshold: '', expiry_date: '' });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditItem(null);
    setForm({ name: '', stock: 0, category: '', warehouse_id: '', reorder_threshold: '', expiry_date: '' });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const payload = { ...form };
      if (editItem) {
        await api.put(`/inventory/edit/${editItem.id}`, payload);
        enqueueSnackbar('Item updated!', { variant: 'success' });
      } else {
        await api.post('/inventory/add', payload);
        enqueueSnackbar('Item added!', { variant: 'success' });
      }
      fetchItems();
      handleCloseDialog();
    } catch (err) {
      enqueueSnackbar('Operation failed.', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/inventory/delete/${id}`);
      enqueueSnackbar('Item deleted!', { variant: 'success' });
      fetchItems();
    } catch (err) {
      enqueueSnackbar('Delete failed.', { variant: 'error' });
    }
  };

  // Get unique categories for filter dropdown
  const categories = Array.from(new Set(items.map(item => item.category).filter(Boolean)));

  // Filtered and searched items
  const filteredItems = items.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter ? item.category === categoryFilter : true;
    const matchesStock =
      stockFilter === 'low' ? item.stock < 10 : stockFilter === 'healthy' ? item.stock >= 10 : true;
    const matchesLocation = locationFilter ? item.location.toLowerCase().includes(locationFilter.toLowerCase()) : true;
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    return matchesSearch && matchesCategory && matchesStock && matchesLocation && matchesStatus;
  });

  // Export to CSV
  const handleExportCSV = () => {
    const csvRows = [
      ['ID', 'Name', 'Stock', 'Category'],
      ...filteredItems.map(item => [item.id, item.name, item.stock, item.category || ''])
    ];
    const csvContent = csvRows.map(row => row.map(String).map(v => '"' + v.replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'inventory.csv');
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', flex: 2, minWidth: 200, renderCell: (params) => (
      <span style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{params.value}</span>
    ) },
    { field: 'stock', headerName: 'Stock', width: 90 },
    { field: 'category', headerName: 'Category', flex: 1, minWidth: 160, renderCell: (params) => (
      <span style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{params.value}</span>
    ) },
    { field: 'location', headerName: 'Warehouse', flex: 1, minWidth: 180, renderCell: (params) => (
      <span style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{params.value}</span>
    ) },
    { field: 'reorder_threshold', headerName: 'Reorder', width: 100 },
    { field: 'expiry_date', headerName: 'Expiry', minWidth: 140, flex: 1, renderCell: (params) => (
      params.value ? new Date(params.value).toLocaleDateString() : '—'
    ) },
    { field: 'last_updated', headerName: 'Last Updated', minWidth: 160, flex: 1, renderCell: (params) => (
      params.value ? new Date(params.value).toLocaleString() : '—'
    ) },
    { field: 'created_at', headerName: 'Created At', minWidth: 160, flex: 1, renderCell: (params) => (
      params.value ? new Date(params.value).toLocaleString() : '—'
    ) },
    { field: 'status', headerName: 'Status', width: 100, renderCell: (params) => {
        let color = '#10b981';
        let label = 'OK';
        if (params.row.stock === 0) {
          color = '#ef4444';
          label = 'Out-of-stock';
        } else if (params.row.reorder_threshold && params.row.stock < params.row.reorder_threshold) {
          color = '#facc15';
          label = 'Low';
        }
        return <Chip label={label} sx={{ bgcolor: color, color: '#fff', fontWeight: 700 }} size="small" />;
      },
    },
    { field: 'actions', headerName: 'Actions', width: 120, renderCell: (params) => (
        <>
          <Tooltip title="Restock">
            <IconButton onClick={() => handleOpenDialog(params.row)} size="small" color="info">
              <span role="img" aria-label="restock">📦</span>
            </IconButton>
          </Tooltip>
          <Tooltip title="Remove Item">
            <IconButton onClick={() => handleDelete(params.row.id)} size="small" color="error">
              <span role="img" aria-label="remove">🗑️</span>
            </IconButton>
          </Tooltip>
        </>
      ), sortable: false, filterable: false },
  ];

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Inventory List</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Search by name or category"
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
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          displayEmpty
          size="small"
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories.map(cat => (
            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
          ))}
        </Select>
        <TextField placeholder="Location" value={locationFilter} onChange={e => setLocationFilter(e.target.value)} size="small" sx={{ minWidth: 120 }} />
        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} displayEmpty size="small" sx={{ minWidth: 120 }}>
          <MenuItem value="">All Status</MenuItem>
          <MenuItem value="OK">OK</MenuItem>
          <MenuItem value="Low">Low</MenuItem>
          <MenuItem value="Out-of-stock">Out-of-stock</MenuItem>
        </Select>
        <Select
          value={stockFilter}
          onChange={e => setStockFilter(e.target.value)}
          displayEmpty
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All Stock Levels</MenuItem>
          <MenuItem value="low">Low Stock (&lt; 10)</MenuItem>
          <MenuItem value="healthy">Healthy (≥ 10)</MenuItem>
        </Select>
        <Button
          variant="outlined"
          startIcon={<span role="img" aria-label="export">📄</span>}
          onClick={handleExportCSV}
        >
          Export Inventory (CSV)
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<span role="img" aria-label="add">➕</span>}
          onClick={() => handleOpenDialog()}
        >
          Add New Item
        </Button>
      </Box>
      <Box sx={{ height: 500, width: '100%', bgcolor: '#f5f5f5', borderRadius: 2, boxShadow: 2, overflowX: 'auto' }}>
        {filteredItems.length === 0 ? (
          <Typography variant="body1" color="textSecondary" sx={{ mt: 4, textAlign: 'center' }}>
            Inventory list with filters will go here.
          </Typography>
        ) : (
          <DataGrid
            rows={filteredItems}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
            autoHeight
          />
        )}
      </Box>
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>{editItem ? 'Edit Item' : 'Add Item'}</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Name" name="name" value={form.name} onChange={handleChange} fullWidth />
          <TextField margin="dense" label="Stock" name="stock" type="number" value={form.stock} onChange={handleChange} fullWidth />
          {/* Replace Location text field with Select for warehouse ID */}
          <Select
            margin="dense"
            label="Warehouse"
            name="warehouse_id"
            value={form.warehouse_id || ''}
            onChange={handleChange}
            fullWidth
            displayEmpty
            sx={{ mt: 2, mb: 1 }}
          >
            <MenuItem value=""><em>Select Warehouse</em></MenuItem>
            {warehouses.map(wh => (
              <MenuItem key={wh.id} value={wh.id}>{wh.name} {wh.location ? `(${wh.location})` : ''}</MenuItem>
            ))}
          </Select>
          <TextField margin="dense" label="Category" name="category" value={form.category} onChange={handleChange} fullWidth />
          <TextField margin="dense" label="Reorder Threshold" name="reorder_threshold" value={form.reorder_threshold} onChange={handleChange} type="number" fullWidth />
          <TextField margin="dense" label="Expiry Date" name="expiry_date" value={form.expiry_date} onChange={handleChange} type="date" InputLabelProps={{ shrink: true }} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">{editItem ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Inventory; 