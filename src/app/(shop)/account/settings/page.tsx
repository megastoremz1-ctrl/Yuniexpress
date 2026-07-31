"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { User, Save, Check, Camera, MapPin, Phone, Loader2, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const PROVINCES_MZ = [
  "Maputo Cidade",
  "Maputo Província",
  "Gaza",
  "Inhambane",
  "Sofala",
  "Manica",
  "Tete",
  "Zambézia",
  "Nampula",
  "Cabo Delgado",
  "Niassa",
];

export default function AccountSettingsPage() {
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "",
    province: "",
    image: "",
    birthdate: "",
  });

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setForm({
            name: d.user.name || "",
            phone: d.user.phone || "",
            city: d.user.city || "",
            province: d.user.province || "",
            image: d.user.image || "",
            birthdate: d.user.birthdate
              ? new Date(d.user.birthdate).toISOString().split("T")[0]
              : "",
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false));
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          city: form.city,
          province: form.province,
          birthdate: form.birthdate || null,
        }),
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

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Use ficheiros JPG, PNG ou WebP");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("A foto deve ter no máximo 2MB");
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setForm((prev) => ({ ...prev, image: data.url }));
        toast.success("Foto actualizada!");
      } else {
        toast.error(data.error || "Erro ao carregar foto");
      }
    } catch {
      toast.error("Erro ao carregar foto");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Calculate age from birthdate
  const getAge = () => {
    if (!form.birthdate) return null;
    const today = new Date();
    const birth = new Date(form.birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  if (loadingProfile) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-yellow-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const age = getAge();

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Configurações da Conta</h1>

      {/* Profile Photo Section */}
      <div className="bg-white p-6 rounded-xl border mb-4">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Camera size={18} className="text-yellow-500" /> Foto de Perfil
        </h2>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-yellow-100 flex items-center justify-center border-2 border-yellow-200">
              {form.image ? (
                <img
                  src={form.image}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-yellow-600">
                  {form.name?.[0]?.toUpperCase() || "U"}
                </span>
              )}
            </div>
            {uploadingPhoto && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                <Loader2 size={20} className="text-white animate-spin" />
              </div>
            )}
          </div>
          <div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="text-sm font-medium text-yellow-600 hover:text-yellow-700 disabled:opacity-50"
            >
              {uploadingPhoto ? "A carregar..." : "Alterar foto"}
            </button>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG ou WebP. Máximo 2MB.</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Personal Data Section */}
      <div className="bg-white p-6 rounded-xl border mb-4">
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
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">O email não pode ser alterado</p>
          </div>
          <Input
            label="Telemóvel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+258 84/85/86/87 XXXXXXX"
            icon={<Phone size={16} />}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Nascimento
            </label>
            <div className="relative">
              <input
                type="date"
                value={form.birthdate}
                onChange={(e) => setForm({ ...form, birthdate: e.target.value })}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18))
                  .toISOString()
                  .split("T")[0]}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all"
              />
            </div>
            {age !== null && (
              <p className="text-xs text-gray-400 mt-1">
                {age} anos de idade
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Location Section */}
      <div className="bg-white p-6 rounded-xl border mb-4">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin size={18} className="text-yellow-500" /> Localização
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Província</label>
            <select
              value={form.province}
              onChange={(e) => setForm({ ...form, province: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all bg-white"
            >
              <option value="">Seleccione a província</option>
              {PROVINCES_MZ.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Cidade / Distrito"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            placeholder="Ex: Matola, Beira, Nampula..."
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="sticky bottom-20 lg:bottom-4">
        <Button onClick={handleSave} loading={loading} fullWidth size="lg">
          {saved ? (
            <>
              <Check size={18} className="mr-2" /> Guardado!
            </>
          ) : (
            <>
              <Save size={18} className="mr-2" /> Guardar Alterações
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
