"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone, Share2, ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function InstallPwaPage() {
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

  if (isStandalone) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 max-w-md">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone size={32} className="text-emerald-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">App Already Installed</h1>
          <p className="text-slate-500 text-sm mb-6">
            You're already using the standalone version of OSR Pros. Enjoy!
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Simple header with back button */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-slate-500 hover:text-slate-700">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-sm font-semibold text-slate-800">Install App</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-5 space-y-6">
        {/* Hero card */}
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-200">
          <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Smartphone size={40} className="text-emerald-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">Install OSR Pros</h2>
          <p className="text-sm text-slate-500 mb-4">
            Get the full experience with quick access, offline support, and a home screen icon.
          </p>
          
          {showInstall && !isIOS && (
            <button
              onClick={handleInstall}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-md hover:bg-emerald-700 transition active:scale-98"
            >
              <Download size={18} />
              Install App
            </button>
          )}

          {isIOS && (
            <div className="space-y-3">
              <div className="bg-slate-50 rounded-xl p-4 text-left">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Share2 size={16} className="text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">1. Tap the Share button</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <ExternalLink size={16} className="text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">2. Tap "Add to Home Screen"</span>
                </div>
              </div>
              <button
                onClick={handleInstall}
                className="w-full flex items-center justify-center gap-2 bg-slate-200 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-300 transition"
              >
                Show Instructions
              </button>
            </div>
          )}

          {!showInstall && !isIOS && (
            <div className="text-center">
              <p className="text-sm text-amber-600 mb-3">Install prompt not available right now.</p>
              <p className="text-xs text-slate-400">You can still use the web app normally.</p>
            </div>
          )}
        </div>

        {/* Feature list */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <h3 className="text-sm font-bold text-slate-800 mb-3">Why install?</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              One‑tap access from your home screen
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Works offline (once loaded)
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Faster & distraction‑free
            </li>
          </ul>
        </div>

        <p className="text-center text-[10px] text-slate-400">
          The app is a Progressive Web App (PWA). Installation is optional but recommended.
        </p>
      </div>
    </div>
  );
}