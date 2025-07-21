import React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemIcon, Box } from '@mui/material';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';

const suggestions = [
  'Reorder Milk 1L – high demand forecast',
  'Route 2 may face delay – reroute suggested',
  // Add more suggestions or fetch from backend
];

export default function AISuggestions({ items = suggestions }) {
  return (
    <Card sx={{ borderLeft: '6px solid #4caf50', mb: 2, bgcolor: '#f9fff6' }}>
      <CardContent>
        <Typography variant="h6" sx={{ color: '#388e3c', mb: 1, display: 'flex', alignItems: 'center' }}>
          <EmojiObjectsIcon sx={{ mr: 1, color: '#4caf50' }} />
          SmartChainAI Suggestions
        </Typography>
        <List>
          {items.map((tip, idx) => (
            <ListItem key={idx} sx={{ color: '#388e3c', pl: 0 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <EmojiObjectsIcon sx={{ color: '#4caf50' }} />
              </ListItemIcon>
              <Box component="span" sx={{ fontWeight: 500 }}>{tip}</Box>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
} 