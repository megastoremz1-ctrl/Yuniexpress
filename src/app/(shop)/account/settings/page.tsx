"use client";

import { useSession } from "next-auth/react";
import { Settings, User, Lock } from "lucide-react";

export default function AccountSettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Configurações da Conta</h1>

      <div className="space-y-4">
        <div className="bg-white p-5 rounded-xl border">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <User size={18} className="text-yellow-500" /> Dados Pessoais
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Nome</span>
              <span className="text-gray-900 font-medium">{session?.user?.name || "—"}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Email</span>
              <span className="text-gray-900 font-medium">{session?.user?.email || "—"}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Lock size={18} className="text-yellow-500" /> Segurança
          </h2>
          <div className="text-center py-6">
            <Settings size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">Alteração de password em desenvolvimento</p>
          </div>
        </div>
      </div>
    </div>
  );
}
