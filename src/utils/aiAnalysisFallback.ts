import { AIFinancialAnalysis, ExpenseItem, FinancingItem, IncomeItem } from '../types/finance';

export function generateOfflineOrFallbackAnalysis(
  incomes: IncomeItem[],
  expenses: ExpenseItem[],
  financings: FinancingItem[],
  monthlySavingsTarget: number
): AIFinancialAnalysis {
  const totalIncome = incomes.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const primaryFinancing = financings[0];

  const deliveryExpense = expenses.find(
    (e) =>
      e.title.toLowerCase().includes('delivery') ||
      e.title.toLowerCase().includes('ifood') ||
      e.title.toLowerCase().includes('lanche') ||
      e.title.toLowerCase().includes('restaurante')
  );
  const deliveryAmount = deliveryExpense ? Number(deliveryExpense.amount) : 650;

  const streamingExpense = expenses.find((e) => e.category === 'assinaturas');
  const streamingAmount = streamingExpense ? Number(streamingExpense.amount) : 140;

  const potentialMonthlyDeliveryCut = Math.round(deliveryAmount * 0.4);
  const potentialMonthlyStreamingCut = Math.round(streamingAmount * 0.35);
  const potentialMonthlyEnergyCut = 65;

  const monthlyPotential = Math.max(
    200,
    potentialMonthlyDeliveryCut + potentialMonthlyStreamingCut + potentialMonthlyEnergyCut
  );
  const yearlyPotential = monthlyPotential * 12;

  const remainingInstallments = primaryFinancing
    ? primaryFinancing.totalInstallments - primaryFinancing.paidInstallments
    : 48;
  const monthsReduced = Math.min(
    Math.max(1, remainingInstallments - 4),
    Math.round(monthlyPotential / 60)
  );

  const avgInstallment = primaryFinancing ? primaryFinancing.installmentAmount : 1500;
  const estimatedInterestSaved = Math.round(monthsReduced * avgInstallment * 0.52);

  return {
    generatedAt: new Date().toISOString(),
    executiveSummary: `Com base nas suas despesas ativas, identificamos uma margem de economia direta de R$ ${monthlyPotential},00/mês (${Math.round((monthlyPotential / (totalIncome || 5000)) * 100)}% da renda). Ao redirecionar essa economia para amortizar seu principal financiamento, você pode quitar a dívida ${monthsReduced} meses antes e economizar cerca de R$ ${estimatedInterestSaved.toLocaleString('pt-BR')} em juros.`,
    patterns: [
      {
        category: 'alimentacao',
        description: `Despesas com delivery e restaurantes totalizaram R$ ${deliveryAmount.toFixed(2)}, excedendo a proporção saudável de gastos variáveis discricionários.`,
        severity: 'high',
        percentageDifference: '+35% acima do padrão recomendado',
      },
      {
        category: 'assinaturas',
        description: `Assinaturas recorrentes (streamings e serviços digitais) totalizam R$ ${streamingAmount.toFixed(2)}. Há serviços sobrepostos que podem ser agrupados.`,
        severity: 'medium',
        percentageDifference: 'Potencial de otimização de 35%',
      },
      {
        category: 'moradia',
        description: 'Contas básicas de consumo (energia, água, internet) mantêm patamar estável, com oportunidade de pequenos ganhos em eficiência.',
        severity: 'low',
        percentageDifference: 'Dentro da margem segura',
      },
    ],
    cutSuggestions: [
      {
        id: 'cut-1',
        title: 'Otimização de Pedidos de Delivery',
        category: 'alimentacao',
        currentEstimatedCost: deliveryAmount,
        potentialMonthlySavings: potentialMonthlyDeliveryCut,
        actionPlan: 'Substituir 2 pedidos semanais por refeições planejadas previamente na feira/supermercado aos domingos.',
        impactLevel: 'alto',
        difficulty: 'facil',
      },
      {
        id: 'cut-2',
        title: 'Rodízio Mensal de Streamings',
        category: 'assinaturas',
        currentEstimatedCost: streamingAmount,
        potentialMonthlySavings: potentialMonthlyStreamingCut,
        actionPlan: 'Alternar plataformas a cada 2 meses conforme lançamentos de séries, ou compartilhar plano familiar oficial.',
        impactLevel: 'medio',
        difficulty: 'facil',
      },
      {
        id: 'cut-3',
        title: 'Eficiência Energética Doméstica',
        category: 'moradia',
        currentEstimatedCost: 280,
        potentialMonthlySavings: potentialMonthlyEnergyCut,
        actionPlan: 'Uso de réguas com interruptor para desligar aparelhos em standby e ajuste do chuveiro em modo verão.',
        impactLevel: 'baixo',
        difficulty: 'facil',
      },
    ],
    savingsPotential: {
      monthlyTotal: monthlyPotential,
      yearlyTotal: yearlyPotential,
    },
    financingImpact: {
      recommendedExtraPaymentMonthly: monthlyPotential,
      acceleratedFinancingId: primaryFinancing?.id || 'fin-1',
      financingName: primaryFinancing?.title || 'Financiamento Imobiliário',
      monthsReduced,
      estimatedInterestSaved,
      projectedPayoffDateNote: `Ao aportar R$ ${monthlyPotential},00 a mais por mês no modelo SAC/Price abatendo as últimas parcelas, você antecipa a quitação em ${monthsReduced} meses e deixa de pagar R$ ${estimatedInterestSaved.toLocaleString('pt-BR')} em juros bancários.`,
    },
    motivationQuote: 'A verdadeira liberdade financeira não vem de quanto você ganha, mas de quanto você retém e investe no seu futuro com clareza e método.',
  };
}
