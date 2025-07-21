import React from 'react';
import { List, ListItem, ListItemText, Typography } from '@mui/material';
import ReportCard from './ReportCard';

const events = [
  { date: '14.JA', desc: 'AI-detected anomaly transaction' },
  { date: '12.JU', desc: 'Unauthorized access attempt' },
  { date: '11.JU', desc: 'High-value transaction processed' },
  { date: '14.14', desc: 'Contract SC-0049 flagged' },
];

const NotableEventsList = () => (
  <ReportCard title="Notable Events">
    <List dense>
      {events.map((event, idx) => (
        <ListItem key={idx} disablePadding>
          <ListItemText
            primary={<Typography variant="body2"><b>{event.date}</b> {event.desc}</Typography>}
          />
        </ListItem>
      ))}
    </List>
  </ReportCard>
);

export default NotableEventsList; 