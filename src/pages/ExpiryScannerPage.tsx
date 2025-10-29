import { useState, useRef } from 'react';
import {
  Typography,
  Box,
  Button,
  Paper,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { OCRScanner } from '../services/ocrScanner';
import { useNavigate } from 'react-router-dom';

export const ExpiryScannerPage = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{ text: string; dates: string[] } | null>(null);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setScanning(true);
    setResult(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const ocrResult = await OCRScanner.scanImage(file);
      setResult({
        text: ocrResult.text,
        dates: ocrResult.possibleDates,
      });
    } catch (err) {
      setError('Failed to scan image. Please try again.');
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  const handleDateSelect = (date: string) => {
    // Navigate to add product page with expiration date pre-filled
    navigate('/add', { state: { expirationDate: date } });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Scan Expiration Date
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<CameraAltIcon />}
            onClick={triggerFileInput}
            fullWidth
            disabled={scanning}
          >
            {scanning ? 'Scanning...' : 'Take/Select Photo'}
          </Button>
        </Box>

        {scanning && (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        )}

        {previewUrl && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Image Preview
            </Typography>
            <img
              src={previewUrl}
              alt="Scanned product"
              style={{
                maxWidth: '100%',
                maxHeight: 400,
                display: 'block',
                margin: '0 auto',
                borderRadius: 4,
              }}
            />
          </Box>
        )}

        {result && (
          <Box>
            {result.dates.length > 0 ? (
              <>
                <Alert severity="success" sx={{ mb: 2 }}>
                  Found {result.dates.length} potential expiration date(s)
                </Alert>
                <Typography variant="h6" gutterBottom>
                  Select the expiration date:
                </Typography>
                <List>
                  {result.dates.map((date, index) => (
                    <ListItem key={index} disablePadding>
                      <ListItemButton onClick={() => handleDateSelect(date)}>
                        <ListItemText primary={date} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </>
            ) : (
              <>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  No expiration dates found in the image.
                </Alert>
                <Typography variant="body2" color="text.secondary">
                  Extracted text:
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, mt: 1, maxHeight: 200, overflow: 'auto' }}>
                  <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                    {result.text}
                  </Typography>
                </Paper>
              </>
            )}

            <Button
              variant="outlined"
              onClick={() => {
                setResult(null);
                setPreviewUrl(null);
              }}
              fullWidth
              sx={{ mt: 2 }}
            >
              Scan Another Image
            </Button>
          </Box>
        )}
      </Paper>

      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Tips for better scanning:</strong>
          <br />
          • Ensure good lighting
          <br />
          • Hold the camera steady
          <br />
          • Make sure the expiration date is clearly visible
          <br />• Try to capture just the relevant part of the product
        </Typography>
      </Alert>
    </Box>
  );
};
