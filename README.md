# Expiration Date Tracker

A Progressive Web App (PWA) for tracking expiration dates of your makeup and other products. Never let your products expire again!

## Features

- 📱 **Progressive Web App**: Install on your device and use offline
- 📷 **Barcode Scanning**: Scan product barcodes using QuaggaJS
- 🔍 **OCR Text Recognition**: Scan expiration dates from product images using TesseractJS
- ✏️ **CRUD Operations**: Create, Read, Update, and Delete product entries
- 💾 **Client-Side Storage**: All data stored locally using IndexedDB (via Dexie.js)
- 🎨 **Clean UI**: Modern, responsive design using Material-UI
- 📊 **Smart Notifications**: Visual indicators for expiring and expired products

## Tech Stack

### Frontend Framework
- **React 19** with **TypeScript** for type-safe development
- **Vite** for fast development and optimized builds

### UI Library
- **Material-UI (MUI)** for beautiful, accessible components
- **React Router** for client-side routing

### PWA Support
- **vite-plugin-pwa** with Workbox for service worker management
- Offline-first architecture

### Data Storage
- **Dexie.js** for IndexedDB wrapper with a clean API

### Scanning Features
- **QuaggaJS (@ericblade/quagga2)** for barcode scanning
- **TesseractJS** for OCR text recognition of expiration dates

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/whitefallen/expiration-date-tracker.git
cd expiration-date-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage

### Adding Products

1. **Manual Entry**: Click "Add Product" and fill in the product details
2. **Barcode Scan**: Click "Scan Barcode" to automatically capture barcode information
3. **Expiry Scan**: Click "Scan Expiry Date" to extract dates from product images using OCR

### Managing Products

- View all products in the "All Products" page
- Products are sorted by expiration date
- Color-coded status indicators:
  - 🔴 Red: Expired
  - 🟡 Yellow: Expiring within 7 days
  - 🔵 Blue: Expiring within 30 days
  - 🟢 Green: More than 30 days remaining

### Editing and Deleting

- Click the edit icon to modify product details
- Click the delete icon to remove a product (with confirmation)

## Project Structure

```
src/
├── components/      # Reusable React components
│   └── Layout.tsx   # Main layout with navigation
├── pages/          # Page components
│   ├── HomePage.tsx
│   ├── ProductsPage.tsx
│   ├── AddEditProductPage.tsx
│   ├── BarcodeScannerPage.tsx
│   └── ExpiryScannerPage.tsx
├── services/       # Business logic and external integrations
│   ├── barcodeScanner.ts
│   └── ocrScanner.ts
├── db/            # Database configuration
│   └── database.ts
├── App.tsx        # Main app component with routing
└── main.tsx       # App entry point
```

## Security Note

This application has some npm audit warnings related to the QuaggaJS library's dependencies (specifically the deprecated `request` library). These vulnerabilities are in server-side code paths and do not affect the client-side barcode scanning functionality. The app runs entirely in the browser and does not make external network requests with these dependencies.

## Browser Compatibility

- Chrome/Edge (recommended for best camera and PWA support)
- Firefox
- Safari (iOS 11.3+ for PWA features)

**Note**: Camera features require HTTPS in production environments.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Future Enhancements

- [ ] Push notifications for expiring products
- [ ] Export/Import data functionality
- [ ] Product categories customization
- [ ] Multiple language support
- [ ] Cloud sync option
- [ ] Product usage tracking
- [ ] Shopping list generation from expired items
