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
            background: theme === 'dark' ? '#0B1220' : '#fff',
            color: theme === 'dark' ? '#fff' : '#0B1220',
            border: '1px solid rgba(126,217,87,0.3)',
            fontFamily: 'Inter, sans-serif',
          },
        }}
      />
    </Provider>
  </React.StrictMode>
);
