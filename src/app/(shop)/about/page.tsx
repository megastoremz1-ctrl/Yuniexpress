import { Package, Globe, Shield, HeadphonesIcon } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Sobre a YuniExpress</h1>

      <div className="bg-white p-6 rounded-xl border mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Compre Global, Pague Local</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          A YuniExpress é o marketplace internacional de Moçambique. Trazemos milhares de produtos do mundo inteiro directamente até si, com preços em Meticais e pagamento pelos métodos que já conhece — M-Pesa, e-Mola ou cartão Visa/Mastercard.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed mt-3">
          A nossa missão é tornar as compras internacionais acessíveis a todos os moçambicanos, eliminando as barreiras de idioma, moeda e métodos de pagamento.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border">
          <Globe size={24} className="text-yellow-500 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">Produtos Globais</h3>
          <p className="text-xs text-gray-600">Milhares de produtos de todo o mundo, actualizados diariamente.</p>
        </div>
        <div className="bg-white p-5 rounded-xl border">
          <Shield size={24} className="text-blue-500 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">Pagamento Seguro</h3>
          <p className="text-xs text-gray-600">M-Pesa, e-Mola e Visa/Mastercard com protecção total.</p>
        </div>
        <div className="bg-white p-5 rounded-xl border">
          <Package size={24} className="text-green-500 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">Entrega em MZ</h3>
          <p className="text-xs text-gray-600">Enviamos para todo o território de Moçambique.</p>
        </div>
        <div className="bg-white p-5 rounded-xl border">
          <HeadphonesIcon size={24} className="text-purple-500 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">Suporte Local</h3>
          <p className="text-xs text-gray-600">Equipa de suporte em português, disponível via WhatsApp.</p>
        </div>
      </div>
    </div>
  );
}
