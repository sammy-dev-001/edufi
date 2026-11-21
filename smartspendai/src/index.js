import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { SpendingProvider } from './state/SpendingContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <SpendingProvider>
        <App />
      </SpendingProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to measure performance in your app, uncomment the line below
// and optionally pass a function to log results or send to an analytics endpoint.
// Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
