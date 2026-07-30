"use client";

import { useState, useEffect } from "react";

import toast from "react-hot-toast";
import { Plus, Trash2, Edit2, Image as ImageIcon } from "lucide-react";
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
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image: "",
    link: "",
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) {
      toast.error("URL da imagem é obrigatória");
      return;
    }
    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Banner criado com sucesso");
        setShowForm(false);
        setFormData({ title: "", subtitle: "", image: "", link: "" });
        fetchBanners();
      }
    } catch (error) {
      toast.error("Erro ao criar banner");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestão de Banners</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={16} className="mr-2" />
          Novo Banner
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border mb-6">
          <h2 className="text-lg font-semibold mb-4">Criar Banner</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Título (opcional)"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Título do banner"
            />
            <Input
              label="Subtítulo (opcional)"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="Subtítulo"
            />
            <Input
              label="URL da Imagem *"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://..."
              required
            />
            <Input
              label="Link (opcional)"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              placeholder="/category/electronics"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <Button type="submit">Criar Banner</Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowForm(false)}
            >
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
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    Inativo
                  </span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-900">
                {banner.title || "Sem título"}
              </h3>
              <p className="text-sm text-gray-500">{banner.subtitle}</p>
              <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-gray-400">Ordem: {banner.order}</span>
                <div className="flex gap-1">
                  <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                    <Edit2 size={14} />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {banners.length === 0 && !loading && (
          <div className="col-span-full text-center py-12 text-gray-500">
            <ImageIcon size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Nenhum banner criado</p>
          </div>
        )}
      </div>
    </div>
  );
}
