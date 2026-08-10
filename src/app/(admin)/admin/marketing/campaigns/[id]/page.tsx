"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Save,
  Megaphone,
  Image as ImageIcon,
  Monitor,
  Mail,
  Bell,
  CalendarDays,
  ExternalLink,
  Loader2,
} from "lucide-react";

type Campaign = {
  id: string;
  title: string;
  description: string;
  image: string | null;
  buttonText: string | null;
  buttonLink: string | null;

  showBanner: boolean;
  showPopup: boolean;
  sendEmail: boolean;
  sendPush: boolean;

  active: boolean;

  startsAt: string | null;
  endsAt: string | null;

  createdAt: string;
  updatedAt: string;
};

type FormData = {
  title: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;

  showBanner: boolean;
  showPopup: boolean;
  sendEmail: boolean;
  sendPush: boolean;

  active: boolean;

  startsAt: string;
  endsAt: string;
};

function formatDateForInput(
  value: string | null
) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");
  const hours = String(
    date.getHours()
  ).padStart(2, "0");
  const minutes = String(
    date.getMinutes()
  ).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function emptyForm(): FormData {
  return {
    title: "",
    description: "",
    image: "",
    buttonText: "",
    buttonLink: "",

    showBanner: false,
    showPopup: false,
    sendEmail: true,
    sendPush: false,

    active: true,

    startsAt: "",
    endsAt: "",
  };
}

export default function EditCampaignPage() {
  const params = useParams();
  const router = useRouter();

  const campaignId = String(
    params?.id || ""
  );

  const [campaign, setCampaign] =
    useState<Campaign | null>(null);

  const [form, setForm] =
    useState<FormData>(emptyForm());

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const loadCampaign = async () => {
    if (!campaignId) {
      toast.error(
        "ID da campanha não encontrado."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `/api/admin/marketing/campaigns/${campaignId}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Erro ao carregar campanha"
        );
      }

      const item: Campaign =
        data.campaign;

      setCampaign(item);

      setForm({
        title: item.title || "",
        description:
          item.description || "",
        image: item.image || "",
        buttonText:
          item.buttonText || "",
        buttonLink:
          item.buttonLink || "",

        showBanner:
          item.showBanner === true,
        showPopup:
          item.showPopup === true,
        sendEmail:
          item.sendEmail === true,
        sendPush:
          item.sendPush === true,

        active:
          item.active === true,

        startsAt:
          formatDateForInput(
            item.startsAt
          ),

        endsAt:
          formatDateForInput(
            item.endsAt
          ),
      });
    } catch (error) {
      console.error(
        "Erro ao carregar campanha:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao carregar campanha"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaign();
  }, [campaignId]);

  const updateField = <
    K extends keyof FormData
  >(
    key: K,
    value: FormData[K]
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSave = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!form.title.trim()) {
      toast.error(
        "O título da campanha é obrigatório."
      );
      return;
    }

    if (!form.description.trim()) {
      toast.error(
        "A descrição da campanha é obrigatória."
      );
      return;
    }

    if (
      form.startsAt &&
      form.endsAt
    ) {
      const start = new Date(
        form.startsAt
      );

      const end = new Date(
        form.endsAt
      );

      if (end < start) {
        toast.error(
          "A data de fim não pode ser anterior à data de início."
        );
        return;
      }
    }

    try {
      setSaving(true);

      const response = await fetch(
        `/api/admin/marketing/campaigns/${campaignId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            title: form.title.trim(),

            description:
              form.description.trim(),

            image:
              form.image.trim() || null,

            buttonText:
              form.buttonText.trim() ||
              null,

            buttonLink:
              form.buttonLink.trim() ||
              null,

            showBanner:
              form.showBanner,

            showPopup:
              form.showPopup,

            sendEmail:
              form.sendEmail,

            sendPush:
              form.sendPush,

            active:
              form.active,

            startsAt:
              form.startsAt || null,

            endsAt:
              form.endsAt || null,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Erro ao atualizar campanha"
        );
      }

      setCampaign(data.campaign);

      toast.success(
        "Campanha atualizada com sucesso!"
      );
    } catch (error) {
      console.error(
        "Erro ao guardar campanha:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao guardar campanha"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-gray-200" />

        <div className="h-20 animate-pulse rounded-2xl bg-white border" />

        <div className="h-[500px] animate-pulse rounded-2xl bg-white border" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="rounded-2xl border bg-white p-12 text-center">
        <Megaphone
          size={56}
          className="mx-auto mb-4 text-gray-300"
        />

        <h1 className="text-xl font-semibold text-gray-900">
          Campanha não encontrada
        </h1>

        <p className="mt-2 text-gray-500">
          A campanha que está a tentar
          editar não existe ou foi removida.
        </p>

        <Link
          href="/admin/marketing/campaigns"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 font-medium text-black hover:bg-yellow-400"
        >
          <ArrowLeft size={17} />
          Voltar às campanhas
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/marketing/campaigns"
            className="mb-3 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            Voltar às campanhas
          </Link>

          <h1 className="text-3xl font-bold text-gray-900">
            Editar campanha
          </h1>

          <p className="mt-2 text-gray-500">
            Altere o conteúdo, período e
            canais desta campanha.
          </p>
        </div>

        <button
          type="submit"
          form="campaign-form"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <Loader2
              size={18}
              className="animate-spin"
            />
          ) : (
            <Save size={18} />
          )}

          {saving
            ? "A guardar..."
            : "Guardar alterações"}
        </button>
      </div>

      <form
        id="campaign-form"
        onSubmit={handleSave}
        className="space-y-6"
      >
        {/* Basic information */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Informações da campanha
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Defina o conteúdo principal da
              promoção.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Título *
              </label>

              <input
                type="text"
                value={form.title}
                onChange={(event) =>
                  updateField(
                    "title",
                    event.target.value
                  )
                }
                placeholder="Ex: Mega Promoção de Agosto"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Descrição *
              </label>

              <textarea
                value={form.description}
                onChange={(event) =>
                  updateField(
                    "description",
                    event.target.value
                  )
                }
                rows={5}
                placeholder="Descreva a promoção..."
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
              />
            </div>
          </div>
        </section>

        {/* Image */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-yellow-100 p-2">
              <ImageIcon
                size={20}
                className="text-yellow-600"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Imagem
              </h2>

              <p className="text-sm text-gray-500">
                Imagem principal utilizada pela
                campanha.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                URL da imagem
              </label>

              <input
                type="url"
                value={form.image}
                onChange={(event) =>
                  updateField(
                    "image",
                    event.target.value
                  )
                }
                placeholder="https://..."
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
              />
            </div>

            {form.image && (
              <div className="overflow-hidden rounded-xl border bg-gray-50">
                <p className="border-b px-4 py-2 text-xs font-medium text-gray-500">
                  Pré-visualização
                </p>

                <div className="flex min-h-48 items-center justify-center p-4">
                  <img
                    src={form.image}
                    alt="Preview da campanha"
                    className="max-h-72 max-w-full rounded-lg object-contain"
                    onError={(event) => {
                      event.currentTarget.style.display =
                        "none";
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Button */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Botão da campanha
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Opcional. Pode direcionar o cliente
              para produtos, categorias ou outra
              página.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Texto do botão
              </label>

              <input
                type="text"
                value={form.buttonText}
                onChange={(event) =>
                  updateField(
                    "buttonText",
                    event.target.value
                  )
                }
                placeholder="Ex: Comprar agora"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Link do botão
              </label>

              <input
                type="text"
                value={form.buttonLink}
                onChange={(event) =>
                  updateField(
                    "buttonLink",
                    event.target.value
                  )
                }
                placeholder="/search?q=iphone"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
              />
            </div>
          </div>

          {form.buttonLink && (
            <a
              href={form.buttonLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-yellow-600 hover:underline"
            >
              Testar link
              <ExternalLink size={14} />
            </a>
          )}
        </section>

        {/* Channels */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Canais de marketing
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Escolha onde esta campanha será
              apresentada ou enviada.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Banner */}
            <button
              type="button"
              onClick={() =>
                updateField(
                  "showBanner",
                  !form.showBanner
                )
              }
              className={`flex items-start gap-4 rounded-2xl border p-5 text-left transition ${
                form.showBanner
                  ? "border-yellow-400 bg-yellow-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div
                className={`rounded-xl p-3 ${
                  form.showBanner
                    ? "bg-yellow-500 text-black"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <ImageIcon size={22} />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-gray-900">
                    Banner
                  </h3>

                  <div
                    className={`h-5 w-9 rounded-full p-0.5 transition ${
                      form.showBanner
                        ? "bg-yellow-500"
                        : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-full bg-white transition ${
                        form.showBanner
                          ? "translate-x-4"
                          : "translate-x-0"
                      }`}
                    />
                  </div>
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  Mostrar a campanha como banner
                  na loja.
                </p>
              </div>
            </button>

            {/* Popup */}
            <button
              type="button"
              onClick={() =>
                updateField(
                  "showPopup",
                  !form.showPopup
                )
              }
              className={`flex items-start gap-4 rounded-2xl border p-5 text-left transition ${
                form.showPopup
                  ? "border-yellow-400 bg-yellow-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div
                className={`rounded-xl p-3 ${
                  form.showPopup
                    ? "bg-yellow-500 text-black"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <Monitor size={22} />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-gray-900">
                    Popup
                  </h3>

                  <div
                    className={`h-5 w-9 rounded-full p-0.5 transition ${
                      form.showPopup
                        ? "bg-yellow-500"
                        : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-full bg-white transition ${
                        form.showPopup
                          ? "translate-x-4"
                          : "translate-x-0"
                      }`}
                    />
                  </div>
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  Mostrar a promoção num popup
                  para os visitantes.
                </p>
              </div>
            </button>

            {/* Email */}
            <button
              type="button"
              onClick={() =>
                updateField(
                  "sendEmail",
                  !form.sendEmail
                )
              }
              className={`flex items-start gap-4 rounded-2xl border p-5 text-left transition ${
                form.sendEmail
                  ? "border-yellow-400 bg-yellow-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div
                className={`rounded-xl p-3 ${
                  form.sendEmail
                    ? "bg-yellow-500 text-black"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <Mail size={22} />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-gray-900">
                    Email
                  </h3>

                  <div
                    className={`h-5 w-9 rounded-full p-0.5 transition ${
                      form.sendEmail
                        ? "bg-yellow-500"
                        : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-full bg-white transition ${
                        form.sendEmail
                          ? "translate-x-4"
                          : "translate-x-0"
                      }`}
                    />
                  </div>
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  Enviar esta campanha por email.
                </p>
              </div>
            </button>

            {/* Push */}
            <button
              type="button"
              onClick={() =>
                updateField(
                  "sendPush",
                  !form.sendPush
                )
              }
              className={`flex items-start gap-4 rounded-2xl border p-5 text-left transition ${
                form.sendPush
                  ? "border-yellow-400 bg-yellow-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div
                className={`rounded-xl p-3 ${
                  form.sendPush
                    ? "bg-yellow-500 text-black"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <Bell size={22} />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-gray-900">
                    Push
                  </h3>

                  <div
                    className={`h-5 w-9 rounded-full p-0.5 transition ${
                      form.sendPush
                        ? "bg-yellow-500"
                        : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-full bg-white transition ${
                        form.sendPush
                          ? "translate-x-4"
                          : "translate-x-0"
                      }`}
                    />
                  </div>
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  Enviar notificação push aos
                  clientes.
                </p>
              </div>
            </button>
          </div>
        </section>

        {/* Schedule */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-yellow-100 p-2">
              <CalendarDays
                size={20}
                className="text-yellow-600"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Agendamento
              </h2>

              <p className="text-sm text-gray-500">
                Defina quando a campanha estará
                disponível.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Data de início
              </label>

              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={(event) =>
                  updateField(
                    "startsAt",
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Data de fim
              </label>

              <input
                type="datetime-local"
                value={form.endsAt}
                onChange={(event) =>
                  updateField(
                    "endsAt",
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
              />
            </div>
          </div>
        </section>

        {/* Status */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <button
            type="button"
            onClick={() =>
              updateField(
                "active",
                !form.active
              )
            }
            className="flex w-full items-center justify-between gap-4 text-left"
          >
            <div>
              <h2 className="font-semibold text-gray-900">
                Campanha ativa
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Quando desativada, a campanha não
                será apresentada aos clientes.
              </p>
            </div>

            <div
              className={`h-6 w-11 shrink-0 rounded-full p-0.5 transition ${
                form.active
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
            >
              <div
                className={`h-5 w-5 rounded-full bg-white shadow-sm transition ${
                  form.active
                    ? "translate-x-5"
                    : "translate-x-0"
                }`}
              />
            </div>
          </button>
        </section>

        {/* Bottom save */}
        <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
          <Link
            href="/admin/marketing/campaigns"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-black hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <Save size={18} />
            )}

            {saving
              ? "A guardar..."
              : "Guardar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}