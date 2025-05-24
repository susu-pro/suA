import React from 'react';
import ReactDOM from 'react-dom/client';
import HotelDataVisualization from './HotelVisualization';
import './styles.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'typeface-noto-sans-sc';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HotelDataVisualization />
  </React.StrictMode>
);