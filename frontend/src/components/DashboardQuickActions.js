import React from 'react';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { Link } from 'react-router-dom';

function DashboardQuickActions({ profile }) {
  return (
    <SpeedDial
      ariaLabel="Quick Actions"
      sx={{
        position: 'fixed',
        bottom: { xs: 88, sm: 104, md: 120 },
        right: { xs: 16, sm: 24, md: 32 },
        zIndex: 1201
      }}
      icon={<SpeedDialIcon />}
    >
      <SpeedDialAction
        icon={<ShoppingCartIcon />}
        tooltipTitle="Create Order"
        component={Link}
        to="/orders/create"
      />
      <SpeedDialAction
        icon={<AddCircleIcon />}
        tooltipTitle="Add Inventory"
        component={Link}
        to="/inventory/add"
      />
      <SpeedDialAction
        icon={<CheckCircleIcon />}
        tooltipTitle="Mark Delivery Complete"
        component={Link}
        to="/deliveries"
      />
      <SpeedDialAction
        icon={<EditIcon />}
        tooltipTitle="Edit My Profile"
        component={Link}
        to="/settings"
      />
      <SpeedDialAction
        icon={<AdminPanelSettingsIcon />}
        tooltipTitle="User Management"
        component={Link}
        to="/users"
      />
    </SpeedDial>
  );
}
export default DashboardQuickActions; 