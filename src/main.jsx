import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App'; // asegurate que App.js tiene `export default App;`
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
