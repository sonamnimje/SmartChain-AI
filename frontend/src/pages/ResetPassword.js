import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useSnackbar } from 'notistack';
import Link from '@mui/material/Link';
import api from '../api';
import { Container } from '@mui/material';

function ResetPassword() {
  const { enqueueSnackbar } = useSnackbar();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      enqueueSnackbar('Invalid reset link. Please request a new password reset.', { variant: 'error' });
      navigate('/forgot-password');
      return;
    }
    setToken(tokenFromUrl);
  }, [searchParams, enqueueSnackbar, navigate]);

  const formik = useFormik({
    initialValues: {
      new_password: '',
      confirm_password: '',
    },
    validationSchema: Yup.object({
      new_password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('Required'),
      confirm_password: Yup.string()
        .oneOf([Yup.ref('new_password'), null], 'Passwords must match')
        .required('Required'),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await api.post('/auth/reset-password', {
          token: token,
          new_password: values.new_password
        });
        enqueueSnackbar('Password reset successfully! You can now login with your new password.', { variant: 'success' });
        navigate('/login');
      } catch (err) {
        enqueueSnackbar(
          err?.response?.data?.detail || 'Password reset failed. Please try again.',
          { variant: 'error' }
        );
      } finally {
        setLoading(false);
      }
    },
  });

  if (!token) {
    return null; // Don't render form if no token
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#181818', backgroundImage: 'url("/BG.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      <Container maxWidth="xs" sx={{ textAlign: 'center', p: 4, borderRadius: 3, boxShadow: 3, bgcolor: 'rgba(24,24,24,0.7)', border: '2px solid #fff', color: '#fff' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
          Reset Password
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: 'rgba(255,255,255,0.8)' }}>
          Enter your new password below
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            id="new_password"
            name="new_password"
            label="New Password"
            type="password"
            value={formik.values.new_password}
            onChange={formik.handleChange}
            error={formik.touched.new_password && Boolean(formik.errors.new_password)}
            helperText={formik.touched.new_password && formik.errors.new_password ? <span style={{ fontWeight: 700 }}>{formik.errors.new_password}</span> : null}
            autoComplete="new-password"
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
          <TextField
            fullWidth
            margin="normal"
            id="confirm_password"
            name="confirm_password"
            label="Confirm New Password"
            type="password"
            value={formik.values.confirm_password}
            onChange={formik.handleChange}
            error={formik.touched.confirm_password && Boolean(formik.errors.confirm_password)}
            helperText={formik.touched.confirm_password && formik.errors.confirm_password ? <span style={{ fontWeight: 700 }}>{formik.errors.confirm_password}</span> : null}
            autoComplete="new-password"
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
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Link href="/login" variant="body2" sx={{ color: '#5BC0EB', fontWeight: 700 }}>
            Back to Login
          </Link>
        </Box>
      </Container>
    </Box>
  );
}

export default ResetPassword; 