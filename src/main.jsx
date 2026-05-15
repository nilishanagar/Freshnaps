import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store from './store';
import App from './App';
import './index.css';

// Apply theme on initial load
const theme = localStorage.getItem('freshnaps_theme') || 'light';
document.documentElement.classList.toggle('dark', theme === 'dark');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: theme === 'dark' ? '#1A1A2E' : '#fff',
            color: theme === 'dark' ? '#fff' : '#1A1A2E',
            border: '1px solid rgba(201,169,110,0.3)',
            fontFamily: 'Inter, sans-serif',
          },
        }}
      />
    </Provider>
  </React.StrictMode>
);
