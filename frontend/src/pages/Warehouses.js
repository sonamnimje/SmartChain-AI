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
import Chip from '@mui/material/Chip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarehouseStockSummary from '../components/WarehouseStockSummary';
import InfoIcon from '@mui/icons-material/Info';
import InventoryTransfer from '../components/InventoryTransfer';
import Grid from '@mui/material/Grid';
import AssignedStaff from '../components/AssignedStaff';
import GroupIcon from '@mui/icons-material/Group';
import WarehouseAlerts from '../components/WarehouseAlerts';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import WarehouseLogs from '../components/WarehouseLogs';
import HistoryIcon from '@mui/icons-material/History';
import Snackbar from '@mui/material/Snackbar';
import SmartPlacement from '../components/SmartPlacement';

function Warehouses() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', location: '', capacity: 0 });
  const [search, setSearch] = useState('');
  const [warehouseStatus, setWarehouseStatus] = useState({});
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryWarehouseId, setSummaryWarehouseId] = useState(null);
  const [transferOpen, setTransferOpen] = useState(false);
  const [staffOpen, setStaffOpen] = useState(false);
  const [staffWarehouseId, setStaffWarehouseId] = useState(null);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [alertsWarehouseId, setAlertsWarehouseId] = useState(null);
  const [logsOpen, setLogsOpen] = useState(false);
  const [logsWarehouseId, setLogsWarehouseId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [currentUser, setCurrentUser] = useState(null);
  const [smartPlacementOpen, setSmartPlacementOpen] = useState(false);

  const fetchItems = () => {
    setLoading(true);
    api.get('/warehouses')
      .then(res => {
        setItems(res.data.map(w => ({
          ...w,
          items_stored: w.items_stored ?? 0,
          stock_capacity: w.stock_capacity ?? 0,
        })));
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch warehouses');
        setLoading(false);
      });
  };

  const fetchWarehouseStatus = async (warehouses) => {
    const statusData = {};
    await Promise.all(warehouses.map(async (w) => {
      try {
        const res = await api.get(`/warehouses/${w.id}/status`);
        statusData[w.id] = res.data;
      } catch (e) {
        statusData[w.id] = { status: 'offline', online: false };
      }
    }));
    setWarehouseStatus(statusData);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (items.length > 0) fetchWarehouseStatus(items);
  }, [items]);

  useEffect(() => {
    api.get('/auth/me')
      .then(res => setCurrentUser(res.data))
      .catch(() => setCurrentUser(null));
  }, []);

  const handleOpenDialog = (item = null) => {
    setEditItem(item);
    setForm(item ? { name: item.name, location: item.location, capacity: item.capacity } : { name: '', location: '', capacity: 0 });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditItem(null);
    setForm({ name: '', location: '', capacity: 0 });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (editItem) {
        await api.put(`/warehouses/edit/${editItem.id}`, form);
        enqueueSnackbar('Warehouse updated!', { variant: 'success' });
      } else {
        await api.post('/warehouses/add', { ...form, status: 'active' });
        enqueueSnackbar('Warehouse added!', { variant: 'success' });
      }
      fetchItems();
      handleCloseDialog();
    } catch (err) {
      enqueueSnackbar('Operation failed.', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/warehouses/delete/${id}`);
      enqueueSnackbar('Warehouse deleted!', { variant: 'success' });
      fetchItems();
    } catch (err) {
      enqueueSnackbar('Delete failed.', { variant: 'error' });
    }
  };

  const handleOpenSummary = (id) => {
    setSummaryWarehouseId(id);
    setSummaryOpen(true);
  };
  const handleCloseSummary = () => {
    setSummaryOpen(false);
    setSummaryWarehouseId(null);
  };

  const handleOpenTransfer = () => setTransferOpen(true);
  const handleCloseTransfer = () => setTransferOpen(false);
  const handleTransferSuccess = () => {
    setTransferOpen(false);
    fetchItems();
  };

  const handleOpenStaff = (id) => {
    setStaffWarehouseId(id);
    setStaffOpen(true);
  };
  const handleCloseStaff = () => {
    setStaffOpen(false);
    setStaffWarehouseId(null);
  };

  const handleOpenAlerts = (id) => {
    setAlertsWarehouseId(id);
    setAlertsOpen(true);
  };
  const handleCloseAlerts = () => {
    setAlertsOpen(false);
    setAlertsWarehouseId(null);
  };

  const handleOpenLogs = (id) => {
    setLogsWarehouseId(id);
    setLogsOpen(true);
  };
  const handleCloseLogs = () => {
    setLogsOpen(false);
    setLogsWarehouseId(null);
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    (item.location && item.location.toLowerCase().includes(search.toLowerCase()))
  );

  const isAdmin = currentUser && currentUser.role === 'admin';

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 180 },
    { field: 'location', headerName: 'Location', width: 140, minWidth: 140 },
    { field: 'status', headerName: 'Status', width: 120, renderCell: (params) => {
        // Green if items_stored > 0, else red
        const itemsStored = params.row && params.row.items_stored ? params.row.items_stored : 0;
        const isActive = true; // Always 'Active' label
        const isGreen = itemsStored > 0;
        return (
          <Chip
            icon={<CheckCircleIcon style={{ color: '#fff' }} />}
            label={'Active'}
            style={{ backgroundColor: isGreen ? '#10b981' : '#ef4444', color: '#fff', fontWeight: 600, textTransform: 'capitalize' }}
            size="small"
          />
        );
      },
    },
    { field: 'storage_capacity', headerName: 'Storage Capacity', width: 140, renderCell: (params) => (params && params.row && params.row.stock_capacity) ? params.row.stock_capacity : 0 },
    { field: 'stock_capacity', headerName: 'Stock Capacity', width: 180, renderCell: (params) => {
        const items = params.row && params.row.items_stored ? params.row.items_stored : 0;
        const cap = params.row && params.row.stock_capacity ? params.row.stock_capacity : 0;
        const percent = cap ? Math.round((items / cap) * 100) : 0;
        return `${items}/${cap} (${percent}%)`;
      },
    },
    { field: 'items_stored', headerName: 'Items Stored', width: 120 },
    { field: 'last_sync', headerName: 'Last Sync', width: 180, renderCell: (params) => {
        const lastSync = warehouseStatus[params.row.id]?.last_sync;
        return lastSync ? new Date(lastSync).toLocaleString() : '—';
      },
    },
    { field: 'info', headerName: 'Info', width: 80, renderCell: (params) => (
        <IconButton onClick={() => handleOpenSummary(params.row.id)} size="small" color="primary">
          <InfoIcon />
        </IconButton>
      ), sortable: false, filterable: false },
    { field: 'staff', headerName: 'Staff', width: 80, renderCell: (params) => (
        <IconButton onClick={() => handleOpenStaff(params.row.id)} size="small" color="primary">
          <GroupIcon />
        </IconButton>
      ), sortable: false, filterable: false },
    { field: 'alerts', headerName: 'Alerts', width: 80, renderCell: (params) => (
        <IconButton onClick={() => handleOpenAlerts(params.row.id)} size="small" color="warning">
          <NotificationsActiveIcon />
        </IconButton>
      ), sortable: false, filterable: false },
    { field: 'logs', headerName: 'Logs', width: 80, renderCell: (params) => (
        <IconButton onClick={() => handleOpenLogs(params.row.id)} size="small" color="secondary">
          <HistoryIcon />
        </IconButton>
      ), sortable: false, filterable: false },
    { field: 'actions', headerName: 'Actions', width: 120, renderCell: (params) => (
        <>
          <IconButton onClick={() => handleOpenDialog(params.row)} size="small" color="info">
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row.id)} size="small" color="error">
            <DeleteIcon />
          </IconButton>
        </>
      ), sortable: false, filterable: false },
  ];

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h4" gutterBottom>Warehouses</Typography>
              <Button variant="outlined" color="secondary" onClick={handleOpenTransfer} sx={{ mb: 2 }}>Transfer Inventory</Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center', mt: 3 }}>
              <TextField
                placeholder="Search by name or location"
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
              <Button variant="contained" color="primary" onClick={() => handleOpenDialog()} disabled={!isAdmin}>Add Warehouse</Button>
              <Button variant="outlined" color="success" onClick={() => setSmartPlacementOpen(true)} sx={{ ml: 1 }}>Smart Placement Map</Button>
            </Box>
            <Box sx={{ height: 500, width: '100%', bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2 }}>
              {filteredItems.length === 0 ? (
                <Typography variant="body1" color="textSecondary" sx={{ mt: 4, textAlign: 'center' }}>
                  No warehouses found.
                </Typography>
              ) : (
                <DataGrid
                  rows={filteredItems}
                  columns={columns}
                  pageSize={10}
                  rowsPerPageOptions={[10, 25, 50]}
                  disableSelectionOnClick
                  autoHeight
                  getRowId={row => row.id}
                />
              )}
            </Box>
            <Dialog open={dialogOpen} onClose={handleCloseDialog}>
              <DialogTitle>{editItem ? 'Edit Warehouse' : 'Add Warehouse'}</DialogTitle>
              <DialogContent>
                <TextField
                  margin="dense"
                  label="Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  margin="dense"
                  label="Location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  margin="dense"
                  label="Capacity"
                  name="capacity"
                  type="number"
                  value={form.capacity}
                  onChange={handleChange}
                  fullWidth
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained">{editItem ? 'Update' : 'Add'}</Button>
              </DialogActions>
            </Dialog>
            <Dialog open={summaryOpen} onClose={handleCloseSummary} maxWidth="sm" fullWidth>
              <DialogTitle>Stock Summary</DialogTitle>
              <DialogContent>
                {summaryWarehouseId && <WarehouseStockSummary warehouseId={summaryWarehouseId} />}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseSummary}>Close</Button>
              </DialogActions>
            </Dialog>
            <Dialog open={transferOpen} onClose={handleCloseTransfer} maxWidth="sm" fullWidth>
              <DialogTitle>Transfer Inventory</DialogTitle>
              <DialogContent>
                <InventoryTransfer onClose={handleCloseTransfer} onSuccess={handleTransferSuccess} />
              </DialogContent>
            </Dialog>
            <Dialog open={staffOpen} onClose={handleCloseStaff} maxWidth="sm" fullWidth>
              <DialogTitle>Assigned Staff</DialogTitle>
              <DialogContent>
                {staffWarehouseId && <AssignedStaff warehouseId={staffWarehouseId} />}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseStaff}>Close</Button>
              </DialogActions>
            </Dialog>
            <Dialog open={alertsOpen} onClose={handleCloseAlerts} maxWidth="sm" fullWidth>
              <DialogTitle>Warehouse Alerts</DialogTitle>
              <DialogContent>
                {alertsWarehouseId && <WarehouseAlerts warehouseId={alertsWarehouseId} />}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseAlerts}>Close</Button>
              </DialogActions>
            </Dialog>
            <Dialog open={logsOpen} onClose={handleCloseLogs} maxWidth="md" fullWidth>
              <DialogTitle>Warehouse Logs & History</DialogTitle>
              <DialogContent>
                {logsWarehouseId && <WarehouseLogs warehouseId={logsWarehouseId} />}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseLogs}>Close</Button>
              </DialogActions>
            </Dialog>
            <Dialog open={smartPlacementOpen} onClose={() => setSmartPlacementOpen(false)} maxWidth="md" fullWidth>
              <DialogTitle>Smart Placement Map</DialogTitle>
              <DialogContent>
                <SmartPlacement />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setSmartPlacementOpen(false)}>Close</Button>
              </DialogActions>
            </Dialog>
          </Box>
        </Grid>
      </Grid>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}

export default Warehouses; 