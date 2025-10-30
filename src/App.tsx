import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { AddEditProductPage } from './pages/AddEditProductPage';
import { BarcodeScannerPage } from './pages/BarcodeScannerPage';
import { ExpiryScannerPage } from './pages/ExpiryScannerPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router basename={import.meta.env.BASE_URL}>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/add" element={<AddEditProductPage />} />
            <Route path="/edit/:id" element={<AddEditProductPage />} />
            <Route path="/scan-barcode" element={<BarcodeScannerPage />} />
            <Route path="/scan-expiry" element={<ExpiryScannerPage />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
