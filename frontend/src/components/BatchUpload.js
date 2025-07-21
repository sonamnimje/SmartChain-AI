import React, { useRef, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

function BatchUpload() {
  const fileInput = useRef();
  const [open, setOpen] = useState(false);

  const handleUpload = (e) => {
    e.preventDefault();
    setOpen(true);
    if (fileInput.current) fileInput.current.value = '';
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h5" gutterBottom>Batch Upload</Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Upload a CSV file to batch update products.
          </Typography>
          <form onSubmit={handleUpload}>
            <input ref={fileInput} type="file" accept=".csv" style={{ margin: '16px 0' }} required />
            <Button type="submit" variant="contained" color="primary" fullWidth>Upload</Button>
          </form>
        </CardContent>
      </Card>
      <Snackbar open={open} autoHideDuration={3000} onClose={() => setOpen(false)}>
        <MuiAlert onClose={() => setOpen(false)} severity="success" sx={{ width: '100%' }}>
          File uploaded!
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}

export default BatchUpload; 