import React, { useState } from 'react';
import {
  Box,
  Button,
  Alert,
  Typography,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

const ProofUpload = ({ 
  onFileSelect, 
  selectedFile, 
  onFileRemove, 
  onPreview,
  label = "Upload Delivery Proof",
  accept = ".pdf,.jpg,.jpeg,.png",
  showPreview = true,
  showRemove = true
}) => {
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Only PDF, JPG, JPEG, PNG allowed.');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size too large. Maximum 10MB allowed.');
        return;
      }
      
      setError('');
      onFileSelect(file);
    }
  };

  const handleRemoveFile = () => {
    onFileRemove();
    setError('');
  };

  return (
    <Box>
      <Typography variant="body2" fontWeight="medium" gutterBottom>
        {label}
      </Typography>
      
      {selectedFile ? (
        <Box sx={{ 
          border: '1px solid #ddd', 
          borderRadius: 1, 
          p: 2, 
          mb: 2,
          backgroundColor: '#f9f9f9'
        }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <Chip 
                label={selectedFile.name} 
                color="primary" 
                variant="outlined"
                size="small"
              />
              <Typography variant="caption" color="text.secondary">
                ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </Typography>
            </Box>
            
            <Box display="flex" gap={1}>
              {showPreview && (
                <Tooltip title="Preview File">
                  <IconButton size="small" onClick={() => onPreview(selectedFile)}>
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              
              {showRemove && (
                <Tooltip title="Remove File">
                  <IconButton size="small" onClick={handleRemoveFile} color="error">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        </Box>
      ) : (
        <Button
          variant="outlined"
          component="label"
          startIcon={<UploadIcon />}
          fullWidth
          sx={{ mb: 2 }}
        >
          Choose File
          <input
            type="file"
            hidden
            accept={accept}
            onChange={handleFileChange}
          />
        </Button>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Typography variant="caption" color="text.secondary">
        Accepted formats: PDF, JPG, JPEG, PNG (max 10MB)
      </Typography>
    </Box>
  );
};

export default ProofUpload; 