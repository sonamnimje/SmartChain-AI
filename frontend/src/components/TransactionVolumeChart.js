import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ReportCard from './ReportCard';

const data = [
  { month: 'Jan', volume: 120 },
  { month: 'Feb', volume: 210 },
  { month: 'Mar', volume: 320 },
  { month: 'Apr', volume: 450 },
  { month: 'Mai', volume: 300 },
  { month: 'Jun', volume: 520 },
  { month: 'Jul', volume: 780 },
];

const TransactionVolumeChart = () => (
  <ReportCard title="Transaction Volume">
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="volume" fill="#4fc3f7" name="Volume" />
      </BarChart>
    </ResponsiveContainer>
  </ReportCard>
);

export default TransactionVolumeChart; 