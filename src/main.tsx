import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/base.css';
import './styles/museum.css';
import './styles/artifacts.css';
import './styles/hall.css';
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
