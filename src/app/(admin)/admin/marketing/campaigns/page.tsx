import Link from "next/link";
import { Plus, Megaphone } from "lucide-react";

export default function CampaignsPage() {
  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            Campanhas
          </h1>

          <p className="text-gray-500 mt-2">
            Gerencie todas as campanhas promocionais da YuniExpress.
          </p>
        </div>

        <Link
          href="/admin/marketing/campaigns/new"
          className="flex items-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 font-medium text-black hover:bg-yellow-400 transition"
        >
          <Plus size={18} />
          Nova Campanha
        </Link>

      </div>

      <div className="rounded-2xl border bg-white p-12 text-center">

        <Megaphone
          className="mx-auto mb-4 text-yellow-500"
          size={64}
        />

        <h2 className="text-xl font-semibold">
          Nenhuma campanha criada
        </h2>

        <p className="mt-2 text-gray-500">
          Clique em "Nova Campanha" para criar a primeira promoção.
        </p>

      </div>

    </div>
  );
}