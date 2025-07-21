import React from 'react';
import Card from '@mui/material/Card';
import { Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components at the top level
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function DashboardBarChart({ metrics }) {
  const chartData = {
    labels: ['Inventory', 'Orders', 'Shipments'],
    datasets: [
      {
        label: 'Count',
        data: [metrics.total_inventory, metrics.total_orders, metrics.total_shipments],
        backgroundColor: ['#2563eb', '#10b981', '#f87171'],
      },
    ],
  };
  // Use a key to force remount if data changes
  const chartKey = `${metrics.total_inventory}-${metrics.total_orders}-${metrics.total_shipments}`;
  return (
    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <Card elevation={3} sx={{ maxWidth: 700, mx: 'auto', p: 2 }}>
        <Bar data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} key={chartKey} />
      </Card>
    </motion.div>
  );
}
export default DashboardBarChart; 