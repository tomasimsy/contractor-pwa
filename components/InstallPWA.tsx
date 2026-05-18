"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);
    
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);
    
    if (standalone) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    
    if (iOS) {
      setShowInstall(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstall(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      alert('Tap Share button → "Add to Home Screen"');
    }
  };

  if (isStandalone) return null;
  if (!showInstall) return null;

  return (
    <>
      {/* Bottom banner - your existing one */}
      <div className="fixed bottom-20 left-4 right-4 bg-navy text-white rounded-xl p-4 shadow-xl z-50">
        <div className="flex justify-between items-center">
          <div>
            <div className="font-semibold">📱 Install App</div>
            <div className="text-xs bg-primary text-white inline-block mt-1 px-2 py-0.5 rounded">
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

      {/* Floating button - bottom left corner */}
      <button
        onClick={handleInstall}
        className="fixed bottom-6 left-4 z-50 bg-navy text-white p-3 rounded-full shadow-lg hover:bg-navy-light transition-all duration-200"
        title="Install App"
      >
        <Download size={20} />
      </button>
    </>
  );
}