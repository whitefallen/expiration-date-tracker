import {
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ListAltIcon from '@mui/icons-material/ListAlt';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import CameraAltIcon from '@mui/icons-material/CameraAlt';

export const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Add Product',
      description: 'Manually add products with expiration dates',
      icon: <AddCircleOutlineIcon sx={{ fontSize: 60 }} />,
      action: () => navigate('/add'),
      color: '#1976d2',
    },
    {
      title: 'View All Products',
      description: 'See all your tracked products',
      icon: <ListAltIcon sx={{ fontSize: 60 }} />,
      action: () => navigate('/products'),
      color: '#2e7d32',
    },
    {
      title: 'Scan Barcode',
      description: 'Scan product barcodes to auto-fill information',
      icon: <QrCodeScannerIcon sx={{ fontSize: 60 }} />,
      action: () => navigate('/scan-barcode'),
      color: '#ed6c02',
    },
    {
      title: 'Scan Expiry Date',
      description: 'Use OCR to scan expiration dates from images',
      icon: <CameraAltIcon sx={{ fontSize: 60 }} />,
      action: () => navigate('/scan-expiry'),
      color: '#9c27b0',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        Welcome to Expiration Date Tracker
      </Typography>
      <Typography variant="body1" paragraph align="center" sx={{ mb: 4 }}>
        Keep track of your makeup and product expiration dates with ease. Never let
        products expire again!
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>
        {features.map((feature, index) => (
          <Box key={index} sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' }, minWidth: 250 }}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: 6,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box sx={{ color: feature.color, mb: 2 }}>{feature.icon}</Box>
                <Typography gutterBottom variant="h6" component="h2">
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button size="small" variant="contained" onClick={feature.action}>
                  Open
                </Button>
              </CardActions>
            </Card>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
