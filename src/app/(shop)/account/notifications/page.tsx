"use client";

import { Bell, Package, Tag } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Notificações</h1>
      <div className="text-center py-16 bg-white rounded-xl border">
        <Bell size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="font-semibold text-gray-700 mb-2">Sem notificações</h2>
        <p className="text-sm text-gray-500">
          Receberá notificações sobre o estado das suas encomendas e promoções exclusivas.
        </p>
      </div>
    </div>
  );
}
