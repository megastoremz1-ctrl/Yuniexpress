"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  Image as ImageIcon,
  Loader2,
  Mail,
  Megaphone,
  Monitor,
  Save,
  Upload,
  X,
} from "lucide-react";

type UploadResponse = {
  success?: boolean;
  url?: string;
  error?: string;
};

export default function NewCampaignPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [image, setImage] = useState("");
  const [imageUploading, setImageUploading] = useState(false);

  const [buttonText, setButtonText] = useState("");
  const [buttonLink, setButtonLink] = useState("");

  const [showBanner, setShowBanner] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const [sendPush, setSendPush] = useState(false);

  const [active, setActive] = useState(true);

  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  const [saving, setSaving] = useState(false);

  /**
   * ==========================================================
   * UPLOAD PARA R2
   * ==========================================================
   */
  const handleImageUpload = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem válida.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5 MB.");
      event.target.value = "";
      return;
    }

    try {
      setImageUploading(true);

      const formData = new FormData();

      formData.append("file", file);
      formData.append("purpose", "campaign");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data: UploadResponse =
        await response.json();

      if (!response.ok || !data.url) {
        throw new Error(
          data.error ||
            "Não foi possível carregar a imagem."
        );
      }

      setImage(data.url);

      toast.success("Imagem carregada com sucesso!");
    } catch (error) {
      console.error(
        "Campaign image upload error:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao carregar imagem."
      );
    } finally {
      setImageUploading(false);
      event.target.value = "";
    }
  };

  /**
   * ==========================================================
   * REMOVER IMAGEM
   * ==========================================================
   */
  const removeImage = () => {
    setImage("");
  };

  /**
   * ==========================================================
   * CRIAR CAMPANHA
   * ==========================================================
   */
  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!title.trim()) {
      toast.error(
        "Digite o título da campanha."
      );
      return;
    }

    if (!description.trim()) {
      toast.error(
        "Digite a descrição da campanha."
      );
      return;
    }

    if (
      startsAt &&
      endsAt &&
      new Date(endsAt) <
        new Date(startsAt)
    ) {
      toast.error(
        "A data de fim não pode ser anterior à data de início."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        "/api/admin/marketing/campaigns",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title.trim(),
            description:
              description.trim(),

            image: image || null,

            buttonText:
              buttonText.trim() || null,

            buttonLink:
              buttonLink.trim() || null,

            showBanner,
            showPopup,
            sendEmail,
            sendPush,

            active,

            startsAt:
              startsAt || null,

            endsAt:
              endsAt || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Não foi possível criar a campanha."
        );
      }

      toast.success(
        "Campanha criada com sucesso!"
      );

      router.push(
        "/admin/marketing/campaigns"
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Create campaign error:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao criar campanha."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* ======================================================
          HEADER
      ====================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/admin/marketing/campaigns"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition"
          >
            <ArrowLeft size={16} />
            Voltar para Campanhas
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Megaphone
                size={22}
                className="text-yellow-600"
              />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Nova Campanha
              </h1>

              <p className="text-gray-500 mt-1">
                Crie uma nova campanha
                promocional para a YuniExpress.
              </p>
            </div>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* ====================================================
            INFORMAÇÕES PRINCIPAIS
        ==================================================== */}
        <section className="bg-white border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Megaphone
              size={20}
              className="text-yellow-500"
            />

            <h2 className="text-lg font-semibold">
              Informações da Campanha
            </h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Ex: Grande Promoção de Agosto"
                maxLength={150}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
              />

              <p className="text-xs text-gray-400 mt-1">
                {title.length}/150
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição *
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                placeholder="Descreva a promoção ou campanha..."
                rows={5}
                maxLength={1000}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none resize-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
              />

              <p className="text-xs text-gray-400 mt-1">
                {description.length}/1000
              </p>
            </div>
          </div>
        </section>

        {/* ====================================================
            IMAGEM
        ==================================================== */}
        <section className="bg-white border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <ImageIcon
              size={20}
              className="text-yellow-500"
            />

            <h2 className="text-lg font-semibold">
              Imagem da Campanha
            </h2>
          </div>

          <p className="text-sm text-gray-500 mb-5">
            Esta imagem será armazenada no
            Cloudflare R2.
          </p>

          {!image ? (
            <label
              className={`border-2 border-dashed rounded-2xl min-h-52 flex flex-col items-center justify-center transition ${
                imageUploading
                  ? "border-yellow-300 bg-yellow-50 cursor-wait"
                  : "border-gray-200 hover:border-yellow-400 hover:bg-yellow-50/30 cursor-pointer"
              }`}
            >
              {imageUploading ? (
                <>
                  <Loader2
                    size={36}
                    className="text-yellow-500 animate-spin mb-3"
                  />

                  <p className="font-medium">
                    A carregar imagem...
                  </p>
                </>
              ) : (
                <>
                  <Upload
                    size={36}
                    className="text-gray-400 mb-3"
                  />

                  <p className="font-medium text-gray-700">
                    Clique para carregar uma imagem
                  </p>

                  <p className="text-sm text-gray-400 mt-1">
                    JPG, PNG, WebP ou GIF · Máx. 5 MB
                  </p>
                </>
              )}

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={
                  handleImageUpload
                }
                disabled={imageUploading}
                className="hidden"
              />
            </label>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border bg-gray-50">
              <img
                src={image}
                alt="Preview da campanha"
                className="w-full max-h-[420px] object-contain"
              />

              <button
                type="button"
                onClick={removeImage}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black transition"
                title="Remover imagem"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </section>

        {/* ====================================================
            BOTÃO
        ==================================================== */}
        <section className="bg-white border rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-5">
            Botão da Campanha
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Texto do botão
              </label>

              <input
                type="text"
                value={buttonText}
                onChange={(event) =>
                  setButtonText(
                    event.target.value
                  )
                }
                placeholder="Ex: Comprar Agora"
                maxLength={50}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link do botão
              </label>

              <input
                type="text"
                value={buttonLink}
                onChange={(event) =>
                  setButtonLink(
                    event.target.value
                  )
                }
                placeholder="/search?q=iphone"
                maxLength={500}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
              />
            </div>
          </div>
        </section>

        {/* ====================================================
            CANAIS
        ==================================================== */}
        <section className="bg-white border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <Monitor
              size={20}
              className="text-yellow-500"
            />

            <h2 className="text-lg font-semibold">
              Canais de Divulgação
            </h2>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            Escolha onde esta campanha será
            apresentada.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* BANNER */}
            <ChannelCard
              icon={
                <Monitor
                  size={21}
                />
              }
              title="Banner"
              description="Mostrar a campanha no banner da loja."
              checked={showBanner}
              onChange={setShowBanner}
            />

            {/* POPUP */}
            <ChannelCard
              icon={
                <Megaphone
                  size={21}
                />
              }
              title="Popup"
              description="Mostrar a campanha como popup."
              checked={showPopup}
              onChange={setShowPopup}
            />

            {/* EMAIL */}
            <ChannelCard
              icon={
                <Mail size={21} />
              }
              title="Email"
              description="Preparar esta campanha para envio por email."
              checked={sendEmail}
              onChange={setSendEmail}
            />

            {/* PUSH */}
            <ChannelCard
              icon={
                <Bell size={21} />
              }
              title="Push"
              description="Preparar esta campanha para notificações push."
              checked={sendPush}
              onChange={setSendPush}
            />
          </div>
        </section>

        {/* ====================================================
            AGENDAMENTO
        ==================================================== */}
        <section className="bg-white border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays
              size={20}
              className="text-yellow-500"
            />

            <h2 className="text-lg font-semibold">
              Agendamento
            </h2>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            Defina quando a campanha deverá
            começar e terminar.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de início
              </label>

              <input
                type="datetime-local"
                value={startsAt}
                onChange={(event) =>
                  setStartsAt(
                    event.target.value
                  )
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de fim
              </label>

              <input
                type="datetime-local"
                value={endsAt}
                onChange={(event) =>
                  setEndsAt(
                    event.target.value
                  )
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
              />
            </div>
          </div>
        </section>

        {/* ====================================================
            ESTADO
        ==================================================== */}
        <section className="bg-white border rounded-2xl p-6">
          <div className="flex items-center justify-between gap-5">
            <div>
              <h2 className="font-semibold text-gray-900">
                Campanha ativa
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Quando desativada, a campanha
                permanece guardada mas não será
                considerada ativa.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setActive(!active)
              }
              aria-pressed={active}
              className={`relative w-14 h-8 rounded-full transition-colors shrink-0 ${
                active
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  active
                    ? "translate-x-7"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </section>

        {/* ====================================================
            ACTIONS
        ==================================================== */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pb-8">
          <Link
            href="/admin/marketing/campaigns"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            disabled={
              saving ||
              imageUploading
            }
            className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-yellow-500 text-black font-semibold hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                A guardar...
              </>
            ) : (
              <>
                <Save size={18} />
                Criar Campanha
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

/**
 * ============================================================
 * CHANNEL CARD
 * ============================================================
 */
function ChannelCard({
  icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        onChange(!checked)
      }
      className={`text-left border rounded-2xl p-5 transition ${
        checked
          ? "border-yellow-400 bg-yellow-50/60"
          : "border-gray-200 bg-white hover:bg-gray-50"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            checked
              ? "bg-yellow-100 text-yellow-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {icon}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold text-gray-900">
              {title}
            </h3>

            <span
              className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                checked
                  ? "bg-yellow-500 border-yellow-500 text-black"
                  : "border-gray-300"
              }`}
            >
              {checked && (
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path d="M5 12l4 4L19 7" />
                </svg>
              )}
            </span>
          </div>

          <p className="text-sm text-gray-500 mt-1">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}