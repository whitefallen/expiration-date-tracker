import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { ThemeContextProvider } from './contexts/ThemeContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { AddEditProductPage } from './pages/AddEditProductPage';
import { BarcodeScannerPage } from './pages/BarcodeScannerPage';
import { ExpiryScannerPage } from './pages/ExpiryScannerPage';
import { initializeNotificationService } from './services/notificationService';
import { InstallPrompt } from './components/InstallPrompt';

function App() {
  useEffect(() => {
    // Initialize notification service
    const cleanup = initializeNotificationService();
    return cleanup;
  }, []);

  return (
    <ThemeContextProvider>
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
        <InstallPrompt />
      </Router>
    </ThemeContextProvider>
  );
}

export default App;
