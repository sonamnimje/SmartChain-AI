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
  Card,
  CardContent,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Upload as UploadIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Description as DescriptionIcon,
  CloudUpload as CloudUploadIcon,
  History as HistoryIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import api from '../api';
import axios from 'axios';

const VendorProof = () => {
  const [vendors, setVendors] = useState([]);
  const [orders, setOrders] = useState([]);
  const [proofs, setProofs] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [selectedOrder, setSelectedOrder] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [comments, setComments] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedProof, setSelectedProof] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('approved');
  const [reviewComments, setReviewComments] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    fetchVendors();
    fetchOrders();
    fetchProofs();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await api.get('/vendor/all');
      setVendors(response.data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchProofs = async () => {
    try {
      const response = await api.get('/vendor/proof/all');
      setProofs(response.data);
    } catch (error) {
      console.error('Error fetching proofs:', error);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setSnackbar({
          open: true,
          message: 'Invalid file type. Only PDF, JPG, JPEG, PNG allowed.',
          severity: 'error'
        });
        return;
      }
      setProofFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedVendor || !selectedOrder || !proofFile) {
      setSnackbar({
        open: true,
        message: 'Please select vendor, order and upload a file.',
        severity: 'error'
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', proofFile);
      formData.append('vendor_id', parseInt(selectedVendor, 10));
      formData.append('order_id', parseInt(selectedOrder, 10));
      if (comments) {
        formData.append('comments', comments);
      }

      // Debug: Log all FormData entries
      for (let pair of formData.entries()) {
        console.log(pair[0] + ':', pair[1]);
      }

      // DO NOT set Content-Type header manually; let the browser handle it
      await api.post('/vendor/proof/upload', formData);

      setSnackbar({
        open: true,
        message: 'Proof uploaded successfully!',
        severity: 'success'
      });

      setUploadDialogOpen(false);
      setSelectedVendor('');
      setSelectedOrder('');
      setProofFile(null);
      setComments('');
      fetchProofs();
    } catch (error) {
      // Print the full error response for debugging
      if (error.response) {
        console.error('Full error response:', error.response);
        console.error('Error data:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
      } else {
        console.error('Error', error);
      }
      let detail = error.response?.data?.detail;
      let message;
      if (Array.isArray(detail)) {
        message = detail.map(e => e.msg).join(', ');
      } else if (typeof detail === 'object' && detail !== null) {
        message = JSON.stringify(detail);
      } else {
        message = detail || 'Error uploading proof';
      }
      setSnackbar({
        open: true,
        message,
        severity: 'error'
      });
    }
  };

  const handleReview = async () => {
    if (!selectedProof) return;

    try {
      await api.put(`/vendor/proof/${selectedProof.id}/review`, {
        proof_status: reviewStatus,
        comments: reviewComments
      }, {
        params: { reviewed_by: 'Admin' }
      });

      setSnackbar({
        open: true,
        message: 'Proof reviewed successfully!',
        severity: 'success'
      });

      setReviewDialogOpen(false);
      setSelectedProof(null);
      setReviewStatus('approved');
      setReviewComments('');
      fetchProofs();
    } catch (error) {
      let detail = error.response?.data?.detail;
      let message;
      if (Array.isArray(detail)) {
        message = detail.map(e => e.msg).join(', ');
      } else if (typeof detail === 'object' && detail !== null) {
        message = JSON.stringify(detail);
      } else {
        message = detail || 'Error reviewing proof';
      }
      setSnackbar({
        open: true,
        message,
        severity: 'error'
      });
    }
  };

  const handlePreview = (proof) => {
    if (proof.proof_file) {
      setPreviewData(proof);
      setPreviewDialogOpen(true);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon color="success" />;
      case 'rejected':
        return <CancelIcon color="error" />;
      case 'pending':
        return <PendingIcon color="warning" />;
      default:
        return <PendingIcon />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 3 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Paper elevation={4} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3, mb: 4 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <DescriptionIcon color="primary" fontSize="large" />
          <Typography variant="h4" fontWeight={700}>
            Vendor Proof Management
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" mb={3}>
          Upload and manage vendor proof documents for order fulfillment verification.
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <CloudUploadIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Upload Proof
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Upload delivery proof documents
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<UploadIcon />}
                  onClick={() => setUploadDialogOpen(true)}
                  fullWidth
                >
                  Upload New Proof
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Total Proofs
                </Typography>
                <Typography variant="h4" color="primary" fontWeight={700}>
                  {proofs.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Documents uploaded
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Pending Reviews
                </Typography>
                <Typography variant="h4" color="warning.main" fontWeight={700}>
                  {proofs.filter(p => p.proof_status === 'pending').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Awaiting approval
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Proofs Table */}
      <Paper elevation={4} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3, background: '#f7f9fc', boxShadow: '0 2px 8px rgba(44, 62, 80, 0.06)' }}>
        <Typography variant="h5" fontWeight={600} mb={3}>
          Vendor Proofs
        </Typography>
        
        <Table sx={{ background: '#f5f7fa', borderRadius: 2, overflow: 'hidden' }}>
          <TableHead sx={{ background: '#f0f4fa' }}>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Vendor</TableCell>
              <TableCell>Order</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Uploaded</TableCell>
              <TableCell>Reviewed</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {proofs.map((proof) => {
              const vendor = vendors.find(v => v.id === proof.vendor_id);
              const order = orders.find(o => o.id === proof.order_id);
              
              return (
                <TableRow key={proof.id}>
                  <TableCell>{proof.id}</TableCell>
                  <TableCell>{vendor?.name || 'Unknown'}</TableCell>
                  <TableCell>{order?.product || `Order #${proof.order_id}`}</TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(proof.proof_status)}
                      label={proof.proof_status}
                      color={getStatusColor(proof.proof_status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(proof.uploaded_at)}</TableCell>
                  <TableCell>
                    {proof.reviewed_at ? formatDate(proof.reviewed_at) : '-'}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="Preview Proof">
                        <IconButton
                          size="small"
                          onClick={() => handlePreview(proof)}
                          disabled={!proof.proof_file}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      {proof.proof_status === 'pending' && (
                        <Tooltip title="Review Proof">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedProof(proof);
                              setReviewDialogOpen(true);
                            }}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Vendor Proof</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Vendor</InputLabel>
              <Select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                label="Select Vendor"
              >
                {vendors.map((vendor) => (
                  <MenuItem key={vendor.id} value={vendor.id}>
                    {vendor.name} - {vendor.company}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Order</InputLabel>
              <Select
                value={selectedOrder}
                onChange={(e) => setSelectedOrder(e.target.value)}
                label="Select Order"
              >
                {orders.map((order) => (
                  <MenuItem key={order.id} value={order.id}>
                    {order.product} - {order.customer_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Comments (Optional)"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<UploadIcon />}
              sx={{ mb: 2 }}
            >
              Choose File
              <input
                type="file"
                hidden
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />
            </Button>
            
            {proofFile && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Selected: {proofFile.name}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpload} variant="contained" disabled={!selectedVendor || !selectedOrder || !proofFile}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Review Vendor Proof</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {selectedProof && (
              <List>
                <ListItem>
                  <ListItemText
                    primary="Proof Details"
                    secondary={`Vendor: ${vendors.find(v => v.id === selectedProof.vendor_id)?.name || 'Unknown'}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    secondary={`Order: ${orders.find(o => o.id === selectedProof.order_id)?.product || `Order #${selectedProof.order_id}`}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    secondary={`Uploaded: ${formatDate(selectedProof.uploaded_at)}`}
                  />
                </ListItem>
                {selectedProof.comments && (
                  <ListItem>
                    <ListItemText
                      secondary={`Comments: ${selectedProof.comments}`}
                    />
                  </ListItem>
                )}
              </List>
            )}
            
            <Divider sx={{ my: 2 }} />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Review Status</InputLabel>
              <Select
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value)}
                label="Review Status"
              >
                <MenuItem value="approved">Approve</MenuItem>
                <MenuItem value="rejected">Reject</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Review Comments"
              value={reviewComments}
              onChange={(e) => setReviewComments(e.target.value)}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleReview} variant="contained">
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onClose={() => setPreviewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Proof Preview</DialogTitle>
        <DialogContent>
          {previewData && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Proof Details
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Vendor"
                    secondary={vendors.find(v => v.id === previewData.vendor_id)?.name || 'Unknown'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Order"
                    secondary={orders.find(o => o.id === previewData.order_id)?.product || `Order #${previewData.order_id}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Status"
                    secondary={
                      <Chip
                        icon={getStatusIcon(previewData.proof_status)}
                        label={previewData.proof_status}
                        color={getStatusColor(previewData.proof_status)}
                        size="small"
                      />
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Uploaded"
                    secondary={formatDate(previewData.uploaded_at)}
                  />
                </ListItem>
                {previewData.comments && (
                  <ListItem>
                    <ListItemText
                      primary="Comments"
                      secondary={previewData.comments}
                    />
                  </ListItem>
                )}
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Document Preview
              </Typography>
              <Box sx={{ 
                border: '1px solid #ddd', 
                borderRadius: 1, 
                p: 2, 
                textAlign: 'center',
                minHeight: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography color="text.secondary">
                  File uploaded successfully. Preview functionality can be enhanced to show actual file content.
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VendorProof;