"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  Save,
  RefreshCw,
  Image as ImageIcon,
  Globe,
  Percent,
  Bell,
  Store,
  Upload,
  X,
  CheckCircle2,
} from "lucide-react";

type Settings = Record<string, string>;

const DEFAULT_SETTINGS: Settings = {
  store_name: "YuniExpress",
  store_logo: "",
  store_tagline: "Compre Global, Pague Local",
  support_email: "suporte@yuniexpress.shop",
  support_phone: "+258 84 000 0000",
  default_margin_percent: "25",
  announcement_bar: "",
  announcement_active: "false",
  homepage_title: "Compras Internacionais em Meticais",
};

export default function AdminSettingsPage() {
  const [settings, setSettings] =
    useState<Settings>(DEFAULT_SETTINGS);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  /**
   * ============================================================
   * CARREGAR CONFIGURAÇÕES
   * ============================================================
   */

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(
        "/api/admin/settings",
        {
          method: "GET",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error ||
            "Erro ao carregar configurações"
        );
      }

      if (data?.settings) {
        setSettings((prev) => ({
          ...prev,
          ...data.settings,
        }));
      }
    } catch (error) {
      console.error(
        "Erro ao carregar configurações:",
        error
      );

      toast.error(
        "Não foi possível carregar as configurações"
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * ============================================================
   * ALTERAR CONFIGURAÇÃO
   * ============================================================
   */

  const updateSetting = (
    key: string,
    value: string
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /**
   * ============================================================
   * GUARDAR CONFIGURAÇÕES
   * ============================================================
   */

  const handleSave = async () => {
    if (saving) return;

    setSaving(true);

    try {
      console.log(
        "A guardar configurações:",
        settings
      );

      const res = await fetch(
        "/api/admin/settings",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Accept:
              "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            settings,
          }),
        }
      );

      const text = await res.text();

      let data: any = {};

      try {
        data = text
          ? JSON.parse(text)
          : {};
      } catch {
        data = {
          error:
            text ||
            "Resposta inválida do servidor",
        };
      }

      console.log(
        "Resposta do servidor:",
        {
          status: res.status,
          data,
        }
      );

      if (
        !res.ok ||
        data.success !== true
      ) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Erro ao guardar configurações"
        );
      }

      if (data.settings) {
        setSettings(data.settings);
      }

      toast.success(
        "Configurações guardadas com sucesso!"
      );
    } catch (error: unknown) {
      console.error(
        "Erro ao guardar configurações:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Erro ao guardar configurações";

      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  /**
   * ============================================================
   * UPLOAD DO LOGO
   * ============================================================
   */

  const handleLogoUpload = async (
    file: File
  ) => {
    if (uploadingLogo) return;

    /**
     * Validar tipo
     */

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Tipo de imagem não suportado. Use JPG, PNG, WebP, GIF ou SVG."
      );

      return;
    }

    /**
     * Limite de 5 MB
     */

    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        "A imagem é muito grande. O máximo permitido é 5MB."
      );

      return;
    }

    setUploadingLogo(true);
    setLogoError(false);

    const toastId =
      toast.loading(
        "A carregar logo..."
      );

    try {
      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      formData.append(
        "purpose",
        "logo"
      );

      const res = await fetch(
        "/api/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const text =
        await res.text();

      let data: any = {};

      try {
        data = text
          ? JSON.parse(text)
          : {};
      } catch {
        data = {
          error:
            text ||
            "Resposta inválida do servidor",
        };
      }

      console.log(
        "Resposta upload logo:",
        {
          status: res.status,
          data,
        }
      );

      if (
        !res.ok ||
        !data.success ||
        !data.url
      ) {
        throw new Error(
          data?.error ||
            "Erro ao carregar logo"
        );
      }

      /**
       * Guardar URL no estado imediatamente.
       *
       * A imagem NÃO é guardada no Prisma
       * como Base64.
       *
       * O Prisma recebe apenas:
       *
       * https://assets.yuniexpress.shop/...
       */

      setSettings((prev) => ({
        ...prev,
        store_logo: data.url,
      }));

      setLogoError(false);

      toast.dismiss(toastId);

      toast.success(
        "Logo carregado com sucesso!"
      );
    } catch (error: unknown) {
      console.error(
        "Erro no upload do logo:",
        error
      );

      toast.dismiss(toastId);

      const message =
        error instanceof Error
          ? error.message
          : "Erro ao carregar logo";

      toast.error(message);
    } finally {
      setUploadingLogo(false);

      /**
       * Permite selecionar novamente
       * o mesmo ficheiro.
       */

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }
    }
  };

  /**
   * ============================================================
   * REMOVER LOGO
   * ============================================================
   *
   * Apenas remove a URL da configuração.
   *
   * O ficheiro físico continua no R2.
   * Isso evita apagar acidentalmente um
   * objeto que possa estar a ser utilizado
   * noutro local.
   */

  const handleRemoveLogo = () => {
    setSettings((prev) => ({
      ...prev,
      store_logo: "",
    }));

    setLogoError(false);

    toast.success(
      "Logo removido. Clique em Guardar para confirmar."
    );
  };

  /**
   * ============================================================
   * SINCRONIZAÇÃO
   * ============================================================
   */

  const handleSyncNow = async () => {
    if (syncing) return;

    setSyncing(true);

    try {
      const res = await fetch(
        "/api/admin/sync",
        {
          method: "POST",
        }
      );

      const data =
        await res.json();

      if (
        res.ok &&
        data.success
      ) {
        toast.success(
          `${data.message} Total: ${data.totalProducts} produtos.`
        );
      } else {
        toast.error(
          data.error ||
            "Erro na sincronização"
        );
      }
    } catch (error) {
      console.error(
        "Erro na sincronização:",
        error
      );

      toast.error(
        "Erro ao iniciar sincronização"
      );
    } finally {
      setSyncing(false);
    }
  };

  /**
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(
          (item) => (
            <div
              key={item}
              className="h-48 bg-white rounded-xl animate-pulse"
            />
          )
        )}
      </div>
    );
  }

  /**
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <div className="pb-24">
      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Configurações
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Estas configurações reflectem
            directamente na loja
          </p>
        </div>

        <Button
          onClick={handleSave}
          loading={saving}
          size="lg"
        >
          <Save
            size={16}
            className="mr-2"
          />

          Guardar Tudo
        </Button>
      </div>

      <div className="space-y-6">

        {/* =================================================== */}
        {/* IDENTIDADE DA LOJA */}
        {/* =================================================== */}

        <div className="bg-white p-6 rounded-xl border">
          <div className="flex items-center gap-2 mb-6">
            <Store
              size={20}
              className="text-yellow-500"
            />

            <h2 className="text-lg font-semibold text-gray-900">
              Identidade da Loja
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Nome */}

            <Input
              label="Nome da Loja"
              value={
                settings.store_name
              }
              onChange={(e) =>
                updateSetting(
                  "store_name",
                  e.target.value
                )
              }
              placeholder="YuniExpress"
            />

            {/* Tagline */}

            <Input
              label="Tagline / Slogan"
              value={
                settings.store_tagline
              }
              onChange={(e) =>
                updateSetting(
                  "store_tagline",
                  e.target.value
                )
              }
              placeholder="Compre Global, Pague Local"
            />

            {/* ================================================= */}
            {/* LOGO */}
            {/* ================================================= */}

            <div className="md:col-span-2">

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo da Loja
              </label>

              <div className="flex flex-col sm:flex-row gap-3">

                <div className="flex-1">
                  <input
                    type="text"
                    value={
                      settings.store_logo
                    }
                    onChange={(e) => {
                      setLogoError(false);

                      updateSetting(
                        "store_logo",
                        e.target.value
                      );
                    }}
                    placeholder="URL do logo ou carregue uma imagem..."
                    className="w-full px-3 py-2.5 border rounded-lg text-sm focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none"
                  />
                </div>

                {/* Upload */}

                <label
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    uploadingLogo
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
                  }`}
                >
                  <input
                    ref={
                      fileInputRef
                    }
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                    className="hidden"
                    disabled={
                      uploadingLogo
                    }
                    onChange={(
                      event
                    ) => {
                      const file =
                        event.target.files?.[0];

                      if (file) {
                        handleLogoUpload(
                          file
                        );
                      }
                    }}
                  />

                  {uploadingLogo ? (
                    <RefreshCw
                      size={15}
                      className="animate-spin"
                    />
                  ) : (
                    <Upload
                      size={15}
                    />
                  )}

                  {uploadingLogo
                    ? "A carregar..."
                    : "Upload"}
                </label>
              </div>

              {/* ================================================= */}
              {/* PREVIEW */}
              {/* ================================================= */}

              {settings.store_logo && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl border">

                  <div className="flex items-center justify-between mb-3">

                    <div className="flex items-center gap-2">
                      <ImageIcon
                        size={16}
                        className="text-gray-500"
                      />

                      <p className="text-xs font-medium text-gray-600">
                        Preview do Logo
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={
                        handleRemoveLogo
                      }
                      className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                    >
                      <X
                        size={14}
                      />

                      Remover
                    </button>
                  </div>

                  <div className="min-h-[100px] flex items-center justify-center bg-white rounded-lg border border-gray-200 p-5">

                    {!logoError ? (
                      <img
                        src={
                          settings.store_logo
                        }
                        alt="Logo da YuniExpress"
                        className="max-h-20 max-w-[320px] w-auto object-contain"
                        loading="eager"
                        decoding="async"
                        onLoad={() => {
                          console.log(
                            "Logo carregado:",
                            settings.store_logo
                          );

                          setLogoError(
                            false
                          );
                        }}
                        onError={() => {
                          console.error(
                            "Erro ao visualizar logo:",
                            settings.store_logo
                          );

                          setLogoError(
                            true
                          );
                        }}
                      />
                    ) : (
                      <div className="text-center">

                        <div className="flex justify-center mb-2">
                          <X
                            size={24}
                            className="text-red-400"
                          />
                        </div>

                        <p className="text-sm font-medium text-red-500">
                          Não foi possível visualizar a imagem
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          Verifique se a URL do R2 está acessível.
                        </p>

                      </div>
                    )}

                  </div>

                  {/* URL */}

                  <div className="mt-3">

                    <p className="text-[11px] text-gray-400 mb-1">
                      URL armazenada:
                    </p>

                    <p className="text-[11px] text-gray-500 break-all bg-white border rounded-md p-2">
                      {
                        settings.store_logo
                      }
                    </p>

                  </div>

                  {/* Status */}

                  {!logoError && (
                    <div className="flex items-center gap-1.5 mt-3 text-xs text-green-600">
                      <CheckCircle2
                        size={14}
                      />

                      Logo acessível
                    </div>
                  )}

                </div>
              )}

              {!settings.store_logo && (
                <div className="mt-4 p-6 bg-gray-50 rounded-xl border border-dashed text-center">
                  <ImageIcon
                    size={28}
                    className="mx-auto text-gray-300 mb-2"
                  />

                  <p className="text-sm text-gray-500">
                    Nenhum logo configurado
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    Carregue uma imagem ou cole uma URL.
                  </p>
                </div>
              )}

            </div>

            {/* Homepage SEO */}

            <Input
              label="Título da Homepage (SEO)"
              value={
                settings.homepage_title
              }
              onChange={(e) =>
                updateSetting(
                  "homepage_title",
                  e.target.value
                )
              }
              placeholder="Compras Internacionais em Meticais"
            />

          </div>
        </div>

        {/* =================================================== */}
        {/* BARRA DE ANÚNCIO */}
        {/* =================================================== */}

        <div className="bg-white p-6 rounded-xl border">

          <div className="flex items-center gap-2 mb-4">
            <Bell
              size={20}
              className="text-yellow-500"
            />

            <h2 className="text-lg font-semibold text-gray-900">
              Barra de Anúncio
            </h2>
          </div>

          <p className="text-sm text-gray-500 mb-4">
            Mensagem que aparece no topo
            do site.
          </p>

          <div className="space-y-4">

            <Input
              label="Texto do anúncio"
              value={
                settings.announcement_bar
              }
              onChange={(e) =>
                updateSetting(
                  "announcement_bar",
                  e.target.value
                )
              }
              placeholder="🎉 Envio grátis em todas as encomendas!"
            />

            <label className="flex items-center gap-3 cursor-pointer">

              <input
                type="checkbox"
                checked={
                  settings.announcement_active ===
                  "true"
                }
                onChange={(e) =>
                  updateSetting(
                    "announcement_active",
                    e.target.checked
                      ? "true"
                      : "false"
                  )
                }
                className="w-5 h-5 rounded text-yellow-500 focus:ring-yellow-500"
              />

              <span className="text-sm font-medium text-gray-700">
                Activar barra de anúncio
              </span>

            </label>

          </div>
        </div>

        {/* =================================================== */}
        {/* PREÇOS */}
        {/* =================================================== */}

        <div className="bg-white p-6 rounded-xl border">

          <div className="flex items-center gap-2 mb-4">

            <Percent
              size={20}
              className="text-yellow-500"
            />

            <h2 className="text-lg font-semibold text-gray-900">
              Preços & Margem
            </h2>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>

              <Input
                label="Margem de lucro padrão (%)"
                type="number"
                min="0"
                step="0.1"
                value={
                  settings.default_margin_percent
                }
                onChange={(e) =>
                  updateSetting(
                    "default_margin_percent",
                    e.target.value
                  )
                }
              />

              <p className="text-xs text-gray-500 mt-1">
                Aplicada automaticamente sobre o preço USD convertido para MZN.
              </p>

            </div>

            <div className="flex items-end">

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg w-full">

                <p className="text-sm font-medium text-yellow-800">
                  Fórmula do preço:
                </p>

                <p className="text-xs text-yellow-700 mt-1">
                  Preço USD × Taxa Câmbio × (1 +{" "}
                  {settings.default_margin_percent}
                  %) = Preço MT
                </p>

              </div>

            </div>

          </div>
        </div>

        {/* =================================================== */}
        {/* CONTACTO */}
        {/* =================================================== */}

        <div className="bg-white p-6 rounded-xl border">

          <div className="flex items-center gap-2 mb-4">

            <Globe
              size={20}
              className="text-yellow-500"
            />

            <h2 className="text-lg font-semibold text-gray-900">
              Contacto & Suporte
            </h2>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <Input
              label="Email de suporte"
              type="email"
              value={
                settings.support_email
              }
              onChange={(e) =>
                updateSetting(
                  "support_email",
                  e.target.value
                )
              }
            />

            <Input
              label="Telefone de suporte"
              value={
                settings.support_phone
              }
              onChange={(e) =>
                updateSetting(
                  "support_phone",
                  e.target.value
                )
              }
            />

          </div>
        </div>

        {/* =================================================== */}
        {/* SINCRONIZAÇÃO */}
        {/* =================================================== */}

        <div className="bg-white p-6 rounded-xl border">

          <div className="flex items-center gap-2 mb-4">

            <RefreshCw
              size={20}
              className="text-yellow-500"
            />

            <h2 className="text-lg font-semibold text-gray-900">
              Sincronização
            </h2>

          </div>

          <p className="text-sm text-gray-500 mb-4">
            O sistema sincroniza produtos
            da AliExpress automaticamente.
            Pode forçar manualmente abaixo.
          </p>

          <Button
            onClick={
              handleSyncNow
            }
            loading={syncing}
            variant="outline"
          >
            <RefreshCw
              size={16}
              className="mr-2"
            />

            Sincronizar Agora
          </Button>

        </div>

      </div>

      {/* ===================================================== */}
      {/* FLOATING SAVE */}
      {/* ===================================================== */}

      <div className="fixed bottom-6 right-6 z-40">

        <Button
          onClick={handleSave}
          loading={saving}
          size="lg"
          className="shadow-xl"
        >
          <Save
            size={16}
            className="mr-2"
          />

          Guardar
        </Button>

      </div>
    </div>
  );
}