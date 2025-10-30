import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  TextField,
  Button,
  MenuItem,
  Paper,
  Alert,
} from '@mui/material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { db, type Product } from '../db/database';

const categories = [
  'Makeup - Face',
  'Makeup - Eyes',
  'Makeup - Lips',
  'Skincare',
  'Hair Care',
  'Fragrance',
  'Other',
];

export const AddEditProductPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Makeup - Face',
    expirationDate: '',
    purchaseDate: '',
    brand: '',
    barcode: '',
    notes: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      loadProduct(parseInt(id));
    } else if (location.state) {
      // Pre-fill from scanner pages
      const state = location.state as { barcode?: string; expirationDate?: string };
      if (state.barcode) {
        setFormData((prev) => ({ ...prev, barcode: state.barcode! }));
      }
      if (state.expirationDate) {
        // Try to parse the date string
        const parsedDate = parseExpirationDate(state.expirationDate);
        if (parsedDate) {
          setFormData((prev) => ({ ...prev, expirationDate: parsedDate }));
        }
      }
    }
  }, [id, isEdit, location.state]);

  const loadProduct = async (productId: number) => {
    try {
      const product = await db.products.get(productId);
      if (product) {
        setFormData({
          name: product.name,
          category: product.category,
          expirationDate: new Date(product.expirationDate).toISOString().split('T')[0],
          purchaseDate: product.purchaseDate
            ? new Date(product.purchaseDate).toISOString().split('T')[0]
            : '',
          brand: product.brand || '',
          barcode: product.barcode || '',
          notes: product.notes || '',
        });
      }
    } catch {
      setError('Failed to load product');
    }
  };

  const parseExpirationDate = (dateString: string): string => {
    // Try to parse common date formats and convert to YYYY-MM-DD
    try {
      // Remove common prefixes (both English and German)
      const cleanDate = dateString.replace(/(?:EXP|MHD)[:\s]*/gi, '').trim();
      
      // Try parsing different formats (prioritizing German/European formats)
      const datePatterns = [
        // German standard format with dots
        { regex: /(\d{2})\.(\d{2})\.(\d{4})/, format: 'DD.MM.YYYY' },
        { regex: /(\d{2})\.(\d{4})/, format: 'MM.YYYY' },
        
        // European format with slashes or hyphens
        { regex: /(\d{2})[/\\-](\d{2})[/\\-](\d{4})/, format: 'DD/MM/YYYY' },
        { regex: /(\d{2})[/\\-](\d{4})/, format: 'MM/YYYY' },
        
        // ISO format
        { regex: /(\d{4})[/.\\-](\d{2})[/.\\-](\d{2})/, format: 'YYYY/MM/DD' },
      ];

      for (const pattern of datePatterns) {
        const match = cleanDate.match(pattern.regex);
        if (match) {
          if (pattern.format === 'MM/YYYY' || pattern.format === 'MM.YYYY') {
            // Assume last day of month for MM/YYYY format
            const year = parseInt(match[2]);
            const month = parseInt(match[1]);
            const lastDay = new Date(year, month, 0).getDate();
            return `${match[2]}-${match[1].padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
          } else if (pattern.format === 'DD/MM/YYYY' || pattern.format === 'DD.MM.YYYY') {
            // European/German format: DD.MM.YYYY or DD/MM/YYYY
            return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
          } else if (pattern.format === 'YYYY/MM/DD') {
            return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
          }
        }
      }
      
      return '';
    } catch {
      return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.expirationDate) {
      setError('Name and expiration date are required');
      return;
    }

    const product: Omit<Product, 'id'> = {
      name: formData.name,
      category: formData.category,
      expirationDate: new Date(formData.expirationDate),
      purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate) : undefined,
      brand: formData.brand || undefined,
      barcode: formData.barcode || undefined,
      notes: formData.notes || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      if (isEdit && id) {
        await db.products.update(parseInt(id), { ...product, updatedAt: new Date() });
      } else {
        await db.products.add(product as Product);
      }
      setSuccess(true);
      setTimeout(() => navigate('/products'), 1500);
    } catch {
      setError('Failed to save product');
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {isEdit ? 'Edit Product' : 'Add New Product'}
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Product {isEdit ? 'updated' : 'added'} successfully!
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            select
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          >
            {categories.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Expiration Date"
            name="expirationDate"
            type="date"
            value={formData.expirationDate}
            onChange={handleChange}
            required
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Purchase Date"
            name="purchaseDate"
            type="date"
            value={formData.purchaseDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Barcode"
            name="barcode"
            value={formData.barcode}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button variant="contained" type="submit" fullWidth>
              {isEdit ? 'Update Product' : 'Add Product'}
            </Button>
            <Button variant="outlined" fullWidth onClick={() => navigate('/products')}>
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};
