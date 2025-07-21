import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  Card,
  CardContent,
  Divider,
  InputAdornment
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { updateProfile, fetchProfile } from '../api';
import { useEffect } from 'react';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const fileInputRef = useRef();

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetchProfile();
        setProfile(res.data);
        setEditForm(res.data);
      } catch (err) {
        setProfile(null);
      }
    }
    loadProfile();
  }, []);

  const handleEdit = () => {
    setEditForm(profile);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm(profile);
  };

  const handleSave = async () => {
    try {
      const { name, phone, avatar, location, username } = editForm;
      const res = await updateProfile({ name, phone, avatar, location, username });
      setProfile(res.data);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile.');
    }
  };

  const handleChange = (field) => (e) => {
    setEditForm({ ...editForm, [field]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm({ ...editForm, avatar: reader.result });
        setProfile({ ...profile, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!profile) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading profile...</div>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
      <Card sx={{ width: 370, borderRadius: 4, boxShadow: 6, p: 0 }}>
        <CardContent sx={{ p: 0 }}>
          {/* Back button could go here if needed */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 4, pb: 2 }}>
            <Box sx={{ position: 'relative', mb: 2 }}>
              <Avatar
                src={profile?.avatar}
                sx={{ width: 100, height: 100, border: '3px solid #fff', boxShadow: 2 }}
              />
              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: '#fff',
                  border: '1px solidrgb(245, 237, 237)',
                  boxShadow: 1,
                  p: 0.5,
                }}
                component="label"
              >
                <CameraAltIcon fontSize="small" />
                <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleAvatarChange} />
              </IconButton>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>{profile?.name}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              @{profile?.username}
            </Typography>
            {!isEditing && (
              <Button
                variant="contained"
                sx={{ bgcolor: '#1a237e', borderRadius: 2, px: 4, mb: 2, textTransform: 'none', fontWeight: 500 }}
                onClick={handleEdit}
                startIcon={<EditIcon />}
                fullWidth
              >
                Edit
              </Button>
            )}
          </Box>
          <Divider />
          <Box sx={{ p: 3 }}>
            <form autoComplete="off" onSubmit={e => { e.preventDefault(); handleSave(); }}>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ flex: 1, color: 'text.secondary' }}>Name</Typography>
                {isEditing ? (
                  <TextField
                    variant="standard"
                    value={editForm.name}
                    onChange={handleChange('name')}
                    InputProps={{ disableUnderline: false, sx: { textAlign: 'right' } }}
                    sx={{ ml: 2, flex: 2, textAlign: 'right' }}
                  />
                ) : (
                  <Typography sx={{ flex: 2, textAlign: 'right' }}>{profile?.name}</Typography>
                )}
              </Box>
              <Divider />
              <Box sx={{ mb: 2, mt: 2, display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ flex: 1, color: 'text.secondary' }}>Username</Typography>
                {isEditing ? (
                  <TextField
                    variant="standard"
                    value={editForm.username}
                    onChange={handleChange('username')}
                    InputProps={{ disableUnderline: false, sx: { textAlign: 'right' } }}
                    sx={{ ml: 2, flex: 2, textAlign: 'right' }}
                  />
                ) : (
                  <Typography sx={{ flex: 2, textAlign: 'right' }}>@{profile?.username}</Typography>
                )}
              </Box>
              <Divider />
              <Box sx={{ mb: 2, mt: 2, display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ flex: 1, color: 'text.secondary' }}>Phone number</Typography>
                {isEditing ? (
                  <TextField
                    variant="standard"
                    value={editForm.phone}
                    onChange={handleChange('phone')}
                    InputProps={{ disableUnderline: false, sx: { textAlign: 'right' } }}
                    sx={{ ml: 2, flex: 2, textAlign: 'right' }}
                  />
                ) : (
                  <Typography sx={{ flex: 2, textAlign: 'right' }}>{profile?.phone || 'Add number'}</Typography>
                )}
              </Box>
              <Divider />
              <Box sx={{ mb: 2, mt: 2, display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ flex: 1, color: 'text.secondary' }}>Email</Typography>
                {isEditing ? (
                  <TextField
                    variant="standard"
                    value={editForm.email}
                    onChange={handleChange('email')}
                    InputProps={{ disableUnderline: false, sx: { textAlign: 'right' } }}
                    sx={{ ml: 2, flex: 2, textAlign: 'right' }}
                  />
                ) : (
                  <Typography sx={{ flex: 2, textAlign: 'right' }}>{profile?.email}</Typography>
                )}
              </Box>
              <Divider />
              <Box sx={{ mb: 2, mt: 2, display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ flex: 1, color: 'text.secondary' }}>Location</Typography>
                {isEditing ? (
                  <TextField
                    variant="standard"
                    value={editForm.location}
                    onChange={handleChange('location')}
                    InputProps={{ disableUnderline: false, sx: { textAlign: 'right' } }}
                    sx={{ ml: 2, flex: 2, textAlign: 'right' }}
                  />
                ) : (
                  <Typography sx={{ flex: 2, textAlign: 'right' }}>{profile?.location}</Typography>
                )}
              </Box>
              <Divider />
              {isEditing && (
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="contained"
                    sx={{ bgcolor: '#1a237e', borderRadius: 2, px: 4, textTransform: 'none', fontWeight: 500 }}
                    type="submit"
                  >
                    Save Change
                  </Button>
                  <Button
                    variant="text"
                    color="error"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </form>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Profile; 