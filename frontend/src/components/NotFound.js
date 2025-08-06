import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';

function NotFound() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5',
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            textAlign: 'center',
            p: 4,
            bgcolor: 'white',
            borderRadius: 3,
            boxShadow: 3,
          }}
        >
          <Typography variant="h1" sx={{ fontSize: '6rem', fontWeight: 'bold', color: '#1976d2', mb: 2 }}>
            404
          </Typography>
          <Typography variant="h4" sx={{ mb: 2, color: '#333' }}>
            Page Not Found
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: '#666' }}>
            The page you're looking for doesn't exist or has been moved.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            Go to Dashboard
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default NotFound; 