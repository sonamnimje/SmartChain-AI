import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useSnackbar } from 'notistack';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@mui/material/Link';
import api from '../api';
import { Container } from '@mui/material';

function ForgotPassword() {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email').required('Required'),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await api.post('/auth/forgot-password', { email: values.email });
        enqueueSnackbar('Password reset link generated successfully!', { variant: 'success' });
        
        // Extract the reset URL from the response
        const message = response.data.message;
        const resetUrlMatch = message.match(/\/reset-password\?token=[^"]+/);
        if (resetUrlMatch) {
          const resetUrl = `${window.location.origin}${resetUrlMatch[0]}`;
          
          // Automatically open the reset link in a new tab
          window.open(resetUrl, '_blank');
          enqueueSnackbar('Reset link opened in new tab!', { variant: 'info' });
          
          // Also copy to clipboard as backup
          try {
            await navigator.clipboard.writeText(resetUrl);
            enqueueSnackbar('Reset link also copied to clipboard!', { variant: 'info' });
          } catch (clipboardError) {
            console.log('Clipboard copy failed:', clipboardError);
          }
        }
        
        formik.resetForm();
      } catch (err) {
        enqueueSnackbar(
          err?.response?.data?.detail || 'Request failed. Please try again.',
          { variant: 'error' }
        );
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#181818', backgroundImage: 'url("/BG.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      <Container maxWidth="xs" sx={{ textAlign: 'center', p: 4, borderRadius: 3, boxShadow: 3, bgcolor: 'rgba(24,24,24,0.7)', border: '2px solid #fff', color: '#fff' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
          Forgot Password
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: 'rgba(255,255,255,0.8)' }}>
          Enter your email address below. A password reset link will be generated and opened automatically in a new tab.
        </Typography>
        <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              id="email"
              name="email"
              label="Email"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email ? <span style={{ fontWeight: 700 }}>{formik.errors.email}</span> : null}
              autoComplete="username"
              InputProps={{
                style: { color: '#fff', background: 'transparent', fontWeight: 700, boxShadow: 'none' },
                disableUnderline: true,
              }}
              InputLabelProps={{ style: { color: 'rgba(255,255,255,0.85)', fontWeight: 700 } }}
              sx={{
                input: { color: '#fff', background: 'transparent', fontWeight: 700, boxShadow: 'none' },
                label: { color: 'rgba(255,255,255,0.85)', fontWeight: 700 },
                background: 'transparent',
                fontWeight: 700,
                boxShadow: 'none',
              }}
            />
            <Button
              color="primary"
              variant="contained"
              fullWidth
              type="submit"
              sx={{ mt: 2, fontWeight: 700 }}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Link component={RouterLink} to="/login" variant="body2" sx={{ color: '#5BC0EB', fontWeight: 700 }}>
              Back to Login
            </Link>
          </Box>
        </Container>
    </Box>
  );
}

export default ForgotPassword; 