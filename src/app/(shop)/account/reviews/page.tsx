"use client";

import { Star, MessageSquare } from "lucide-react";

export default function ReviewsPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Minhas Avaliações</h1>
      <div className="text-center py-16 bg-white rounded-xl border">
        <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="font-semibold text-gray-700 mb-2">Em Desenvolvimento</h2>
        <p className="text-sm text-gray-500">
          Em breve poderá avaliar os produtos que comprou e ajudar outros clientes.
        </p>
        <div className="flex justify-center gap-1 mt-4">
          {[1,2,3,4,5].map(i => <Star key={i} size={20} className="text-gray-200" />)}
        </div>
      </div>
    </div>
  );
}
