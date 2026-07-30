"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/settings/public")
      .then((r) => r.json())
      .then((d) => setSettings(d.settings || {}))
      .catch(() => {});
  }, []);

  const email = settings.support_email || "suporte@yuniexpress.co.mz";
  const phone = settings.support_phone || "+258 84 000 0000";
  const storeName = settings.store_name || "YuniExpress";

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              {settings.store_logo ? (
                <img src={settings.store_logo} alt={storeName} className="h-8 object-contain brightness-0 invert" />
              ) : (
                <img src="/icons/icon-192x192.png" alt={storeName} className="w-8 h-8 rounded-lg" />
              )}
              <span className="text-lg font-bold text-white">
                <span className="text-yellow-500">{storeName.slice(0, 4)}</span>{storeName.slice(4)}
              </span>
            </div>
            <p className="text-xs text-yellow-400 font-medium mb-3 italic">
              {settings.store_tagline || "Compre Global, Pague Local"}
            </p>
            <p className="text-sm text-gray-400 mb-4">
              O seu marketplace internacional favorito em Moçambique. Compre
              produtos do mundo inteiro pagando em Meticais.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <MapPin size={14} />
              <span>Maputo, Moçambique</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/categories" className="hover:text-yellow-500 transition-colors">Todas as Categorias</Link></li>
              <li><Link href="/search?sort=newest" className="hover:text-yellow-500 transition-colors">Novos Produtos</Link></li>
              <li><Link href="/search?sort=popular" className="hover:text-yellow-500 transition-colors">Mais Vendidos</Link></li>
              <li><Link href="/account/orders" className="hover:text-yellow-500 transition-colors">Rastrear Encomenda</Link></li>
              <li><Link href="/account" className="hover:text-yellow-500 transition-colors">Minha Conta</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Categorias</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/category/electronics" className="hover:text-yellow-500 transition-colors">Electrónica</Link></li>
              <li><Link href="/category/phones" className="hover:text-yellow-500 transition-colors">Telemóveis</Link></li>
              <li><Link href="/category/fashion-women" className="hover:text-yellow-500 transition-colors">Moda Feminina</Link></li>
              <li><Link href="/category/fashion-men" className="hover:text-yellow-500 transition-colors">Moda Masculina</Link></li>
              <li><Link href="/category/home" className="hover:text-yellow-500 transition-colors">Casa & Jardim</Link></li>
              <li><Link href="/category/beauty" className="hover:text-yellow-500 transition-colors">Beleza & Saúde</Link></li>
            </ul>
          </div>

          {/* Contact - reads from settings */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-yellow-500" />
                <a href={`mailto:${email}`} className="hover:text-yellow-500">
                  {email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-yellow-500" />
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-yellow-500">
                  {phone}
                </a>
              </li>
            </ul>
            <div className="mt-6">
              <h4 className="text-white text-sm font-medium mb-2">Métodos de Pagamento</h4>
              <div className="flex flex-wrap gap-2">
                <span className="bg-gray-800 px-3 py-1.5 rounded-lg text-xs font-medium">M-Pesa</span>
                <span className="bg-gray-800 px-3 py-1.5 rounded-lg text-xs font-medium">e-Mola</span>
                <span className="bg-gray-800 px-3 py-1.5 rounded-lg text-xs font-medium">Visa</span>
                <span className="bg-gray-800 px-3 py-1.5 rounded-lg text-xs font-medium">Mastercard</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} {storeName}. Todos os direitos reservados.</p>
          <p className="mt-2 md:mt-0">
            Feito com ❤️ em Moçambique
          </p>
        </div>
      </div>
    </footer>
  );
}
