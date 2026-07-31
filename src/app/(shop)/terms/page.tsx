export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Termos e Condições</h1>
      <div className="bg-white p-6 rounded-xl border prose prose-sm max-w-none">
        <p className="text-sm text-gray-500 mb-4">Última actualização: Julho 2026</p>

        <h2 className="text-lg font-semibold mt-6 mb-3">1. Sobre a YuniExpress</h2>
        <p className="text-sm text-gray-700">A YuniExpress é um marketplace online que opera em Moçambique, permitindo aos clientes comprar produtos internacionais com preços em Meticais (MZN) e pagamento através de métodos locais (M-Pesa, e-Mola, Visa/Mastercard).</p>

        <h2 className="text-lg font-semibold mt-6 mb-3">2. Registo e Conta</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
          <li>Deve ter pelo menos 18 anos para criar uma conta</li>
          <li>É responsável por manter a segurança da sua conta</li>
          <li>As informações fornecidas devem ser verdadeiras e actuais</li>
          <li>A YuniExpress reserva o direito de suspender contas que violem estes termos</li>
        </ul>

        <h2 className="text-lg font-semibold mt-6 mb-3">3. Produtos e Preços</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
          <li>Os preços são apresentados em Meticais (MZN) e incluem o custo de envio internacional</li>
          <li>Os preços podem variar conforme a taxa de câmbio e disponibilidade</li>
          <li>As imagens dos produtos são ilustrativas e podem diferir ligeiramente do produto real</li>
          <li>A disponibilidade dos produtos está sujeita ao stock do fornecedor</li>
        </ul>

        <h2 className="text-lg font-semibold mt-6 mb-3">4. Encomendas e Pagamentos</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
          <li>Ao confirmar uma encomenda, está a fazer uma oferta vinculativa de compra</li>
          <li>O pagamento é processado via M-Pesa, e-Mola ou cartão Visa/Mastercard através da ZumboPay</li>
          <li>A encomenda é confirmada após o pagamento ser processado com sucesso</li>
          <li>Em caso de falha no pagamento, a encomenda é automaticamente cancelada</li>
        </ul>

        <h2 className="text-lg font-semibold mt-6 mb-3">5. Envio e Entrega</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
          <li>O prazo de entrega estimado é de 15-45 dias úteis, dependendo do produto e localização</li>
          <li>Os prazos são estimativas e podem variar devido a atrasos alfandegários ou logísticos</li>
          <li>O envio é para todo o território de Moçambique</li>
          <li>O cliente será notificado quando a encomenda for enviada e receberá o número de rastreamento</li>
        </ul>

        <h2 className="text-lg font-semibold mt-6 mb-3">6. Devoluções e Reembolsos</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
          <li>Tem direito a reembolso se o produto não for entregue dentro de 60 dias</li>
          <li>Produtos danificados ou significativamente diferentes da descrição são elegíveis para reembolso</li>
          <li>Solicitações de reembolso devem ser feitas até 15 dias após a recepção do produto</li>
          <li>O reembolso será processado pelo mesmo método de pagamento utilizado na compra</li>
          <li>O prazo de processamento do reembolso é de 5-10 dias úteis</li>
        </ul>

        <h2 className="text-lg font-semibold mt-6 mb-3">7. Cancelamentos</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
          <li>Pode cancelar uma encomenda antes de ser processada/enviada</li>
          <li>Encomendas já enviadas não podem ser canceladas</li>
          <li>Em caso de cancelamento, os itens serão devolvidos ao seu carrinho</li>
        </ul>

        <h2 className="text-lg font-semibold mt-6 mb-3">8. Protecção ao Comprador</h2>
        <p className="text-sm text-gray-700">A YuniExpress garante:</p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
          <li>Reembolso total se o produto não for entregue</li>
          <li>Reembolso parcial ou total se o produto não corresponder à descrição</li>
          <li>Suporte ao cliente via WhatsApp (+258 87 100 2255) e email</li>
        </ul>

        <h2 className="text-lg font-semibold mt-6 mb-3">9. Propriedade Intelectual</h2>
        <p className="text-sm text-gray-700">Todo o conteúdo do site (logo, design, textos, código) é propriedade da YuniExpress. As imagens dos produtos pertencem aos respectivos fabricantes/vendedores.</p>

        <h2 className="text-lg font-semibold mt-6 mb-3">10. Limitação de Responsabilidade</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
          <li>A YuniExpress actua como intermediário entre o cliente e os fornecedores internacionais</li>
          <li>Não somos responsáveis por atrasos causados por alfândegas ou autoridades locais</li>
          <li>Taxas alfandegárias adicionais, se aplicáveis, são da responsabilidade do cliente</li>
        </ul>

        <h2 className="text-lg font-semibold mt-6 mb-3">11. Contacto</h2>
        <p className="text-sm text-gray-700">
          <strong>YuniExpress</strong><br />
          Email: suporte@yuniexpress.shop<br />
          WhatsApp: +258 87 100 2255<br />
          Moçambique
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-3">12. Lei Aplicável</h2>
        <p className="text-sm text-gray-700">Estes termos são regidos pela legislação da República de Moçambique. Qualquer litígio será resolvido nos tribunais competentes de Maputo.</p>
      </div>
    </div>
  );
}
