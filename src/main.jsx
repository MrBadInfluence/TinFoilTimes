// main.jsx — the ignition key. It finds the empty <div id="root">
// in index.html and tells React: "draw the <App /> in there."
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css'; // your original newspaper styling, unchanged

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
