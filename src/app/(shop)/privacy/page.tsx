export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Política de Privacidade</h1>
      <div className="bg-white p-6 rounded-xl border prose prose-sm max-w-none">
        <p className="text-sm text-gray-500 mb-4">Última actualização: Julho 2026</p>

        <h2 className="text-lg font-semibold mt-6 mb-3">1. Informações que Recolhemos</h2>
        <p>A YuniExpress recolhe as seguintes informações quando utiliza os nossos serviços:</p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
          <li><strong>Dados pessoais:</strong> nome, email, número de telefone, endereço de entrega</li>
          <li><strong>Dados de pagamento:</strong> número de telefone M-Pesa/e-Mola (não guardamos dados de cartão)</li>
          <li><strong>Dados de navegação:</strong> pesquisas, produtos visualizados, histórico de compras</li>
          <li><strong>Dados técnicos:</strong> endereço IP, tipo de dispositivo, browser, localização aproximada</li>
        </ul>

        <h2 className="text-lg font-semibold mt-6 mb-3">2. Como Utilizamos os Seus Dados</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
          <li>Processar e entregar as suas encomendas</li>
          <li>Processar pagamentos via M-Pesa, e-Mola ou cartão</li>
          <li>Enviar actualizações sobre o estado das encomendas</li>
          <li>Personalizar a sua experiência de compras (recomendações)</li>
          <li>Enviar promoções e ofertas (com o seu consentimento)</li>
          <li>Melhorar os nossos serviços e prevenir fraudes</li>
        </ul>

        <h2 className="text-lg font-semibold mt-6 mb-3">3. Partilha de Dados</h2>
        <p className="text-sm text-gray-700">Partilhamos os seus dados apenas com:</p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
          <li><strong>Processadores de pagamento:</strong> ZumboPay (M-Pesa, e-Mola, Visa/Mastercard)</li>
          <li><strong>Fornecedores:</strong> AliExpress (para processar encomendas)</li>
          <li><strong>Serviços de entrega:</strong> para entregar as suas encomendas</li>
        </ul>
        <p className="text-sm text-gray-700 mt-2">Nunca vendemos os seus dados pessoais a terceiros.</p>

        <h2 className="text-lg font-semibold mt-6 mb-3">4. Segurança</h2>
        <p className="text-sm text-gray-700">Utilizamos encriptação SSL/TLS, autenticação segura e não armazenamos dados de cartão de crédito. Os pagamentos M-Pesa e e-Mola são processados directamente pela operadora.</p>

        <h2 className="text-lg font-semibold mt-6 mb-3">5. Cookies</h2>
        <p className="text-sm text-gray-700">Utilizamos cookies para manter a sua sessão, guardar o carrinho de compras, personalizar conteúdo e analisar o tráfego do site. Pode gerir as suas preferências de cookies a qualquer momento.</p>

        <h2 className="text-lg font-semibold mt-6 mb-3">6. Os Seus Direitos</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
          <li>Aceder aos seus dados pessoais</li>
          <li>Corrigir dados incorrectos</li>
          <li>Solicitar a eliminação dos seus dados</li>
          <li>Retirar o consentimento para comunicações</li>
          <li>Exportar os seus dados</li>
        </ul>

        <h2 className="text-lg font-semibold mt-6 mb-3">7. Contacto</h2>
        <p className="text-sm text-gray-700">Para questões sobre privacidade: <strong>suporte@yuniexpress.shop</strong> ou <strong>+258 87 100 2255</strong></p>

        <h2 className="text-lg font-semibold mt-6 mb-3">8. Alterações</h2>
        <p className="text-sm text-gray-700">Reservamos o direito de actualizar esta política. Notificaremos sobre alterações significativas por email ou notificação no site.</p>
      </div>
    </div>
  );
}
