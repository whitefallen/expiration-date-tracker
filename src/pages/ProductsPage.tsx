import { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Fab,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { db, type Product } from '../db/database';
import { useNavigate } from 'react-router-dom';

export const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadProducts = async () => {
    try {
      const allProducts = await db.products.toArray();
      setProducts(allProducts.sort((a, b) => 
        new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime()
      ));
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (window.confirm('Are you sure you want to delete this product?')) {
      await db.products.delete(id);
      loadProducts();
    }
  };

  const getExpiryStatus = (expirationDate: Date) => {
    const now = new Date();
    const expiry = new Date(expirationDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: 'Expired', color: 'error' as const };
    } else if (diffDays <= 7) {
      return { label: 'Expiring Soon', color: 'warning' as const };
    } else if (diffDays <= 30) {
      return { label: `${diffDays} days left`, color: 'info' as const };
    } else {
      return { label: `${diffDays} days left`, color: 'success' as const };
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        All Products
      </Typography>

      {products.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No products added yet. Click the + button to add your first product!
        </Alert>
      ) : (
        <List>
          {products.map((product) => {
            const status = getExpiryStatus(product.expirationDate);
            return (
              <ListItem
                key={product.id}
                secondaryAction={
                  <Box>
                    <IconButton edge="end" aria-label="edit" onClick={() => navigate(`/edit/${product.id}`)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(product.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
                sx={{
                  mb: 1,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="h6">{product.name}</Typography>
                      <Chip label={status.label} color={status.color} size="small" />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {product.category}
                        {product.brand && ` • ${product.brand}`}
                      </Typography>
                      <br />
                      Expires: {new Date(product.expirationDate).toLocaleDateString()}
                      {product.notes && (
                        <>
                          <br />
                          Notes: {product.notes}
                        </>
                      )}
                    </>
                  }
                />
              </ListItem>
            );
          })}
        </List>
      )}

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => navigate('/add')}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};
