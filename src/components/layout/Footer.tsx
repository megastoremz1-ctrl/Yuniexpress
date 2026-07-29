"use client";

import Link from "next/link";
import { Package, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/icons/icon-192x192.png"
                alt="YuniExpress"
                className="w-8 h-8 rounded-lg"
              />
              <span className="text-lg font-bold text-white">
                <span className="text-yellow-500">Yuni</span>Express
              </span>
            </div>
            <p className="text-xs text-yellow-400 font-medium mb-3 italic">
              Compre Global, Pague Local
            </p>
            <p className="text-sm text-gray-400 mb-4">
              O seu marketplace internacional favorito em Mocambique. Compre
              produtos do mundo inteiro pagando em Meticais.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <MapPin size={14} />
              <span>Maputo, Mocambique</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-yellow-500 transition-colors">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-yellow-500 transition-colors">
                  Centro de Ajuda
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-yellow-500 transition-colors">
                  Informação de Envio
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-yellow-500 transition-colors">
                  Devoluções
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-yellow-500 transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-yellow-500 transition-colors">
                  Termos e Condições
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Categorias</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/category/electronics" className="hover:text-yellow-500 transition-colors">
                  Electrónica
                </Link>
              </li>
              <li>
                <Link href="/category/fashion" className="hover:text-yellow-500 transition-colors">
                  Moda
                </Link>
              </li>
              <li>
                <Link href="/category/home" className="hover:text-yellow-500 transition-colors">
                  Casa & Jardim
                </Link>
              </li>
              <li>
                <Link href="/category/beauty" className="hover:text-yellow-500 transition-colors">
                  Beleza & Saúde
                </Link>
              </li>
              <li>
                <Link href="/category/phones" className="hover:text-yellow-500 transition-colors">
                  Telemóveis
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-yellow-500" />
                <a href="mailto:suporte@yuniexpress.co.mz" className="hover:text-yellow-500">
                  suporte@yuniexpress.co.mz
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-yellow-500" />
                <a href="tel:+258840000000" className="hover:text-yellow-500">
                  +258 84 000 0000
                </a>
              </li>
            </ul>
            <div className="mt-6">
              <h4 className="text-white text-sm font-medium mb-2">Métodos de Pagamento</h4>
              <div className="flex gap-2">
                <span className="bg-gray-800 px-3 py-1 rounded text-xs">M-Pesa</span>
                <span className="bg-gray-800 px-3 py-1 rounded text-xs">e-Mola</span>
                <span className="bg-gray-800 px-3 py-1 rounded text-xs">Mkesh</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} YuniExpress. Todos os direitos reservados.</p>
          <p className="mt-2 md:mt-0">
            Feito com amor em Mocambique
          </p>
        </div>
      </div>
    </footer>
  );
}
