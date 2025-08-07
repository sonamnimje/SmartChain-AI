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
import LinearProgress from '@mui/material/LinearProgress';
import { Container } from '@mui/material';
import Avatar from '@mui/material/Avatar';

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

function Signup() {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      confirm: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email').required('Required'),
      password: Yup.string().min(6, 'At least 6 characters').required('Required'),
      confirm: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match').required('Required'),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const res = await api.post('/auth/signup', { 
          email: values.email, 
          password: values.password,
          username: values.username || values.email.split('@')[0], // Use email prefix as username if not provided
          name: values.username || values.email.split('@')[0] // Use username as name
        });
        if (res.data && res.data.access_token) {
          setAuthToken(res.data.access_token);
          enqueueSnackbar('Signup successful! You are now logged in.', { variant: 'success' });
          navigate('/dashboard');
        } else {
          enqueueSnackbar('Signup successful! Please log in.', { variant: 'success' });
          navigate('/login');
        }
      } catch (err) {
        enqueueSnackbar(
          err?.response?.data?.detail || 'Signup failed. Please try again.',
          { variant: 'error' }
        );
      } finally {
        setLoading(false);
      }
    },
  });

  const strength = getPasswordStrength(password);
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['error', 'warning', 'info', 'success'];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#181818', backgroundImage: 'url("/BG.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      <Container maxWidth="xs" sx={{ textAlign: 'center', p: 4, borderRadius: 3, boxShadow: 3, bgcolor: 'rgba(24,24,24,0.7)', border: '2px solid #fff', color: '#fff' }}>
        <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: 'primary.main' }} />
        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            id="username"
            name="username"
            label="Username"
            value={formik.values.username}
            onChange={formik.handleChange}
            error={formik.touched.username && Boolean(formik.errors.username)}
            helperText={formik.touched.username && formik.errors.username ? <span style={{ fontWeight: 700 }}>{formik.errors.username}</span> : null}
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
            id="email"
            name="email"
            label="Email"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            autoComplete="email"
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
            autoComplete="new-password"
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
          <Box sx={{ mb: 1 }}>
            <LinearProgress
              variant="determinate"
              value={Math.max((strength / 3) * 100, 10)}
              color={strengthColors[strength - 1] || 'error'}
              sx={{ height: 8, borderRadius: 2, mb: 0.5 }}
            />
            <Typography variant="caption" color={strengthColors[strength - 1] || 'error'}>
              {strengthLabels[strength - 1] || 'Weak'}
            </Typography>
          </Box>
          <TextField
            fullWidth
            margin="normal"
            id="confirm"
            name="confirm"
            label="Confirm Password"
            type={showConfirm ? 'text' : 'password'}
            value={formik.values.confirm}
            onChange={formik.handleChange}
            error={formik.touched.confirm && Boolean(formik.errors.confirm)}
            helperText={formik.touched.confirm && formik.errors.confirm}
            autoComplete="new-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle confirm password visibility"
                    onClick={() => setShowConfirm((show) => !show)}
                    edge="end"
                    sx={{ color: '#fff' }}
                  >
                    {showConfirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
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
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </form>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Link component={RouterLink} to="/login" variant="body2" sx={{ color: '#5BC0EB', fontWeight: 700 }}>
            Already have an account? Login
          </Link>
        </Box>
      </Container>
    </Box>
  );
}

export default Signup; 