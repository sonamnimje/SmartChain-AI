import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import InventoryIcon from '@mui/icons-material/Inventory';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const QuickActions = ({ onAdd, onEdit, onTransfer, onAddStock, onExport }) => (
  <Card sx={{ mb: 3 }}>
    <CardContent>
      <List>
        <ListItem button onClick={onAdd}>
          <ListItemIcon><AddIcon color="primary" /></ListItemIcon>
          <ListItemText primary="Add New Warehouse" />
        </ListItem>
        <ListItem button onClick={onEdit}>
          <ListItemIcon><EditIcon color="info" /></ListItemIcon>
          <ListItemText primary="Edit Warehouse Info" />
        </ListItem>
        <ListItem button onClick={onTransfer}>
          <ListItemIcon><SwapHorizIcon color="secondary" /></ListItemIcon>
          <ListItemText primary="Initiate Transfer" />
        </ListItem>
        <ListItem button onClick={onAddStock}>
          <ListItemIcon><InventoryIcon color="success" /></ListItemIcon>
          <ListItemText primary="Add Stock to Warehouse" />
        </ListItem>
        <ListItem button onClick={onExport}>
          <ListItemIcon><FileDownloadIcon color="action" /></ListItemIcon>
          <ListItemText primary="Export Inventory Report" />
        </ListItem>
      </List>
    </CardContent>
  </Card>
);

export default QuickActions; 