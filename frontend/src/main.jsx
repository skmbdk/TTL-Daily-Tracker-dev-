import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'app-toast',
            style: {
              background: 'var(--panel-strong)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-soft)'
            }
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
