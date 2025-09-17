import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useSnackbar } from 'notistack';
import CircularProgress from '@mui/material/CircularProgress';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Link from '@mui/material/Link';
import api, { setAuthToken } from '../api';
import { Container } from '@mui/material';
import Avatar from '@mui/material/Avatar';

function Login() {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const formik = useFormik({
    initialValues: {
      identifier: '',
      password: '',
    },
    validationSchema: Yup.object({
      identifier: Yup.string().required('Required'),
      password: Yup.string().required('Required'),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const formData = new URLSearchParams();
        formData.append('username', values.identifier);
        formData.append('password', values.password);
        const res = await api.post('/auth/login', formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        if (res.data && res.data.access_token) {
          setAuthToken(res.data.access_token);
          enqueueSnackbar('Login successful!', { variant: 'success' });
          navigate('/dashboard');
        } else {
          enqueueSnackbar('Login failed. No token received.', { variant: 'error' });
        }
      } catch (err) {
        enqueueSnackbar(
          err?.response?.data?.detail || 'Login failed. Please check your credentials.',
          { variant: 'error' }
        );
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: '#181818',
      backgroundImage: 'url("/BG.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}>
      <Container maxWidth="xs" sx={{ textAlign: 'center', p: 4, borderRadius: 3, boxShadow: 3, bgcolor: 'rgba(24,24,24,0.7)', border: '2px solid #fff', color: '#fff' }}>
        <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: 'primary.main' }} />
        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            id="identifier"
            name="identifier"
            label="Username or Email"
            value={formik.values.identifier}
            onChange={formik.handleChange}
            error={formik.touched.identifier && Boolean(formik.errors.identifier)}
            helperText={formik.touched.identifier && formik.errors.identifier ? <span style={{ fontWeight: 700 }}>{formik.errors.identifier}</span> : null}
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
          <TextField
            fullWidth
            margin="normal"
            id="password"
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            autoComplete="current-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword((show) => !show)}
                    edge="end"
                    sx={{ color: '#fff' }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              style: { color: '#fff', background: 'transparent' },
            }}
            InputLabelProps={{ style: { color: 'rgba(255,255,255,0.7)' } }}
            sx={{
              input: { color: '#fff', background: 'transparent' },
              label: { color: 'rgba(255,255,255,0.7)' },
              background: 'transparent',
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
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Link component={RouterLink} to="/forgot-password" variant="body2" sx={{ color: '#5BC0EB', fontWeight: 700 }}>
            Forgot password?
          </Link>
          <Link component={RouterLink} to="/signup" variant="body2" sx={{ color: '#5BC0EB', fontWeight: 700 }}>
            Sign up
          </Link>
        </Box>
      </Container>
    </Box>
  );
}

export default Login; 