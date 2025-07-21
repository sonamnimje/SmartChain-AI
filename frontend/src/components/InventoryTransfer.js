import React, { useEffect, useState } from 'react';
import api from '../api';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

const InventoryTransfer = ({ onClose, onSuccess }) => {
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [form, setForm] = useState({ source: '', dest: '', product: '', quantity: 1 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/warehouses'),
      api.get('/products'),
      api.get('/warehouses/ai-suggestions'),
    ]).then(([wRes, pRes, aiRes]) => {
      setWarehouses(wRes.data);
      setProducts(pRes.data);
      setAiSuggestions(aiRes.data.suggestions || []);
      setLoading(false);
    }).catch(() => {
      setError('Failed to load data');
      setLoading(false);
    });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/warehouses/transfer', {
        source_warehouse_id: form.source,
        dest_warehouse_id: form.dest,
        product_id: form.product,
        quantity: Number(form.quantity),
      });
      setSuccess(true);
      if (onSuccess) onSuccess();
      setForm({ source: '', dest: '', product: '', quantity: 1 });
    } catch {
      setError('Transfer failed');
    }
    setSubmitting(false);
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ minWidth: 320 }}>
      <Typography variant="h6" gutterBottom>AI Suggestions</Typography>
      {aiSuggestions.length === 0 ? <Typography color="textSecondary">No suggestions</Typography> : (
        <ul>
          {aiSuggestions.map((s, i) => <li key={i}>{s.message}</li>)}
        </ul>
      )}
      <Typography variant="h6" sx={{ mt: 2 }}>Transfer Inventory</Typography>
      <TextField
        select
        label="Source Warehouse"
        name="source"
        value={form.source}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      >
        {warehouses.map(w => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
      </TextField>
      <TextField
        select
        label="Destination Warehouse"
        name="dest"
        value={form.dest}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      >
        {warehouses.map(w => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
      </TextField>
      <TextField
        select
        label="Product"
        name="product"
        value={form.product}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      >
        {products.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
      </TextField>
      <TextField
        label="Quantity"
        name="quantity"
        type="number"
        value={form.quantity}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
        inputProps={{ min: 1 }}
      />
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button type="submit" variant="contained" color="primary" disabled={submitting}>{submitting ? 'Transferring...' : 'Transfer'}</Button>
      </Box>
      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)} message="Transfer successful!" />
    </Box>
  );
};

export default InventoryTransfer; 