import React, { useEffect, useState } from 'react';
import api from '../api';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import PersonIcon from '@mui/icons-material/Person';

const AssignedStaff = ({ warehouseId }) => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!warehouseId) return;
    setLoading(true);
    api.get(`/warehouses/${warehouseId}/staff`)
      .then(res => {
        setStaff(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch staff');
        setLoading(false);
      });
  }, [warehouseId]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!staff || staff.length === 0) return <Typography color="textSecondary">No staff assigned.</Typography>;

  return (
    <List>
      {staff.map(s => (
        <ListItem key={s.id} alignItems="flex-start">
          <ListItemAvatar>
            <Avatar><PersonIcon /></Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={`${s.name} (${s.role})`}
            secondary={
              <>
                {s.shift_time && <span>Shift: {s.shift_time}<br /></span>}
                {s.contact_info && <span>Contact: {s.contact_info}</span>}
              </>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

export default AssignedStaff; 