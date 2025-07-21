import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import api from '../api';

const roles = ['admin', 'staff', 'supplier', 'driver', 'user'];

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'user' });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditUser(null);
    setForm({ name: '', email: '', role: 'user' });
    setActionError(null);
    setOpenDialog(true);
  };

  const handleOpenEdit = (user) => {
    setEditUser(user);
    setForm({ name: user.name, email: user.email, role: user.role });
    setActionError(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditUser(null);
    setActionError(null);
  };

  const handleSave = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      if (editUser) {
        // Edit user
        await api.put(`/auth/users/${editUser.id}`, form);
      } else {
        // Add user
        await api.post('/auth/users', form);
      }
      setOpenDialog(false);
      fetchUsers();
    } catch (err) {
      setActionError('Failed to save user.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user ${user.name}?`)) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await api.delete(`/auth/users/${user.id}`);
      fetchUsers();
    } catch (err) {
      setActionError('Failed to delete user.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={700} mb={3}>User Management</Typography>
      <Button variant="contained" startIcon={<AddIcon />} sx={{ mb: 2 }} onClick={handleOpenAdd} disabled={actionLoading}>Add User</Button>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4}><CircularProgress size={24} /></TableCell></TableRow>
              ) : error ? (
                <TableRow><TableCell colSpan={4}>{error}</TableCell></TableRow>
              ) : users.length === 0 ? (
                <TableRow><TableCell colSpan={4}>No users found.</TableCell></TableRow>
              ) : users.map(user => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenEdit(user)} disabled={actionLoading}><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDelete(user)} color="error" disabled={actionLoading}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>{editUser ? 'Edit User' : 'Add User'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            fullWidth
            margin="normal"
            disabled={actionLoading}
          />
          <TextField
            label="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            fullWidth
            margin="normal"
            disabled={actionLoading}
          />
          <Select
            label="Role"
            value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value })}
            fullWidth
            margin="normal"
            sx={{ mt: 2 }}
            disabled={actionLoading}
          >
            {roles.map(role => <MenuItem key={role} value={role}>{role}</MenuItem>)}
          </Select>
          {actionError && <Typography color="error" mt={2}>{actionError}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={actionLoading}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={actionLoading}>{actionLoading ? <CircularProgress size={20} /> : 'Save'}</Button>
        </DialogActions>
      </Dialog>
      {actionError && (
        <Typography color="error" mt={2}>{actionError}</Typography>
      )}
    </Box>
  );
}

export default UserManagement; 