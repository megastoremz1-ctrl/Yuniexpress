"use client";

import { useState, useEffect } from "react";
import { Download, X, Bell, MapPin, Smartphone } from "lucide-react";

export default function InstallPrompt() {
  const [showInstall, setShowInstall] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    // Listen for install prompt
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show install prompt after 5 seconds
      setTimeout(() => {
        if (!localStorage.getItem("install_dismissed")) {
          setShowInstall(true);
        }
      }, 5000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Show permissions prompt after 10 seconds (if not already asked)
    setTimeout(() => {
      if (!localStorage.getItem("permissions_asked")) {
        setShowPermissions(true);
      }
    }, 10000);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setInstalled(true);
      }
      setDeferredPrompt(null);
    }
    setShowInstall(false);
  };

  const handleDismissInstall = () => {
    setShowInstall(false);
    localStorage.setItem("install_dismissed", "true");
  };

  const handlePermissions = async () => {
    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }

    // Request location permission
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {},
        () => {},
        { enableHighAccuracy: false }
      );
    }

    // Initialize OneSignal if available
    if ((window as any).OneSignalDeferred) {
      (window as any).OneSignalDeferred.push(async (OneSignal: any) => {
        await OneSignal.Notifications.requestPermission();
      });
    }

    localStorage.setItem("permissions_asked", "true");
    setShowPermissions(false);
  };

  const handleDismissPermissions = () => {
    localStorage.setItem("permissions_asked", "true");
    setShowPermissions(false);
  };

  return (
    <>
      {/* Install App Prompt */}
      {showInstall && !installed && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 animate-in slide-in-from-bottom">
          <div className="bg-white rounded-2xl shadow-2xl border p-5">
            <button onClick={handleDismissInstall} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center shrink-0">
                <img src="/icons/icon-192x192.png" alt="" className="w-10 h-10 rounded-xl" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-sm">Instalar YuniExpress</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Instale a app para acesso rápido, notificações de ofertas e compras offline.
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleInstall}
                className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                <Download size={16} />
                Instalar App
              </button>
              <button
                onClick={handleDismissInstall}
                className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Agora não
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Prompt (Notifications + Location) */}
      {showPermissions && !showInstall && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 animate-in slide-in-from-bottom">
          <div className="bg-white rounded-2xl shadow-2xl border p-5">
            <button onClick={handleDismissPermissions} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Bell size={18} className="text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Activar Notificações</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Receba alertas de ofertas exclusivas, estado das suas encomendas e promoções especiais.
            </p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Bell size={12} className="text-yellow-500" />
                <span>Notificações de ofertas e promoções</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <MapPin size={12} className="text-green-500" />
                <span>Localização para envio mais rápido</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Smartphone size={12} className="text-purple-500" />
                <span>Actualizações de estado das encomendas</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePermissions}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                Activar
              </button>
              <button
                onClick={handleDismissPermissions}
                className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Depois
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
