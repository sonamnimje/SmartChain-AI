import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ReportCard from './ReportCard';

const data = [
  { day: 2, anomalies: 12 },
  { day: 4, anomalies: 15 },
  { day: 6, anomalies: 18 },
  { day: 8, anomalies: 22 },
  { day: 10, anomalies: 19 },
  { day: 12, anomalies: 25 },
  { day: 14, anomalies: 20 },
  { day: 16, anomalies: 28 },
];

const AIDetectedAnomaliesChart = () => (
  <ReportCard title="AI-Detected Anomalies">
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="anomalies" stroke="#1976d2" strokeWidth={2} dot />
      </LineChart>
    </ResponsiveContainer>
  </ReportCard>
);

export default AIDetectedAnomaliesChart; 