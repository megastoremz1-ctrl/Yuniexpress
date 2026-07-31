"use client";

import { useState, useEffect } from "react";
import { X, Cookie } from "lucide-react";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      // Show after 2 seconds
      setTimeout(() => setShow(true), 2000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setShow(false);
  };

  const handleReject = () => {
    localStorage.setItem("cookie_consent", "rejected");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 animate-in slide-in-from-bottom">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl border p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center shrink-0">
            <Cookie size={20} className="text-yellow-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900">Utilizamos Cookies 🍪</h3>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Este site utiliza cookies para melhorar a sua experiência, personalizar conteúdo e anúncios, 
              fornecer funcionalidades de redes sociais e analisar o nosso tráfego. Ao clicar em "Aceitar", 
              concorda com a utilização de todos os cookies.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={handleAccept}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-medium rounded-lg transition-colors"
              >
                Aceitar Todos
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors"
              >
                Apenas Essenciais
              </button>
              <a
                href="/privacy"
                className="px-4 py-2 text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Política de Privacidade
              </a>
            </div>
          </div>
          <button onClick={handleReject} className="text-gray-400 hover:text-gray-600 shrink-0">
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
