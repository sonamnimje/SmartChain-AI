import React from 'react';
import Grid from '@mui/material/Grid';
import { motion } from 'framer-motion';
import AISuggestions from './AISuggestions';

function DashboardAISuggestions() {
  return (
    <div className="se-card">
      <Grid container>
        <Grid item xs={12} md={4}>
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <AISuggestions />
          </motion.div>
        </Grid>
      </Grid>
    </div>
  );
}
export default DashboardAISuggestions; 