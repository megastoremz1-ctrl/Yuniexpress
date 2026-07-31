"use client";

import { useState, useEffect } from "react";
import { X, Shield, ShoppingBag } from "lucide-react";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("ye_cookie_consent");
    if (!consent) {
      setTimeout(() => setShow(true), 2500);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("ye_cookie_consent", "all");
    setShow(false);
  };

  const handleEssential = () => {
    localStorage.setItem("ye_cookie_consent", "essential");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] p-3 animate-in slide-in-from-bottom">
      <div className="max-w-lg mx-auto bg-gray-900 rounded-2xl shadow-2xl p-5 text-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
              <ShoppingBag size={16} className="text-white" />
            </div>
            <span className="text-sm font-bold">YuniExpress</span>
          </div>
          <button onClick={handleEssential} className="text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        {/* Message */}
        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          A YuniExpress utiliza cookies para lhe oferecer a melhor experiência de compras — 
          personalizar produtos, guardar o seu carrinho, lembrar as suas preferências e 
          garantir pagamentos seguros via M-Pesa e e-Mola.
        </p>

        {/* What we use */}
        <div className="flex gap-3 mb-4 text-[10px] text-gray-400">
          <span className="flex items-center gap-1">
            <Shield size={10} className="text-green-400" /> Segurança
          </span>
          <span className="flex items-center gap-1">
            <ShoppingBag size={10} className="text-yellow-400" /> Carrinho
          </span>
          <span>📊 Análise</span>
          <span>🎯 Personalização</span>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleAccept}
            className="flex-1 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold rounded-lg transition-colors"
          >
            Aceitar Todos
          </button>
          <button
            onClick={handleEssential}
            className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium rounded-lg transition-colors"
          >
            Só Essenciais
          </button>
        </div>

        <p className="text-[9px] text-gray-500 text-center mt-2">
          Ao continuar a navegar, aceita a nossa{" "}
          <a href="/privacy" className="text-yellow-500 underline">Política de Privacidade</a>
        </p>
      </div>
    </div>
  );
}
