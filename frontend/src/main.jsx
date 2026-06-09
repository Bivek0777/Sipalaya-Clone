import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async';
import axios from 'axios';
import './index.css'
import App from './App.jsx'

const apiBaseUrl = import.meta.env.PROD
  ? (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
  : '';

if (apiBaseUrl) {
  axios.defaults.baseURL = apiBaseUrl;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
)
