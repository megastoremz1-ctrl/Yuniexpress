"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, Edit2, Image as ImageIcon, Upload, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface Banner {
  id: string;
  title: string | null;
  subtitle: string | null;
  image: string;
  link: string | null;
  order: number;
  active: boolean;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image: "",
    link: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/admin/banners");
      if (res.ok) {
        const data = await res.json();
        setBanners(data.banners || []);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo: 5MB");
      return;
    }

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("purpose", "banner");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setFormData({ ...formData, image: data.url });
        toast.success("Imagem carregada com sucesso!");
      } else {
        toast.error(data.error || "Erro ao carregar imagem");
      }
    } catch (error) {
      toast.error("Erro ao carregar imagem");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) {
      toast.error("Adicione uma imagem para o banner");
      return;
    }
    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Banner criado com sucesso!");
        setShowForm(false);
        setFormData({ title: "", subtitle: "", image: "", link: "" });
        fetchBanners();
      } else {
        toast.error("Erro ao criar banner");
      }
    } catch (error) {
      toast.error("Erro ao criar banner");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja eliminar este banner?")) return;
    try {
      const res = await fetch(`/api/admin/banners?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Banner eliminado");
        fetchBanners();
      }
    } catch {
      toast.error("Erro ao eliminar");
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    try {
      const res = await fetch("/api/admin/banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !active }),
      });
      if (res.ok) {
        toast.success(active ? "Banner desactivado" : "Banner activado");
        fetchBanners();
      }
    } catch {
      toast.error("Erro ao actualizar");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Banners</h1>
          <p className="text-sm text-gray-500 mt-1">Banners aparecem na homepage da loja</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={16} className="mr-2" />
          Novo Banner
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Criar Banner</h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          {/* Image Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagem do Banner *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-yellow-500 transition-colors">
              {formData.image ? (
                <div className="relative">
                  <img src={formData.image} alt="Preview" className="max-h-40 mx-auto rounded-lg" />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image: "" })}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Clique para carregar ou arraste uma imagem
                  </p>
                  <p className="text-xs text-gray-400">PNG, JPG, WebP (máx. 5MB)</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className={formData.image ? "hidden" : "absolute inset-0 opacity-0 cursor-pointer"}
              />
              {!formData.image && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  loading={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={14} className="mr-1" />
                  Carregar Imagem
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Ou cole um URL de imagem:
            </p>
            <input
              type="text"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://..."
              className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Título (opcional)"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Super Promoção"
            />
            <Input
              label="Subtítulo (opcional)"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="Ex: Até 50% de desconto"
            />
            <div className="md:col-span-2">
              <Input
                label="Link (opcional)"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="/category/electronics ou /search?q=promoção"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button type="submit" disabled={!formData.image}>Criar Banner</Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-white rounded-xl border overflow-hidden">
            <div className="relative h-40 bg-gray-100">
              <img
                src={banner.image}
                alt={banner.title || "Banner"}
                className="w-full h-full object-cover"
              />
              {!banner.active && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                    Inactivo
                  </span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-900">
                {banner.title || "Sem título"}
              </h3>
              {banner.subtitle && (
                <p className="text-sm text-gray-500 mt-0.5">{banner.subtitle}</p>
              )}
              <div className="flex justify-between items-center mt-3">
                <button
                  onClick={() => handleToggle(banner.id, banner.active)}
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    banner.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {banner.active ? "Activo" : "Inactivo"}
                </button>
                <button
                  onClick={() => handleDelete(banner.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {banners.length === 0 && !loading && (
          <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border">
            <ImageIcon size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="font-medium">Nenhum banner criado</p>
            <p className="text-sm mt-1">Crie banners para promover produtos na homepage</p>
          </div>
        )}
      </div>
    </div>
  );
}
