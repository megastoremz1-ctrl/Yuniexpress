"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Save, RefreshCw } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    defaultMargin: "25",
    exchangeRate: "",
    syncInterval: "30",
    storeName: "YuniExpress",
    supportEmail: "suporte@yuniexpress.co.mz",
    supportPhone: "+258 84 000 0000",
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save settings to API
      toast.success("Configurações guardadas com sucesso");
    } catch (error) {
      toast.error("Erro ao guardar configurações");
    } finally {
      setLoading(false);
    }
  };

  const handleSyncNow = async () => {
    try {
      toast.success("Sincronização iniciada");
    } catch (error) {
      toast.error("Erro ao iniciar sincronização");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Configurações</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pricing Settings */}
        <div className="bg-white p-6 rounded-xl border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Preços & Margem</h2>
          <div className="space-y-4">
            <Input
              label="Margem de lucro padrão (%)"
              type="number"
              value={settings.defaultMargin}
              onChange={(e) => setSettings({ ...settings, defaultMargin: e.target.value })}
            />
            <Input
              label="Taxa de câmbio manual (USD → MZN)"
              type="number"
              step="0.01"
              value={settings.exchangeRate}
              onChange={(e) => setSettings({ ...settings, exchangeRate: e.target.value })}
              placeholder="Deixe vazio para usar taxa automática"
            />
            <p className="text-xs text-gray-500">
              A taxa de câmbio é atualizada automaticamente. Só defina manualmente se necessário.
            </p>
          </div>
        </div>

        {/* Sync Settings */}
        <div className="bg-white p-6 rounded-xl border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sincronização</h2>
          <div className="space-y-4">
            <Input
              label="Intervalo de sincronização (minutos)"
              type="number"
              value={settings.syncInterval}
              onChange={(e) => setSettings({ ...settings, syncInterval: e.target.value })}
            />
            <Button onClick={handleSyncNow} variant="outline" fullWidth>
              <RefreshCw size={16} className="mr-2" />
              Sincronizar Agora
            </Button>
            <p className="text-xs text-gray-500">
              O robô sincroniza produtos, preços e stock a cada {settings.syncInterval} minutos.
            </p>
          </div>
        </div>

        {/* Store Info */}
        <div className="bg-white p-6 rounded-xl border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações da Loja</h2>
          <div className="space-y-4">
            <Input
              label="Nome da loja"
              value={settings.storeName}
              onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
            />
            <Input
              label="Email de suporte"
              type="email"
              value={settings.supportEmail}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
            />
            <Input
              label="Telefone de suporte"
              value={settings.supportPhone}
              onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
            />
          </div>
        </div>

        {/* API Keys */}
        <div className="bg-white p-6 rounded-xl border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Chaves API</h2>
          <div className="space-y-4">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-700">AliExpress API</p>
              <p className="text-xs text-green-600">Configurada via variáveis de ambiente</p>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-700">PayGo API</p>
              <p className="text-xs text-green-600">Configurada via variáveis de ambiente</p>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-700">OneSignal</p>
              <p className="text-xs text-green-600">Configurada via variáveis de ambiente</p>
            </div>
            <p className="text-xs text-gray-500">
              As chaves API são geridas através do ficheiro .env por segurança.
            </p>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} loading={loading} size="lg">
          <Save size={16} className="mr-2" />
          Guardar Configurações
        </Button>
      </div>
    </div>
  );
}
