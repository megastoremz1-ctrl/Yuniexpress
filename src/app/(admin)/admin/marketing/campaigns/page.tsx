"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Megaphone,
  Pencil,
  Trash2,
  CalendarDays,
  Mail,
  Bell,
  Image as ImageIcon,
  Monitor,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

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

function formatDate(date: string | null) {
  if (!date) return "Sem data";

  return new Intl.DateTimeFormat("pt-MZ", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}

function getCampaignStatus(campaign: Campaign) {
  const now = new Date();

  if (!campaign.active) {
    return {
      label: "Inativa",
      className: "bg-gray-100 text-gray-600",
    };
  }

  if (campaign.startsAt) {
    const start = new Date(campaign.startsAt);

    if (now < start) {
      return {
        label: "Agendada",
        className: "bg-blue-100 text-blue-700",
      };
    }
  }

  if (campaign.endsAt) {
    const end = new Date(campaign.endsAt);

    if (now > end) {
      return {
        label: "Expirada",
        className: "bg-red-100 text-red-700",
      };
    }
  }

  return {
    label: "Ativa",
    className: "bg-green-100 text-green-700",
  };
}

function ChannelBadge({
  icon: Icon,
  label,
  active,
}: {
  icon: typeof ImageIcon;
  label: string;
  active: boolean;
}) {
  if (!active) return null;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
      <Icon size={13} />
      {label}
    </span>
  );
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadCampaigns = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/admin/marketing/campaigns",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Erro ao carregar campanhas"
        );
      }

      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error("Erro ao carregar campanhas:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao carregar campanhas"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleDelete = async (campaign: Campaign) => {
    const confirmed = window.confirm(
      `Tem certeza que deseja eliminar a campanha "${campaign.title}"?`
    );

    if (!confirmed) return;

    try {
      setDeleting(campaign.id);

      const response = await fetch(
        `/api/admin/marketing/campaigns/${campaign.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Erro ao eliminar campanha"
        );
      }

      setCampaigns((current) =>
        current.filter(
          (item) => item.id !== campaign.id
        )
      );

      toast.success("Campanha eliminada com sucesso.");
    } catch (error) {
      console.error(
        "Erro ao eliminar campanha:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao eliminar campanha"
      );
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Campanhas
          </h1>

          <p className="mt-2 text-gray-500">
            Gerencie todas as campanhas promocionais da
            YuniExpress.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadCampaigns}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={
                loading ? "animate-spin" : ""
              }
            />

            Atualizar
          </button>

          <Link
            href="/admin/marketing/campaigns/new"
            className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 font-medium text-black transition hover:bg-yellow-400"
          >
            <Plus size={18} />
            Nova Campanha
          </Link>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-40 animate-pulse rounded-2xl border bg-white"
            />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && campaigns.length === 0 && (
        <div className="rounded-2xl border bg-white p-12 text-center">
          <Megaphone
            className="mx-auto mb-4 text-yellow-500"
            size={64}
          />

          <h2 className="text-xl font-semibold text-gray-900">
            Nenhuma campanha criada
          </h2>

          <p className="mt-2 text-gray-500">
            Clique em "Nova Campanha" para criar a
            primeira promoção.
          </p>

          <Link
            href="/admin/marketing/campaigns/new"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 font-medium text-black hover:bg-yellow-400"
          >
            <Plus size={18} />
            Criar primeira campanha
          </Link>
        </div>
      )}

      {/* Campaigns */}
      {!loading && campaigns.length > 0 && (
        <div className="space-y-4">
          {campaigns.map((campaign) => {
            const status =
              getCampaignStatus(campaign);

            return (
              <div
                key={campaign.id}
                className="overflow-hidden rounded-2xl border bg-white transition hover:shadow-md"
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Image */}
                  <div className="relative h-48 w-full shrink-0 bg-gray-100 lg:h-auto lg:w-64">
                    {campaign.image ? (
                      <img
                        src={campaign.image}
                        alt={campaign.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full min-h-48 items-center justify-center">
                        <Megaphone
                          size={48}
                          className="text-gray-300"
                        />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-semibold text-gray-900">
                            {campaign.title}
                          </h2>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </div>

                        <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                          {campaign.description}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 items-center gap-2">
                        <Link
                          href={`/admin/marketing/campaigns/${campaign.id}`}
                          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <Pencil size={15} />
                          Editar
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(campaign)
                          }
                          disabled={
                            deleting === campaign.id
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2
                            size={15}
                          />

                          {deleting ===
                          campaign.id
                            ? "A eliminar..."
                            : "Eliminar"}
                        </button>
                      </div>
                    </div>

                    {/* Channels */}
                    <div className="mt-5 flex flex-wrap gap-2">
                      <ChannelBadge
                        icon={ImageIcon}
                        label="Banner"
                        active={
                          campaign.showBanner
                        }
                      />

                      <ChannelBadge
                        icon={Monitor}
                        label="Popup"
                        active={
                          campaign.showPopup
                        }
                      />

                      <ChannelBadge
                        icon={Mail}
                        label="Email"
                        active={
                          campaign.sendEmail
                        }
                      />

                      <ChannelBadge
                        icon={Bell}
                        label="Push"
                        active={
                          campaign.sendPush
                        }
                      />

                      {!campaign.showBanner &&
                        !campaign.showPopup &&
                        !campaign.sendEmail &&
                        !campaign.sendPush && (
                          <span className="text-xs text-gray-400">
                            Nenhum canal configurado
                          </span>
                        )}
                    </div>

                    {/* Dates */}
                    <div className="mt-5 flex flex-col gap-2 text-xs text-gray-500 sm:flex-row sm:flex-wrap sm:gap-5">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={14} />

                        <span>
                          Início:{" "}
                          {formatDate(
                            campaign.startsAt
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <CalendarDays size={14} />

                        <span>
                          Fim:{" "}
                          {formatDate(
                            campaign.endsAt
                          )}
                        </span>
                      </div>

                      {campaign.buttonLink && (
                        <a
                          href={
                            campaign.buttonLink
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-yellow-600 hover:underline"
                        >
                          {campaign.buttonText ||
                            "Ver destino"}

                          <ExternalLink
                            size={12}
                          />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}