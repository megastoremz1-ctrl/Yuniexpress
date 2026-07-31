export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Termos e Condições de Uso</h1>
      <div className="bg-white p-6 rounded-xl border prose prose-sm max-w-none">
        <p className="text-sm text-gray-500 mb-4">Última actualização: Julho 2026</p>
        <p className="text-sm text-gray-700 mb-6 font-medium bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          ATENÇÃO: Ao utilizar este site, criar uma conta ou efectuar qualquer compra, o utilizador declara que leu, 
          compreendeu e aceita integralmente estes Termos e Condições. Se não concordar com qualquer disposição, 
          não deve utilizar os nossos serviços.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-3">1. Identificação e Natureza do Serviço</h2>
        <p className="text-sm text-gray-700">1.1. A YuniExpress é uma plataforma de comércio electrónico que opera como <strong>intermediário comercial</strong> entre clientes em Moçambique e fornecedores internacionais.</p>
        <p className="text-sm text-gray-700">1.2. A YuniExpress <strong>NÃO é fabricante, importador directo ou armazenador</strong> dos produtos listados. Actuamos exclusivamente como facilitador da transacção comercial.</p>
        <p className="text-sm text-gray-700">1.3. A sede da empresa encontra-se em Maputo, República de Moçambique.</p>

        <h2 className="text-lg font-semibold mt-6 mb-3">2. Capacidade e Registo</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
          <li>O utilizador deve ter pelo menos 18 anos de idade ou capacidade jurídica plena para celebrar contratos</li>
          <li>Ao criar uma conta, o utilizador garante que todas as informações fornecidas são verdadeiras, actuais e completas</li>
          <li>O utilizador é exclusivamente responsável pela segurança das suas credenciais de acesso</li>
          <li>A YuniExpress reserva-se o direito de suspender, bloquear ou eliminar contas sem aviso prévio em caso de violação destes termos, actividade suspeita ou fraudulenta</li>
          <li>A verificação do email é obrigatória para activação da conta</li>
        </ul>

        <h2 className="text-lg font-semibold mt-6 mb-3">3. Produtos, Preços e Disponibilidade</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
          <li>Os preços são apresentados em Meticais (MZN) e incluem a margem de serviço da YuniExpress</li>
          <li>Os preços podem ser alterados a qualquer momento sem aviso prévio, conforme variações cambiais, custos de fornecedores ou condições de mercado</li>
          <li>As imagens e descrições dos produtos são meramente <strong>ilustrativas e informativas</strong>, podendo haver variações de cor, tamanho ou aparência em relação ao produto recebido</li>
          <li>A disponibilidade está sujeita ao stock do fornecedor internacional e pode ser alterada ou descontinuada sem aviso</li>
          <li>A confirmação da encomenda não garante disponibilidade — em caso de indisponibilidade, o cliente será reembolsado</li>
          <li>A YuniExpress não assume qualquer responsabilidade por erros tipográficos ou de informação nas fichas de produto provenientes dos fornecedores</li>
        </ul>

        <h2 className="text-lg font-semibold mt-6 mb-3">4. Encomendas e Pagamentos</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
          <li>A submissão de uma encomenda constitui uma <strong>oferta vinculativa de compra</strong> por parte do cliente</li>
          <li>O pagamento é processado via M-Pesa, e-Mola ou cartão Visa/Mastercard através de processadores terceiros (ZumboPay)</li>
          <li>A YuniExpress não armazena dados de pagamento — toda a informação financeira é processada por terceiros certificados</li>
          <li>A encomenda só é confirmada após confirmação efectiva do pagamento pelo processador</li>
          <li>Em caso de falha ou recusa no pagamento, a encomenda é automaticamente cancelada sem obrigação para a YuniExpress</li>
          <li>O cliente é responsável por quaisquer taxas bancárias ou de operador associadas à transacção</li>
        </ul>

        <h2 className="text-lg font-semibold mt-6 mb-3">5. Envio, Prazos e Entrega</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
          <li>Os prazos de entrega indicados (15-45 dias úteis) são <strong>meramente estimativos</strong> e não constituem compromisso vinculativo</li>
          <li>Os produtos são enviados directamente pelos fornecedores internacionais; a YuniExpress não controla o processo logístico internacional</li>
          <li>Atrasos causados por alfândegas, condições meteorológicas, greves, pandemias, conflitos ou outras causas de força maior <strong>não são imputáveis à YuniExpress</strong></li>
          <li>O risco de perda ou dano transfere-se para o cliente no momento em que o produto é despachado pelo fornecedor</li>
          <li>O cliente é responsável por fornecer endereço de entrega correcto e completo — entregas falhadas por endereço incorrecto não geram obrigação de reenvio ou reembolso</li>
          <li>Taxas alfandegárias, impostos de importação ou quaisquer encargos aduaneiros são da <strong>exclusiva responsabilidade do cliente</strong></li>
        </ul>

        <h2 className="text-lg font-semibold mt-6 mb-3">6. Exclusão de Garantias</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
          <p className="font-semibold mb-2">NA MÁXIMA EXTENSÃO PERMITIDA PELA LEI APLICÁVEL:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Os produtos são vendidos <strong>"TAL COMO ESTÃO" (AS IS)</strong> e sem qualquer garantia, expressa ou implícita</li>
            <li>A YuniExpress não oferece garantia de adequação a um fim particular, qualidade comercial, durabilidade ou conformidade</li>
            <li>Não garantimos que os produtos cumpram regulamentações ou normas específicas de Moçambique ou de qualquer outra jurisdição</li>
            <li>A garantia do fabricante, quando existente, é gerida directamente pelo fornecedor internacional e não pela YuniExpress</li>
            <li>A YuniExpress não é responsável por produtos defeituosos, danificados durante o transporte internacional, ou que não correspondam exactamente à descrição do fornecedor</li>
          </ul>
        </div>

        <h2 className="text-lg font-semibold mt-6 mb-3">7. Devoluções e Reembolsos</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
          <li>O cliente pode solicitar reembolso <strong>apenas</strong> nos seguintes casos: (a) produto não entregue após 60 dias da compra; (b) produto significativamente diferente da descrição</li>
          <li>Solicitações de reembolso devem ser efectuadas no prazo máximo de 15 dias após a recepção</li>
          <li>A YuniExpress reserva-se o direito de exigir prova fotográfica ou documental antes de aprovar qualquer reembolso</li>
          <li>Reembolsos são processados pelo mesmo método de pagamento, no prazo de 5-15 dias úteis</li>
          <li><strong>Não são aceites devoluções</strong> por arrependimento, mudança de opinião, incompatibilidade de expectativas ou diferenças menores em relação às imagens</li>
          <li>Produtos de higiene pessoal, roupa interior, ou artigos personalizados não são elegíveis para devolução em nenhuma circunstância</li>
          <li>O valor do reembolso será o valor pago pelo cliente, excluindo quaisquer taxas de processamento cobradas por terceiros</li>
        </ul>

        <h2 className="text-lg font-semibold mt-6 mb-3">8. Cancelamentos</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
          <li>O cancelamento é possível apenas antes do processamento/envio da encomenda pelo fornecedor</li>
          <li>Encomendas já processadas ou enviadas <strong>não podem ser canceladas</strong></li>
          <li>A YuniExpress pode aplicar uma taxa administrativa de até 5% do valor da encomenda em cancelamentos</li>
          <li>A YuniExpress reserva-se o direito de cancelar qualquer encomenda, a qualquer momento, por razões operacionais, com reembolso integral ao cliente</li>
        </ul>

        <h2 className="text-lg font-semibold mt-6 mb-3">9. Limitação de Responsabilidade</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
          <ul className="list-disc pl-5 space-y-2">
            <li>A responsabilidade total da YuniExpress perante o cliente está <strong>limitada ao valor efectivamente pago</strong> pelo produto na transacção em questão</li>
            <li>Em nenhuma circunstância a YuniExpress será responsável por danos indirectos, incidentais, consequenciais, punitivos ou especiais, incluindo mas não se limitando a: perda de lucros, perda de dados, danos morais, perda de oportunidade de negócio ou interrupção de actividade</li>
            <li>A YuniExpress não é responsável por acções, omissões, atrasos ou falhas de fornecedores, transportadoras, processadores de pagamento ou quaisquer terceiros</li>
            <li>A YuniExpress não é responsável por indisponibilidade da plataforma, erros técnicos, falhas de sistema ou interrupções de serviço</li>
            <li>O cliente assume total responsabilidade pela utilização dos produtos adquiridos, incluindo conformidade com leis locais</li>
          </ul>
        </div>

        <h2 className="text-lg font-semibold mt-6 mb-3">10. Força Maior</h2>
        <p className="text-sm text-gray-700">A YuniExpress não será responsável por qualquer incumprimento ou atraso causado por circunstâncias fora do seu controlo razoável, incluindo mas não se limitando a: catástrofes naturais, pandemias, guerras, actos terroristas, greves, embargos, acções governamentais, falhas de telecomunicações, alterações legislativas, problemas alfandegários ou quaisquer outros eventos de força maior.</p>

        <h2 className="text-lg font-semibold mt-6 mb-3">11. Propriedade Intelectual</h2>
        <p className="text-sm text-gray-700">Todo o conteúdo da plataforma (marca, logótipo, design, código-fonte, textos originais e compilações) é propriedade exclusiva da YuniExpress e está protegido pela legislação de propriedade intelectual. É proibida a reprodução, distribuição ou utilização não autorizada. As imagens dos produtos pertencem aos respectivos fabricantes/vendedores.</p>

        <h2 className="text-lg font-semibold mt-6 mb-3">12. Uso Aceitável</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
          <li>É proibido utilizar a plataforma para fins fraudulentos, ilegais ou que violem direitos de terceiros</li>
          <li>É proibido criar múltiplas contas para contornar limitações ou abusar de promoções</li>
          <li>É proibido utilizar bots, scrapers ou ferramentas automatizadas sem autorização expressa</li>
          <li>A violação destas regras resultará em suspensão imediata da conta e possível acção legal</li>
        </ul>

        <h2 className="text-lg font-semibold mt-6 mb-3">13. Privacidade e Dados Pessoais</h2>
        <p className="text-sm text-gray-700">O tratamento de dados pessoais é regido pela nossa <a href="/privacy" className="text-yellow-600 hover:underline">Política de Privacidade</a>, que constitui parte integrante destes Termos. Ao aceitar estes Termos, o utilizador consente o tratamento dos seus dados conforme descrito na referida política.</p>

        <h2 className="text-lg font-semibold mt-6 mb-3">14. Indemnização</h2>
        <p className="text-sm text-gray-700">O cliente concorda em indemnizar e isentar a YuniExpress, seus directores, colaboradores e parceiros de qualquer reclamação, dano, perda, custo ou despesa (incluindo honorários advocatícios) resultante da violação destes Termos ou da utilização indevida da plataforma.</p>

        <h2 className="text-lg font-semibold mt-6 mb-3">15. Modificação dos Termos</h2>
        <p className="text-sm text-gray-700">A YuniExpress reserva-se o direito de modificar estes Termos a qualquer momento, sem aviso prévio individual. A versão mais recente estará sempre disponível nesta página. O uso continuado da plataforma após alterações constitui aceitação dos novos termos.</p>

        <h2 className="text-lg font-semibold mt-6 mb-3">16. Resolução de Litígios</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
          <li>Qualquer litígio será preferencialmente resolvido por negociação directa entre as partes no prazo de 30 dias</li>
          <li>Caso a negociação não resulte em acordo, as partes poderão recorrer à mediação ou arbitragem</li>
          <li>Não sendo possível resolução extrajudicial, o litígio será submetido ao <strong>Tribunal Judicial da Cidade de Maputo</strong>, com exclusão de qualquer outro</li>
        </ul>

        <h2 className="text-lg font-semibold mt-6 mb-3">17. Lei Aplicável e Jurisdição</h2>
        <p className="text-sm text-gray-700">Estes Termos e Condições são regidos exclusivamente pela legislação da <strong>República de Moçambique</strong>. O foro competente para dirimir quaisquer questões decorrentes destes Termos é a comarca de Maputo, com renúncia expressa a qualquer outro.</p>

        <h2 className="text-lg font-semibold mt-6 mb-3">18. Disposições Gerais</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
          <li>Se qualquer disposição destes Termos for considerada inválida ou inexequível, as restantes disposições mantêm-se em pleno vigor</li>
          <li>A não execução de qualquer direito ou disposição destes Termos não constitui renúncia ao mesmo</li>
          <li>Estes Termos constituem o acordo integral entre o cliente e a YuniExpress relativamente ao uso da plataforma</li>
        </ul>

        <h2 className="text-lg font-semibold mt-6 mb-3">19. Contacto</h2>
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
          <p className="font-semibold mb-2">YuniExpress, Lda.</p>
          <p>Email: suporte@yuniexpress.shop</p>
          <p>WhatsApp: +258 87 100 2255</p>
          <p>Maputo, Moçambique</p>
        </div>
      </div>
    </div>
  );
}
