import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import './styles/index.css';
import GoldRateProvider from './context/GoldRateProvider.jsx';
import MetalRateProvider from './context/MetalRateProvider.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <GoldRateProvider>
       <MetalRateProvider>
      <App />
      </MetalRateProvider>
    </GoldRateProvider>
  </BrowserRouter>
);
