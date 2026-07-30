"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Save, RefreshCw, Image, Globe, Percent, Bell, Store } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({
    store_name: "YuniExpress",
    store_logo: "",
    store_tagline: "Compre Global, Pague Local",
    support_email: "suporte@yuniexpress.co.mz",
    support_phone: "+258 84 000 0000",
    default_margin_percent: "25",
    announcement_bar: "",
    announcement_active: "false",
    homepage_title: "Compras Internacionais em Meticais",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings((prev) => ({ ...prev, ...data.settings }));
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      if (res.ok) {
        toast.success("Configurações guardadas com sucesso!");
      } else {
        toast.error("Erro ao guardar configurações");
      }
    } catch (error) {
      toast.error("Erro ao guardar configurações");
    } finally {
      setSaving(false);
    }
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/sync", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`${data.message} Total: ${data.totalProducts} produtos.`);
      } else {
        toast.error(data.error || "Erro na sincronização");
      }
    } catch (error) {
      toast.error("Erro ao iniciar sincronização");
    } finally {
      setSyncing(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-white rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-sm text-gray-500 mt-1">
            Estas configurações reflectem directamente na loja
          </p>
        </div>
        <Button onClick={handleSave} loading={saving} size="lg">
          <Save size={16} className="mr-2" />
          Guardar Tudo
        </Button>
      </div>

      <div className="space-y-6">
        {/* Store Identity */}
        <div className="bg-white p-6 rounded-xl border">
          <div className="flex items-center gap-2 mb-4">
            <Store size={20} className="text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900">Identidade da Loja</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome da Loja"
              value={settings.store_name}
              onChange={(e) => updateSetting("store_name", e.target.value)}
              placeholder="YuniExpress"
            />
            <Input
              label="Tagline / Slogan"
              value={settings.store_tagline}
              onChange={(e) => updateSetting("store_tagline", e.target.value)}
              placeholder="Compre Global, Pague Local"
            />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo da Loja</label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={settings.store_logo}
                    onChange={(e) => updateSetting("store_logo", e.target.value)}
                    placeholder="URL do logo ou carregue uma imagem..."
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none"
                  />
                </div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const fd = new FormData();
                      fd.append("file", file);
                      fd.append("purpose", "logo");
                      toast.loading("A carregar logo...");
                      try {
                        const res = await fetch("/api/upload", { method: "POST", body: fd });
                        const data = await res.json();
                        toast.dismiss();
                        if (data.url) {
                          updateSetting("store_logo", data.url);
                          toast.success("Logo carregado!");
                        } else {
                          toast.error(data.error || "Erro");
                        }
                      } catch {
                        toast.dismiss();
                        toast.error("Erro ao carregar");
                      }
                    }}
                  />
                  <span className="inline-flex items-center gap-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                    <Image size={14} />
                    Upload
                  </span>
                </label>
              </div>
              {settings.store_logo && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">Preview do Logo:</p>
                  <img
                    src={settings.store_logo}
                    alt="Logo preview"
                    className="h-12 object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              )}
            </div>
            <Input
              label="Título da Homepage (SEO)"
              value={settings.homepage_title}
              onChange={(e) => updateSetting("homepage_title", e.target.value)}
              placeholder="Compras Internacionais em Meticais"
            />
          </div>
        </div>

        {/* Announcement Bar */}
        <div className="bg-white p-6 rounded-xl border">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={20} className="text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900">Barra de Anúncio</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Mensagem que aparece no topo do site (ex: promoções, envio grátis)
          </p>
          <div className="space-y-4">
            <Input
              label="Texto do anúncio"
              value={settings.announcement_bar}
              onChange={(e) => updateSetting("announcement_bar", e.target.value)}
              placeholder="🎉 Envio grátis em todas as encomendas! Use o cupão BEMVINDO10"
            />
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.announcement_active === "true"}
                onChange={(e) => updateSetting("announcement_active", e.target.checked ? "true" : "false")}
                className="w-5 h-5 rounded text-yellow-500 focus:ring-yellow-500"
              />
              <span className="text-sm font-medium text-gray-700">Activar barra de anúncio</span>
            </label>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white p-6 rounded-xl border">
          <div className="flex items-center gap-2 mb-4">
            <Percent size={20} className="text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900">Preços & Margem</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Margem de lucro padrão (%)"
                type="number"
                value={settings.default_margin_percent}
                onChange={(e) => updateSetting("default_margin_percent", e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Aplicada automaticamente sobre o preço USD convertido para MZN
              </p>
            </div>
            <div className="flex items-end">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg w-full">
                <p className="text-sm font-medium text-yellow-800">Fórmula do preço:</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Preço USD × Taxa Câmbio × (1 + {settings.default_margin_percent}%) = Preço MT
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white p-6 rounded-xl border">
          <div className="flex items-center gap-2 mb-4">
            <Globe size={20} className="text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900">Contacto & Suporte</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email de suporte"
              type="email"
              value={settings.support_email}
              onChange={(e) => updateSetting("support_email", e.target.value)}
            />
            <Input
              label="Telefone de suporte"
              value={settings.support_phone}
              onChange={(e) => updateSetting("support_phone", e.target.value)}
            />
          </div>
        </div>

        {/* Sync */}
        <div className="bg-white p-6 rounded-xl border">
          <div className="flex items-center gap-2 mb-4">
            <RefreshCw size={20} className="text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900">Sincronização</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            O sistema sincroniza produtos da AliExpress automaticamente 1x por dia.
            Pode forçar manualmente clicando abaixo.
          </p>
          <Button onClick={handleSyncNow} loading={syncing} variant="outline">
            <RefreshCw size={16} className="mr-2" />
            Sincronizar Agora
          </Button>
        </div>
      </div>

      {/* Floating Save Button */}
      <div className="fixed bottom-6 right-6">
        <Button onClick={handleSave} loading={saving} size="lg" className="shadow-xl">
          <Save size={16} className="mr-2" />
          Guardar
        </Button>
      </div>
    </div>
  );
}
