import Link from "next/link";
import {
  Mail,
  Megaphone,
  TicketPercent,
  Bell,
  ImageIcon,
  PanelTop,
  BarChart3,
  ArrowRight,
} from "lucide-react";

const modules = [
  {
    title: "Campanhas",
    description: "Crie promoções e campanhas sazonais.",
    href: "/admin/marketing/campaigns",
    icon: Megaphone,
  },
  {
    title: "Emails",
    description: "Envie emails promocionais para os clientes.",
    href: "/admin/marketing/emails",
    icon: Mail,
  },
  {
    title: "Comunicações",
    description: "Avisos importantes dentro da plataforma.",
    href: "/admin/marketing/announcements",
    icon: Bell,
  },
  {
    title: "Cupões",
    description: "Crie códigos de desconto.",
    href: "/admin/marketing/coupons",
    icon: TicketPercent,
  },
  {
    title: "Banners",
    description: "Gerencie banners da página inicial.",
    href: "/admin/marketing/banners",
    icon: ImageIcon,
  },
  {
    title: "Popups",
    description: "Popups promocionais e de campanhas.",
    href: "/admin/marketing/popups",
    icon: PanelTop,
  },
  {
    title: "Estatísticas",
    description: "Visualize os resultados das campanhas.",
    href: "/admin/marketing/analytics",
    icon: BarChart3,
  },
];

export default function MarketingPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Marketing
        </h1>

        <p className="mt-2 text-gray-500">
          Gerencie campanhas, emails, cupões e promoções da YuniExpress.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-yellow-400 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100">
                <Icon className="h-6 w-6 text-yellow-600" />
              </div>

              <h2 className="mt-5 text-xl font-semibold">
                {item.title}
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                {item.description}
              </p>

              <div className="mt-6 flex items-center gap-2 font-medium text-yellow-600">
                Abrir
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}