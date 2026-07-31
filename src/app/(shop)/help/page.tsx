import Link from "next/link";
import { HelpCircle, MessageCircle, Mail, Phone, Package, CreditCard, Truck, RotateCcw } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Centro de Ajuda</h1>

      {/* Contact */}
      <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-100 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">Precisa de Ajuda?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a href="https://wa.me/258871002255" target="_blank" className="flex items-center gap-2 p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow">
            <MessageCircle size={18} className="text-green-500" />
            <div>
              <p className="text-xs font-medium">WhatsApp</p>
              <p className="text-[10px] text-gray-500">87 100 2255</p>
            </div>
          </a>
          <a href="mailto:suporte@yuniexpress.shop" className="flex items-center gap-2 p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow">
            <Mail size={18} className="text-blue-500" />
            <div>
              <p className="text-xs font-medium">Email</p>
              <p className="text-[10px] text-gray-500">suporte@yuniexpress.shop</p>
            </div>
          </a>
          <a href="tel:+258871002255" className="flex items-center gap-2 p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow">
            <Phone size={18} className="text-purple-500" />
            <div>
              <p className="text-xs font-medium">Ligar</p>
              <p className="text-[10px] text-gray-500">+258 87 100 2255</p>
            </div>
          </a>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-xl border divide-y">
        <div className="p-5">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <HelpCircle size={18} className="text-yellow-500" /> Perguntas Frequentes
          </h2>
        </div>

        <details className="p-5">
          <summary className="font-medium text-sm cursor-pointer flex items-center gap-2">
            <Package size={14} className="text-blue-500" /> Quanto tempo demora a entrega?
          </summary>
          <p className="text-sm text-gray-600 mt-2 pl-6">O prazo estimado é de 15-45 dias úteis, dependendo do produto e da sua localização em Moçambique. Produtos Choice podem chegar mais rápido (10-20 dias).</p>
        </details>

        <details className="p-5">
          <summary className="font-medium text-sm cursor-pointer flex items-center gap-2">
            <CreditCard size={14} className="text-green-500" /> Como posso pagar?
          </summary>
          <p className="text-sm text-gray-600 mt-2 pl-6">Aceitamos M-Pesa (84/85), e-Mola (86/87) e cartões Visa/Mastercard. O pagamento M-Pesa e e-Mola é feito directamente no seu telemóvel (PIN). Cartão é processado com segurança 3D Secure.</p>
        </details>

        <details className="p-5">
          <summary className="font-medium text-sm cursor-pointer flex items-center gap-2">
            <Truck size={14} className="text-indigo-500" /> Para onde entregam?
          </summary>
          <p className="text-sm text-gray-600 mt-2 pl-6">Entregamos em todo o território de Moçambique. O envio internacional é incluído no preço do produto (Frete Grátis).</p>
        </details>

        <details className="p-5">
          <summary className="font-medium text-sm cursor-pointer flex items-center gap-2">
            <RotateCcw size={14} className="text-red-500" /> Posso devolver um produto?
          </summary>
          <p className="text-sm text-gray-600 mt-2 pl-6">Sim. Tem direito a reembolso se: o produto não chegar em 60 dias, estiver danificado, ou não corresponder à descrição. Contacte o nosso suporte até 15 dias após a recepção.</p>
        </details>
      </div>

      {/* Links */}
      <div className="mt-6 flex gap-3 text-sm">
        <Link href="/terms" className="text-yellow-600 hover:underline">Termos e Condições</Link>
        <Link href="/privacy" className="text-yellow-600 hover:underline">Política de Privacidade</Link>
      </div>
    </div>
  );
}
