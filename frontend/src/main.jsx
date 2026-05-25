import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.9rem',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
            },
            success: {
              iconTheme: { primary: '#1B4F8A', secondary: '#fff' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
