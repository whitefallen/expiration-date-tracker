import { useState, useRef, useEffect } from 'react';
import {
  Typography,
  Box,
  Button,
  Paper,
  Alert,
  TextField,
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import StopIcon from '@mui/icons-material/Stop';
import { BarcodeScanner } from '../services/barcodeScanner';
import { useNavigate } from 'react-router-dom';

export const BarcodeScannerPage = () => {
  const [scanning, setScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  const startScanning = async () => {
    if (!videoRef.current) return;

    try {
      setError('');
      await BarcodeScanner.initialize(videoRef.current, (result) => {
        setScannedCode(result.code);
        stopScanning();
      });
      setScanning(true);
    } catch (err) {
      setError('Failed to start camera. Please ensure camera permissions are granted.');
      console.error(err);
    }
  };

  const stopScanning = () => {
    BarcodeScanner.stop();
    setScanning(false);
  };

  const useBarcode = () => {
    // Navigate to add product page with barcode pre-filled
    navigate('/add', { state: { barcode: scannedCode } });
  };

  useEffect(() => {
    return () => {
      if (scanning) {
        stopScanning();
      }
    };
  }, [scanning]);

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Scan Barcode
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {scannedCode && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Barcode detected: {scannedCode}
          </Alert>
        )}

        <Box
          sx={{
            width: '100%',
            maxWidth: 640,
            margin: '0 auto',
            mb: 2,
          }}
        >
          <video
            ref={videoRef}
            style={{
              width: '100%',
              maxWidth: '100%',
              display: scanning ? 'block' : 'none',
              border: '2px solid #1976d2',
              borderRadius: '4px',
            }}
          />

          {!scanning && !scannedCode && (
            <Box
              sx={{
                width: '100%',
                height: 480,
                backgroundColor: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 1,
              }}
            >
              <Typography variant="h6" color="text.secondary">
                Camera preview will appear here
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
          {!scanning && !scannedCode && (
            <Button
              variant="contained"
              startIcon={<QrCodeScannerIcon />}
              onClick={startScanning}
              fullWidth
            >
              Start Scanning
            </Button>
          )}

          {scanning && (
            <Button
              variant="contained"
              color="error"
              startIcon={<StopIcon />}
              onClick={stopScanning}
              fullWidth
            >
              Stop Scanning
            </Button>
          )}

          {scannedCode && (
            <>
              <TextField
                fullWidth
                label="Scanned Barcode"
                value={scannedCode}
                disabled
                sx={{ mb: 2 }}
              />
              <Button variant="contained" onClick={useBarcode} fullWidth>
                Add Product with this Barcode
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setScannedCode('');
                  startScanning();
                }}
                fullWidth
              >
                Scan Another
              </Button>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};
