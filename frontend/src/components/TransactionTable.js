import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import ReportCard from './ReportCard';

const rows = [
  { date: 'Jul.14', id: 'SC44581C0C', product: 'Product A', amount: '360 ml', status: 'Completed' },
  { date: 'Jun, 23', id: 'SC00412C0C', product: 'Product B', amount: '200 ml', status: 'Complied' },
  { date: 'Jun, 23', id: 'SC40531533', product: 'Product C', amount: '120 ml', status: 'Completed' },
  { date: 'Jul.14', id: 'SC46048100', product: 'Product T', amount: 'Pending', status: 'Pending' },
];

const TransactionTable = () => (
  <ReportCard title="Transactions">
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Transaction ID</TableCell>
            <TableCell>Product</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, idx) => (
            <TableRow key={idx}>
              <TableCell>{row.date}</TableCell>
              <TableCell>{row.id}</TableCell>
              <TableCell>{row.product}</TableCell>
              <TableCell>{row.amount}</TableCell>
              <TableCell>{row.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </ReportCard>
);

export default TransactionTable; 