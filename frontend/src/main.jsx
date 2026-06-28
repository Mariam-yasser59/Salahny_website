import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './services/AuthContext.jsx';
import './styles/styles.css';

globalThis.React = React;

const resetHash = window.location.hash || '';
if (resetHash.startsWith('#/forgot-password')) {
  const query = resetHash.includes('?') ? `?${resetHash.split('?')[1]}` : '';
  window.history.replaceState(null, '', `/forgot-password${query}`);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
