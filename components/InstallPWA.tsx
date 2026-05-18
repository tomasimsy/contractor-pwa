"use client";

import { useEffect, useState } from 'react';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);
    
    // Check if already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);
    
    // Only show install button if not already installed
    if (standalone) return;

    // Listen for install prompt (Chrome/Edge)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    
    // For iOS, always show custom instructions
    if (iOS) {
      setShowInstall(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Chrome/Edge install
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstall(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      // Show iOS instructions
      alert('To install: Tap Share button → "Add to Home Screen"');
    }
  };

  // Don't show if already installed
  if (isStandalone) return null;
  if (!showInstall) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-navy text-white rounded-xl p-4 shadow-xl z-50">
      <div className="flex justify-between items-center">
        <div>
          <div className="font-semibold">
            {isIOS ? '📱 Install App' : '📱 Install App'}
          </div>
          <div className="text-xs text-gray-300">
            {isIOS 
              ? 'Tap Share → "Add to Home Screen"' 
              : 'Install for a better experience'}
          </div>
        </div>
        <button
          onClick={handleInstall}
          className="px-4 py-2 bg-gold text-navy rounded-lg text-sm font-semibold"
        >
          {isIOS ? 'How to Install' : 'Install'}
        </button>
      </div>
    </div>
  );
}