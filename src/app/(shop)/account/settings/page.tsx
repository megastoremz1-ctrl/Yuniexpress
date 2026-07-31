"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { User, Save, Check } from "lucide-react";
import toast from "react-hot-toast";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function AccountSettingsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
  });

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setForm({
            name: d.user.name || "",
            phone: d.user.phone || "",
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Perfil actualizado com sucesso!");
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        toast.error("Erro ao actualizar");
      }
    } catch {
      toast.error("Erro ao actualizar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Configurações da Conta</h1>

      <div className="bg-white p-6 rounded-xl border">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User size={18} className="text-yellow-500" /> Dados Pessoais
        </h2>

        <div className="space-y-4">
          <Input
            label="Nome completo"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="O seu nome"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={session?.user?.email || ""}
              disabled
              className="w-full px-4 py-2.5 border rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">O email não pode ser alterado</p>
          </div>
          <Input
            label="Telemóvel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+258 84/85/86/87 XXXXXXX"
          />
        </div>

        <div className="mt-6">
          <Button onClick={handleSave} loading={loading} fullWidth>
            {saved ? <><Check size={16} className="mr-2" /> Guardado!</> : <><Save size={16} className="mr-2" /> Guardar Alterações</>}
          </Button>
        </div>
      </div>
    </div>
  );
}
