
import { createRoot } from 'react-dom/client';
import React, { useState, useEffect } from 'react';
import App from './App.tsx';
import './index.css';
import CustomSplashScreen from './components/CustomSplashScreen.tsx';

// Add type definition for electron API
declare global {
  interface Window {
    electron?: {
      minimize: () => void;
      maximize: () => void;
      close: () => void;
    };
  }
}

const Root = () => {
  const [isSplashVisible, setSplashVisible] = useState(true);
  
  return (
    <React.StrictMode>
      <CustomSplashScreen
        onComplete={() => setSplashVisible(false)}
        duration={2500}
      />
      {!isSplashVisible && <App />}
    </React.StrictMode>
  );
};

createRoot(document.getElementById("root")!).render(<Root />);
