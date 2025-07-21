import React from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { Link } from 'react-router-dom';

// Placeholder for authentication state
const isAuthenticated = false; // Change to true to simulate logged-in state

function DashboardAuthButtons() {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      {isAuthenticated ? (
        <>
          <Button variant="outlined" component={Link} to="/profile">Profile</Button>
          <Button variant="contained" color="secondary">Logout</Button>
        </>
      ) : (
        <Button variant="contained" color="primary" component={Link} to="/login">Login</Button>
      )}
    </Box>
  );
}
export default DashboardAuthButtons; 