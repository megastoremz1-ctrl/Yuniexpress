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
  const phone = settings.support_phone || "+258 87 100 2255";
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
              <li><Link href="/help" className="hover:text-yellow-500 transition-colors">Centro de Ajuda</Link></li>
              <li><Link href="/about" className="hover:text-yellow-500 transition-colors">Sobre Nós</Link></li>
              <li><Link href="/terms" className="hover:text-yellow-500 transition-colors">Termos e Condições</Link></li>
              <li><Link href="/privacy" className="hover:text-yellow-500 transition-colors">Política de Privacidade</Link></li>
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

            {/* Social Media */}
            <div className="mt-5">
              <h4 className="text-white text-sm font-medium mb-3">Siga-nos</h4>
              <div className="flex gap-3">
                <a href="https://facebook.com/yuniexpress" target="_blank" rel="noopener" className="w-9 h-9 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://instagram.com/yuniexpress" target="_blank" rel="noopener" className="w-9 h-9 bg-gray-800 hover:bg-pink-600 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="https://wa.me/258871002255" target="_blank" rel="noopener" className="w-9 h-9 bg-gray-800 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
                <a href="https://tiktok.com/@yuniexpress" target="_blank" rel="noopener" className="w-9 h-9 bg-gray-800 hover:bg-black rounded-full flex items-center justify-center transition-colors border border-gray-700">
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.88 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .56.04.82.11V9.4a6.36 6.36 0 00-.82-.05A6.34 6.34 0 003.15 15.7a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.22a8.16 8.16 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.65z"/></svg>
                </a>
              </div>
            </div>

            <div className="mt-5">
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
