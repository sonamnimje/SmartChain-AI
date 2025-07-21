import React, { useState, useEffect } from 'react';
import api from '../api';
import {
  Box, Typography, Button, TextField, InputAdornment, Select, MenuItem, Snackbar, Paper, IconButton, CircularProgress, Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid } from '@mui/x-data-grid';
import dayjs from 'dayjs'; // Add this at the top (install with npm if needed)
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import Tooltip from '@mui/material/Tooltip';

function Returns() {
  const [returns, setReturns] = useState([]);
  const [allReturns, setAllReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    setLoading(true);
    api.get('/returns')
      .then(res => {
        setReturns(res.data);
        setAllReturns(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch returns');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let filtered = allReturns;
    if (search) {
      filtered = filtered.filter(r =>
        (r.id && r.id.toString().toLowerCase().includes(search.toLowerCase())) ||
        (r.customer && r.customer.toLowerCase().includes(search.toLowerCase()))
      );
    }
    if (statusFilter) {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    setReturns(filtered);
  }, [search, statusFilter, allReturns]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/alerts/ws');
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'return_update') {
          setReturns(prev => {
            // Remove if already exists, then add new/updated at the top
            const updated = prev.filter(r => r.id !== data.data.id);
            return [data.data, ...updated];
          });
          setAllReturns(prev => {
            const updated = prev.filter(r => r.id !== data.data.id);
            return [data.data, ...updated];
          });
          setSnackbar({ open: true, message: 'New return received!', severity: 'info' });
        }
        if (data.type === 'return_delete') {
          setReturns(prev => prev.filter(r => r.id !== data.data.id));
          setAllReturns(prev => prev.filter(r => r.id !== data.data.id));
        }
      } catch (e) {}
    };
    return () => ws.close();
  }, []);

  const handleDelete = (id) => {
    setReturns(returns.filter(r => r.id !== id));
    setAllReturns(allReturns.filter(r => r.id !== id));
    setSnackbar({ open: true, message: 'Return deleted.', severity: 'success' });
    // Optionally, call API to delete from backend
    // api.delete(`/returns/${id}`)
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 120 },
    {
      field: 'date',
      headerName: 'Date',
      width: 220,
      valueFormatter: (params) => dayjs(params.value).format('MMM D, YYYY, HH:mm'),
    },
    { field: 'customer', headerName: 'Customer Name', width: 220 },
    {
      field: 'status',
      headerName: 'Status',
      width: 160,
      renderCell: (params) => {
        let color = 'default';
        if (params.value === 'pending') color = 'warning';
        else if (params.value === 'approved') color = 'success';
        else if (params.value === 'rejected') color = 'error';
        else if (params.value === 'completed') color = 'info';
        return (
          <Tooltip title={params.value ? params.value.charAt(0).toUpperCase() + params.value.slice(1) : ''}>
            <Chip
              label={params.value ? params.value.charAt(0).toUpperCase() + params.value.slice(1) : ''}
              color={color}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Tooltip>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Action',
      width: 120,
      renderCell: (params) => (
        <IconButton aria-label="delete" size="small" color="error" onClick={() => handleDelete(params.row.id)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  return (
    <Box maxWidth={1200} mx="auto" p={3}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3} gap={1}>
        <AssignmentReturnIcon fontSize="large" color="primary" />
        <Typography variant="h4" fontWeight={700}>Returns Dashboard</Typography>
      </Box>
      {/* Filters and Actions */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Search by Return ID or Customer"
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
          <MenuItem value=""><span style={{ color: '#888' }}>All Status</span></MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="approved">Approved</MenuItem>
          <MenuItem value="rejected">Rejected</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
        </Select>
      </Box>
      {/* Export Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <Button
          variant="outlined"
          startIcon={<FileDownloadIcon />}
          onClick={() => {
            // Export to CSV
            const csvRows = [
              ['ID', 'Date', 'Customer Name', 'Status'],
              ...returns.map(r => [
                r.id,
                dayjs(r.date).format('MMM D, YYYY, HH:mm'),
                r.customer,
                r.status
              ])
            ];
            const csvString = csvRows.map(row => row.join(',')).join('\n');
            const blob = new Blob([csvString], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.setAttribute('hidden', '');
            a.setAttribute('href', url);
            a.setAttribute('download', 'returns.csv');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }}
        >
          Export CSV
        </Button>
      </Box>
      {/* DataGrid Table */}
      <Paper sx={{ height: 500, width: '100%', bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2, overflowX: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ p: 4 }}>{error}</Typography>
        ) : (
          <DataGrid
            rows={returns.map(r => ({ ...r, id: r.id }))}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
            autoHeight
            getRowHeight={() => 56}
            sx={{
              width: '100%',
              minWidth: 900,
              overflowX: 'auto', // Enable horizontal scroll
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
            columnBuffer={8}
            columnThreshold={8}
          />
        )}
      </Paper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}

export default Returns; 