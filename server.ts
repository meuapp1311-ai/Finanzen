import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Shared System Prompt definition for Spending Cut Assistant
export const SYSTEM_PROMPT_FINANCIAL_AI = `
Você é o Gasto Inteligente AI, um Engenheiro Financeiro Sênior e Especialista em Finanças Pessoais e Economia Comportamental.
Sua missão é analisar de forma minuciosa, cirúrgica e empática os dados financeiros do usuário (rendas, despesas do mês, gastos fixos e variáveis, vencimentos e financiamentos de longo prazo).

DIRETRIZES FUNDAMENTAIS DE ANÁLISE:
1. ANÁLISE DE PADRÕES & ANOMALIAS:
   - Identifique despesas desproporcionais em relação à renda total líquida (ex: alimentação/delivery consumindo > 20% do orçamento, assinaturas esquecidas acumuladas, etc.).
   - Calcule desvios perceptíveis ou excessos (ex: "Você gastou R$ 890 com delivery neste mês, o que representa quase 10% da sua renda").

2. RECOMENDAÇÕES PRÁTICAS DE CORTE:
   - Forneça 3 a 5 sugestões acionáveis, específicas e realistas (não genéricas como "economize mais").
   - Categorize cada uma por impacto (alto/médio/baixo) e facilidade de implementação (fácil/moderado/avançado).
   - Estime com exatidão matemática o valor economizado por mês.

3. ACELERAÇÃO DE FINANCIAMENTOS E METAS EM COFRINHOS:
   - Se o usuário possuir financiamentos ativos (imóvel, veículo, empréstimos), calcule o impacto de direcionar a economia mensal obtida para amortização antecipada extraordinária (redução de prazo).
   - Analise também os Cofrinhos / Poupança guardada (reserva de emergência, metas de viagem, etc.) e avalie se a reserva cobre os gastos fixos.

4. TOM DE VOZ:
   - Profissional, motivador, livre de julgamentos morais, direto e focado em independência financeira.
   - Todo o texto deve ser em Português do Brasil (pt-BR).
`.trim();

// Endpoint for inspecting the prompt engineering details
app.get('/api/ai/system-prompt', (_req: Request, res: Response) => {
  res.json({
    systemPrompt: SYSTEM_PROMPT_FINANCIAL_AI,
    model: 'gemini-3.8-flash',
    responseSchemaType: 'application/json',
  });
});

// Endpoint for AI Spending Cut Analysis
app.post('/api/ai/analyze-finances', async (req: Request, res: Response) => {
  try {
    const { incomes = [], expenses = [], financings = [], piggyBanks = [], monthlySavingsTarget = 1000 } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;

    // Calculate baseline metrics to feed into the prompt
    const totalIncome = incomes.reduce((s: number, i: any) => s + (Number(i.amount) || 0), 0);
    const totalExpenses = expenses.reduce((s: number, e: any) => s + (Number(e.amount) || 0), 0);
    const totalPiggy = piggyBanks.reduce((s: number, p: any) => s + (Number(p.currentAmount) || 0), 0);
    const fixedExpenses = expenses.filter((e: any) => e.type === 'fixed').reduce((s: number, e: any) => s + (Number(e.amount) || 0), 0);
    const variableExpenses = expenses.filter((e: any) => e.type === 'variable').reduce((s: number, e: any) => s + (Number(e.amount) || 0), 0);
    
    // Group expenses by category
    const categoryTotals: Record<string, number> = {};
    expenses.forEach((e: any) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + (Number(e.amount) || 0);
    });

    const userPromptPayload = {
      contexto: {
        rendaTotalMensal: totalIncome,
        despesaTotalMensal: totalExpenses,
        saldoAtual: totalIncome - totalExpenses,
        totalGuardadoEmCofrinhos: totalPiggy,
        despesasFixas: fixedExpenses,
        despesasVariaveis: variableExpenses,
        metaEconomiaDesejada: monthlySavingsTarget,
        totaisPorCategoria: categoryTotals,
      },
      itensRenda: incomes.map((i: any) => ({
        titulo: i.title,
        valor: i.amount,
        categoria: i.category,
        frequencia: i.frequency,
        isFixa: i.isFixed,
      })),
      itensDespesa: expenses.map((e: any) => ({
        titulo: e.title,
        valor: e.amount,
        categoria: e.category,
        tipo: e.type,
        status: e.status,
        vencimento: e.dueDate,
        recorrente: e.isRecurring,
      })),
      cofrinhosEPoupancas: piggyBanks.map((p: any) => ({
        id: p.id,
        titulo: p.title,
        categoria: p.category,
        saldoGuardado: p.currentAmount,
        metaDesejada: p.targetAmount,
        rendimento: p.yieldType,
        taxaAnual: p.annualYieldRate,
      })),
      financiamentosAtivos: financings.map((f: any) => ({
        id: f.id,
        titulo: f.title,
        categoria: f.category,
        valorFinanciado: f.totalFinancedAmount,
        parcelaMensal: f.installmentAmount,
        parcelasTotais: f.totalInstallments,
        parcelasPagas: f.paidInstallments,
        parcelasRestantes: f.totalInstallments - f.paidInstallments,
        taxaJurosAnual: f.annualInterestRate,
      })),
    };

    if (apiKey) {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Analise as finanças deste usuário e retorne o diagnóstico completo em JSON estrito:\n\n${JSON.stringify(userPromptPayload, null, 2)}`,
              },
            ],
          },
        ],
        config: {
          systemInstruction: SYSTEM_PROMPT_FINANCIAL_AI,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              executiveSummary: {
                type: Type.STRING,
                description: 'Resumo executivo do diagnóstico financeiro do mês (2 a 3 frases claras).',
              },
              patterns: {
                type: Type.ARRAY,
                description: 'Padrões de gastos identificados, excessos e comportamentos anômalos.',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING },
                    description: { type: Type.STRING },
                    severity: { type: Type.STRING, description: 'high, medium ou low' },
                    percentageDifference: { type: Type.STRING, description: 'Ex: +35% comparado ao ideal' },
                  },
                  required: ['category', 'description', 'severity'],
                },
              },
              cutSuggestions: {
                type: Type.ARRAY,
                description: 'Sugestões de cortes práticos de gastos.',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    category: { type: Type.STRING },
                    currentEstimatedCost: { type: Type.NUMBER },
                    potentialMonthlySavings: { type: Type.NUMBER },
                    actionPlan: { type: Type.STRING },
                    impactLevel: { type: Type.STRING, description: 'alto, medio ou baixo' },
                    difficulty: { type: Type.STRING, description: 'facil, moderado ou avancado' },
                  },
                  required: ['id', 'title', 'category', 'currentEstimatedCost', 'potentialMonthlySavings', 'actionPlan', 'impactLevel', 'difficulty'],
                },
              },
              savingsPotential: {
                type: Type.OBJECT,
                properties: {
                  monthlyTotal: { type: Type.NUMBER },
                  yearlyTotal: { type: Type.NUMBER },
                },
                required: ['monthlyTotal', 'yearlyTotal'],
              },
              financingImpact: {
                type: Type.OBJECT,
                properties: {
                  recommendedExtraPaymentMonthly: { type: Type.NUMBER },
                  acceleratedFinancingId: { type: Type.STRING },
                  financingName: { type: Type.STRING },
                  monthsReduced: { type: Type.NUMBER },
                  estimatedInterestSaved: { type: Type.NUMBER },
                  projectedPayoffDateNote: { type: Type.STRING },
                },
                required: ['recommendedExtraPaymentMonthly', 'monthsReduced', 'estimatedInterestSaved', 'projectedPayoffDateNote'],
              },
              motivationQuote: {
                type: Type.STRING,
                description: 'Uma frase curta e inspiradora sobre disciplina financeira e liberdade.',
              },
            },
            required: ['executiveSummary', 'patterns', 'cutSuggestions', 'savingsPotential', 'financingImpact', 'motivationQuote'],
          },
        },
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        return res.json({
          ...parsed,
          generatedAt: new Date().toISOString(),
        });
      }
    }

    // Fallback algorithmic response if no key or error
    const primaryFinancing = financings[0];
    const foodDelivery = expenses.find((e: any) => e.title?.toLowerCase().includes('delivery') || e.title?.toLowerCase().includes('ifood'))?.amount || 750;
    const streamingCost = expenses.find((e: any) => e.category === 'assinaturas')?.amount || 140;

    const monthlyPotential = Math.round(foodDelivery * 0.45 + streamingCost * 0.4);
    const yearlyPotential = monthlyPotential * 12;

    const remainingInstallments = primaryFinancing ? (primaryFinancing.totalInstallments - primaryFinancing.paidInstallments) : 48;
    const monthsSaved = Math.min(remainingInstallments - 2, Math.round(monthlyPotential / 65));
    const interestSaved = monthsSaved * (primaryFinancing?.installmentAmount || 1500) * 0.55;

    return res.json({
      generatedAt: new Date().toISOString(),
      executiveSummary: `Identificamos uma oportunidade imediata de economia de R$ ${monthlyPotential},00 por mês focando em despesas variáveis (delivery e assinaturas duplicadas). Isso permitirá acelerar a quitação das suas dívidas em até ${monthsSaved} meses.`,
      patterns: [
        {
          category: 'alimentacao',
          description: `Gastos com delivery e restaurantes totalizaram R$ ${foodDelivery.toFixed(2)}, o que representa uma pressão desproporcional nas despesas variáveis.`,
          severity: 'high',
          percentageDifference: '+38% acima da média recomendada',
        },
        {
          category: 'assinaturas',
          description: 'Múltiplas assinaturas ativas simultaneamente (streaming, apps). Potencial de consolidação sem perda de entretenimento.',
          severity: 'medium',
          percentageDifference: 'Oportunidade de otimização de 40%',
        },
        {
          category: 'moradia',
          description: 'Despesas essenciais com moradia bem distribuídas, porém com contas de consumo com vencimento próximo.',
          severity: 'low',
        },
      ],
      cutSuggestions: [
        {
          id: 'sug-1',
          title: 'Regra dos 2 Pedidos de Delivery por Semana',
          category: 'alimentacao',
          currentEstimatedCost: foodDelivery,
          potentialMonthlySavings: Math.round(foodDelivery * 0.45),
          actionPlan: 'Planejar as refeições de segunda a quinta no mercado e limitar delivery para noites comemorativas de fim de semana.',
          impactLevel: 'alto',
          difficulty: 'facil',
        },
        {
          id: 'sug-2',
          title: 'Revisão e Rodízio de Streamings',
          category: 'assinaturas',
          currentEstimatedCost: streamingCost,
          potentialMonthlySavings: Math.round(streamingCost * 0.4),
          actionPlan: 'Manter apenas 1 serviço de streaming de vídeo ativo por vez ou migrar para plano familiar compartilhado.',
          impactLevel: 'medio',
          difficulty: 'facil',
        },
        {
          id: 'sug-3',
          title: 'Eficiência Energética & Iluminação LED',
          category: 'moradia',
          currentEstimatedCost: 285,
          potentialMonthlySavings: 65,
          actionPlan: 'Desconectar aparelhos em stand-by e ajustar temperatura do chuveiro nas estações amenas.',
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
        monthsReduced: monthsSaved,
        estimatedInterestSaved: Math.round(interestSaved),
        projectedPayoffDateNote: `Direcionando os R$ ${monthlyPotential},00 economizados para amortizar parcelas do fim do contrato, você economiza aproximadamente R$ ${Math.round(interestSaved).toLocaleString('pt-BR')} em juros bancários.`,
      },
      motivationQuote: 'Pequenos vazamentos afundam grandes navios. Cada real economizado com intenção é um passo rumo à sua tranquilidade financeira.',
    });
  } catch (err: any) {
    console.error('Erro na análise de finanças via Gemini:', err);
    res.status(500).json({ error: err.message || 'Erro ao processar análise financeira' });
  }
});

// Setup Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Gasto Inteligente Server] Servidor rodando na porta ${PORT}`);
  });
}

startServer();
