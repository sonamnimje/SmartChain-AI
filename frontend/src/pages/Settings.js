import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import api from '../api';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function Settings() {
  const [tab, setTab] = useState(0);
  const [profile, setProfile] = useState({ id: '', name: '', email: '', role: '', is_active: true });
  const [company, setCompany] = useState({ company_name: '', address: '', notifications_enabled: true });
  const [security, setSecurity] = useState({ password: '', confirm: '' });
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/settings/profile'),
      api.get('/settings/system'),
      api.get('/settings/integrations'),
    ])
      .then(([profileRes, systemRes, integrationRes]) => {
        setProfile(profileRes.data);
        setCompany(systemRes.data);
        setApiKey(integrationRes.data.openai_api_key || '');
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load settings');
        setLoading(false);
      });
  }, []);

  // User profile update
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSuccess('');
    try {
      await api.put('/settings/profile', profile);
      setSuccess('Profile updated!');
    } catch {
      setError('Failed to update profile');
    }
  };

  // System config update
  const handleCompanySave = async (e) => {
    e.preventDefault();
    setSuccess('');
    try {
      await api.put('/settings/system', company);
      setSuccess('System settings updated!');
    } catch {
      setError('Failed to update system settings');
    }
  };

  // Security: change password
  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setSuccess('');
    if (security.password !== security.confirm) {
      setError('Passwords do not match');
      return;
    }
    try {
      await api.post('/settings/change-password', security.password, { headers: { 'Content-Type': 'application/json' } });
      setSuccess('Password changed!');
      setSecurity({ password: '', confirm: '' });
    } catch {
      setError('Failed to change password');
    }
  };

  // Integrations update
  const handleApiKeySave = async (e) => {
    e.preventDefault();
    setSuccess('');
    try {
      await api.put('/settings/integrations', { openai_api_key: apiKey });
      setSuccess('API key saved!');
    } catch {
      setError('Failed to save API key');
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Settings</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Paper sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab label="User" />
          <Tab label="System" />
          <Tab label="Security" />
          <Tab label="Integrations" />
        </Tabs>
      </Paper>
      <TabPanel value={tab} index={0}>
        <Typography variant="h6" gutterBottom>User Settings</Typography>
        <Box component="form" sx={{ maxWidth: 400 }} onSubmit={handleProfileSave}>
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            value={profile.email}
            onChange={e => setProfile({ ...profile, email: e.target.value })}
          />
          <TextField
            label="Role"
            fullWidth
            margin="normal"
            value={profile.role}
            onChange={e => setProfile({ ...profile, role: e.target.value })}
          />
          <FormControlLabel
            control={<Switch checked={profile.is_active} onChange={e => setProfile({ ...profile, is_active: e.target.checked })} />}
            label="Active"
            sx={{ mt: 2 }}
          />
          <Button variant="contained" sx={{ mt: 2 }} type="submit">Update Profile</Button>
        </Box>
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <Typography variant="h6" gutterBottom>System Configuration</Typography>
        <Box component="form" sx={{ maxWidth: 400 }} onSubmit={handleCompanySave}>
          <TextField
            label="Company Name"
            fullWidth
            margin="normal"
            value={company.company_name}
            onChange={e => setCompany({ ...company, company_name: e.target.value })}
          />
          <TextField
            label="Address"
            fullWidth
            margin="normal"
            value={company.address}
            onChange={e => setCompany({ ...company, address: e.target.value })}
          />
          <FormControlLabel
            control={<Switch checked={company.notifications_enabled} onChange={e => setCompany({ ...company, notifications_enabled: e.target.checked })} />}
            label="Enable Notifications"
            sx={{ mt: 2 }}
          />
          <Button variant="contained" sx={{ mt: 2 }} type="submit">Save System Settings</Button>
        </Box>
      </TabPanel>
      <TabPanel value={tab} index={2}>
        <Typography variant="h6" gutterBottom>Security Settings</Typography>
        <Box component="form" sx={{ maxWidth: 400 }} onSubmit={handlePasswordSave}>
          <TextField
            label="New Password"
            type="password"
            fullWidth
            margin="normal"
            value={security.password}
            onChange={e => setSecurity({ ...security, password: e.target.value })}
          />
          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            margin="normal"
            value={security.confirm}
            onChange={e => setSecurity({ ...security, confirm: e.target.value })}
          />
          <Button variant="contained" sx={{ mt: 2 }} type="submit">Change Password</Button>
        </Box>
      </TabPanel>
      <TabPanel value={tab} index={3}>
        <Typography variant="h6" gutterBottom>Integrations</Typography>
        <Box component="form" sx={{ maxWidth: 400 }} onSubmit={handleApiKeySave}>
          <TextField
            label="OpenAI API Key"
            fullWidth
            margin="normal"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            helperText="Store your OpenAI API key for AI features."
          />
          <Button variant="contained" sx={{ mt: 2 }} type="submit">Save API Key</Button>
        </Box>
      </TabPanel>
    </Box>
  );
}

export default Settings; 