import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const categories = ['General', 'Electronics', 'Food', 'Clothing'];

function ProductForm() {
  const [open, setOpen] = React.useState(false);
  const formik = useFormik({
    initialValues: {
      name: '',
      stock: '',
      category: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Required'),
      stock: Yup.number().required('Required').min(0, 'Must be >= 0'),
      category: Yup.string().required('Required'),
    }),
    onSubmit: (values, { resetForm }) => {
      setOpen(true);
      resetForm();
    },
  });

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>Add/Edit Product</Typography>
      <form onSubmit={formik.handleSubmit}>
        <TextField
          fullWidth
          margin="normal"
          id="name"
          name="name"
          label="Product Name"
          value={formik.values.name}
          onChange={formik.handleChange}
          error={formik.touched.name && Boolean(formik.errors.name)}
          helperText={formik.touched.name && formik.errors.name}
        />
        <TextField
          fullWidth
          margin="normal"
          id="stock"
          name="stock"
          label="Stock"
          type="number"
          value={formik.values.stock}
          onChange={formik.handleChange}
          error={formik.touched.stock && Boolean(formik.errors.stock)}
          helperText={formik.touched.stock && formik.errors.stock}
        />
        <TextField
          fullWidth
          margin="normal"
          id="category"
          name="category"
          label="Category"
          select
          value={formik.values.category}
          onChange={formik.handleChange}
          error={formik.touched.category && Boolean(formik.errors.category)}
          helperText={formik.touched.category && formik.errors.category}
        >
          {categories.map((option) => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </TextField>
        <Button color="primary" variant="contained" fullWidth type="submit" sx={{ mt: 2 }}>
          Submit
        </Button>
      </form>
      <Snackbar open={open} autoHideDuration={3000} onClose={() => setOpen(false)}>
        <MuiAlert onClose={() => setOpen(false)} severity="success" sx={{ width: '100%' }}>
          Product submitted!
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}

export default ProductForm; 