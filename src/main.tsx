import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ValueVisibilityProvider } from './contexts/ValueVisibilityContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ValueVisibilityProvider>
      <App />
    </ValueVisibilityProvider>
  </StrictMode>,
);
