import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  Code2,
  Copy,
  Check,
  Landmark,
  Zap,
  Target,
  FileJson,
  Layers,
  HelpCircle,
} from 'lucide-react';
import {
  AIFinancialAnalysis,
  ExpenseItem,
  FinancingItem,
  IncomeItem,
  UserProfile,
  PiggyBankItem,
} from '../types/finance';
import { formatBRL } from '../utils/financeCalculations';
import { generateOfflineOrFallbackAnalysis } from '../utils/aiAnalysisFallback';

interface AiAssistantViewProps {
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
  financings: FinancingItem[];
  piggyBanks?: PiggyBankItem[];
  profile: UserProfile;
  aiAnalysis: AIFinancialAnalysis | null;
  onSetAiAnalysis: (analysis: AIFinancialAnalysis) => void;
  onSelectTab: (tab: any) => void;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  incomes,
  expenses,
  financings,
  piggyBanks = [],
  profile,
  aiAnalysis,
  onSetAiAnalysis,
  onSelectTab,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'diagnosis' | 'architecture'>('diagnosis');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);

  // Trigger Gemini Analysis (Online server API with seamless offline fallback)
  const handleRunAiDiagnosis = async () => {
    setLoading(true);
    setError(null);

    // If offline, generate locally immediately
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setTimeout(() => {
        const localDiagnosis = generateOfflineOrFallbackAnalysis(
          incomes,
          expenses,
          financings,
          profile.monthlySavingsTarget
        );
        onSetAiAnalysis(localDiagnosis);
        setLoading(false);
      }, 400);
      return;
    }

    try {
      const response = await fetch('/api/ai/analyze-finances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incomes,
          expenses,
          financings,
          piggyBanks,
          monthlySavingsTarget: profile.monthlySavingsTarget,
        }),
      });

      if (!response.ok) {
        throw new Error(`Servidor respondeu com status ${response.status}`);
      }

      const data: AIFinancialAnalysis = await response.json();
      onSetAiAnalysis(data);
    } catch (err: any) {
      console.warn('Usando motor analítico offline:', err);
      // Fallback algorithmic analysis so user experience is never broken
      const fallbackDiagnosis = generateOfflineOrFallbackAnalysis(
        incomes,
        expenses,
        financings,
        profile.monthlySavingsTarget
      );
      onSetAiAnalysis(fallbackDiagnosis);
    } finally {
      setLoading(false);
    }
  };

  const systemPromptText = `Você é o Gasto Inteligente AI, um Engenheiro Financeiro Sênior e Especialista em Finanças Pessoais e Economia Comportamental.
Sua missão é analisar de forma minuciosa, cirúrgica e empática os dados financeiros do usuário (rendas, despesas do mês, gastos fixos e variáveis, vencimentos e financiamentos de longo prazo).

DIRETRIZES FUNDAMENTAIS DE ANÁLISE:
1. ANÁLISE DE PADRÕES & ANOMALIAS:
   - Identifique despesas desproporcionais em relação à renda total líquida (ex: alimentação/delivery consumindo > 20% do orçamento, assinaturas esquecidas acumuladas, etc.).
   - Calcule desvios perceptíveis ou excessos (ex: "Você gastou R$ 890 com delivery neste mês, o que representa quase 10% da sua renda").

2. RECOMENDAÇÕES PRÁTICAS DE CORTE:
   - Forneça 3 a 5 sugestões acionáveis, específicas e realistas (não genéricas como "economize mais").
   - Categorize cada uma por impacto (alto/médio/baixo) e facilidade de implementação (fácil/moderado/avançado).
   - Estime com exatidão matemática o valor economizado por mês.

3. ACELERAÇÃO DE FINANCIAMENTOS (EFEITO BOLA DE NEVE):
   - Se o usuário possuir financiamentos ativos (imóvel, veículo, empréstimos), calcule o impacto de direcionar a economia mensal obtida para amortização antecipada extraordinária (redução de prazo).
   - Indique quantos meses ou anos de dívida seriam eliminados e uma estimativa dos juros que o usuário deixará de pagar ao banco.

4. TOM DE VOZ:
   - Profissional, motivador, livre de julgamentos morais, direto e focado em independência financeira.
   - Todo o texto deve ser em Português do Brasil (pt-BR).`;

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Assistente IA de Corte de Gastos</h1>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              Gemini 3.8 Flash
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Inteligência analítica para caçar excessos, propor cortes práticos e acelerar quitação de dívidas
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleRunAiDiagnosis}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin stroke-[2.5]" />
          ) : (
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
          )}
          <span>{loading ? 'Analisando Gastos...' : 'Executar Análise IA'}</span>
        </button>
      </div>

      {/* Sub Navigation: Diagnosis vs Architecture Spec */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('diagnosis')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeSubTab === 'diagnosis'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Diagnóstico & Recomendações</span>
        </button>

        <button
          onClick={() => setActiveSubTab('architecture')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeSubTab === 'architecture'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Engenharia de Prompt & Arquitetura</span>
        </button>
      </div>

      {error && (
        <div className="bg-rose-950/40 border border-rose-800/80 rounded-2xl p-4 text-xs text-rose-300 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* SUBTAB 1: DIAGNOSIS */}
      {activeSubTab === 'diagnosis' && (
        <div className="space-y-6">
          {!aiAnalysis && !loading ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-1">
                  Seu diagnóstico financeiro está pronto para ser gerado
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  A IA lerá suas receitas, despesas do mês, gastos supérfluos e financiamentos ativos para calcular onde você pode poupar e o impacto em juros eliminados.
                </p>
              </div>
              <button
                onClick={handleRunAiDiagnosis}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 stroke-[2.5]" />
                <span>Iniciar Diagnóstico com Gemini</span>
              </button>
            </div>
          ) : (
            aiAnalysis && (
              <>
                {/* Executive Summary Card */}
                <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-800/60 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Resumo Executivo do Diagnóstico
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      Atualizado em {new Date(aiAnalysis.generatedAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <p className="text-sm text-slate-100 leading-relaxed font-medium">
                    {aiAnalysis.executiveSummary}
                  </p>

                  {aiAnalysis.motivationQuote && (
                    <blockquote className="text-xs italic text-emerald-300/80 border-l-2 border-emerald-500/60 pl-3 py-1">
                      "{aiAnalysis.motivationQuote}"
                    </blockquote>
                  )}
                </div>

                {/* Savings Potential & Debt Acceleration Highlight */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Monthly Potential */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
                    <span className="text-xs text-slate-400 block mb-1">
                      Potencial de Economia Mensal Identificado
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
                        {formatBRL(aiAnalysis.savingsPotential.monthlyTotal)}
                      </span>
                      <span className="text-xs text-slate-500">/mês</span>
                    </div>
                    <span className="text-xs text-teal-300 block mt-2 font-mono">
                      ≈ {formatBRL(aiAnalysis.savingsPotential.yearlyTotal)} ao ano poupados
                    </span>
                  </div>

                  {/* Financing Impact */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-400">Aceleração de Quitação de Dívidas</span>
                      <Landmark className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-cyan-400 font-mono tracking-tight">
                        -{aiAnalysis.financingImpact.monthsReduced} meses
                      </span>
                      <span className="text-xs text-slate-500">de dívida eliminados</span>
                    </div>
                    <span className="text-xs text-amber-300 block mt-2 font-mono">
                      Economia estimada de {formatBRL(aiAnalysis.financingImpact.estimatedInterestSaved)} em juros
                    </span>
                  </div>
                </div>

                {/* Financing Impact Explanatory Note */}
                {aiAnalysis.financingImpact.projectedPayoffDateNote && (
                  <div className="bg-cyan-950/20 border border-cyan-800/40 rounded-xl p-3.5 text-xs text-cyan-200 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      {aiAnalysis.financingImpact.projectedPayoffDateNote}
                    </p>
                  </div>
                )}

                {/* Section A: Patterns & Inconsistencies */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Padrões de Gastos & Pontos de Atenção</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {aiAnalysis.patterns.map((pat, idx) => (
                      <div
                        key={idx}
                        className={`bg-slate-900/80 border rounded-xl p-4 flex flex-col justify-between gap-3 ${
                          pat.severity === 'high'
                            ? 'border-rose-900/60'
                            : pat.severity === 'medium'
                            ? 'border-amber-900/60'
                            : 'border-slate-800'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="capitalize font-semibold text-slate-300">
                              {pat.category}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                                pat.severity === 'high'
                                  ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                  : pat.severity === 'medium'
                                  ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              Impacto {pat.severity}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {pat.description}
                          </p>
                        </div>

                        {pat.percentageDifference && (
                          <div className="text-[11px] font-mono font-semibold text-amber-300 pt-2 border-t border-slate-800/80">
                            {pat.percentageDifference}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section B: Actionable Cut Suggestions */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-emerald-400" />
                    <span>Recomendações Práticas de Corte de Gastos</span>
                  </h3>

                  <div className="space-y-2.5">
                    {aiAnalysis.cutSuggestions.map((sug) => (
                      <div
                        key={sug.id}
                        className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4.5 transition-all hover:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-white">{sug.title}</h4>
                            {/* Quiet unboxed text metadata */}
                            <span className="text-xs text-slate-500 flex items-center gap-1.5">
                              <span className="capitalize">{sug.category}</span>
                              <span aria-hidden="true">·</span>
                              <span>Dificuldade {sug.difficulty}</span>
                              <span aria-hidden="true">·</span>
                              <span>Impacto {sug.impactLevel}</span>
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed">
                            {sug.actionPlan}
                          </p>
                        </div>

                        {/* Savings Tag */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                          <span className="text-[11px] text-slate-500 sm:text-right">
                            Economia estimada:
                          </span>
                          <span className="text-base font-bold text-emerald-400 font-mono">
                            +{formatBRL(sug.potentialMonthlySavings)}/mês
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )
          )}
        </div>
      )}

      {/* SUBTAB 2: TECHNICAL ARCHITECTURE & PROMPT ENGINEERING SPEC */}
      {activeSubTab === 'architecture' && (
        <div className="space-y-6">
          {/* Header of technical section */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileJson className="w-5 h-5 text-emerald-400" />
              <span>Especificação Técnica & Engenharia de Prompt</span>
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Documentação de conformidade com os requisitos solicitados: Modelagem de Dados TypeScript, Arquitetura da Navegação Inferior e o System Prompt exato integrado à API do Gemini.
            </p>
          </div>

          {/* 1. System Prompt */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">
                  1. Engenharia de Prompt para a IA Interna (System Prompt)
                </h3>
              </div>
              <button
                onClick={() => copyToClipboard(systemPromptText, setCopiedPrompt)}
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
              >
                {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPrompt ? 'Copiado!' : 'Copiar Prompt'}</span>
              </button>
            </div>

            <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-emerald-300/90 overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {systemPromptText}
            </pre>
          </div>

          {/* 2. Data Structure (TypeScript Interfaces) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">
                  2. Estrutura de Dados (TypeScript Interfaces & JSON Schema)
                </h3>
              </div>
              <button
                onClick={() =>
                  copyToClipboard(
                    `export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  category: ExpenseCategory;
  type: 'fixed' | 'variable';
  status: 'pending' | 'paid';
  isRecurring: boolean;
}

export interface FinancingItem {
  id: string;
  title: string;
  totalFinancedAmount: number;
  annualInterestRate: number;
  installmentAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  amortizations: AmortizationRecord[];
}`,
                    setCopiedSchema
                  )
                }
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
              >
                {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSchema ? 'Copiado!' : 'Copiar Interfaces'}</span>
              </button>
            </div>

            <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
{`// 1. Despesas & Gastos Recorrentes
export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  category: 'moradia' | 'alimentacao' | 'transporte' | 'saude' | 'lazer' | 'educacao' | 'assinaturas' | 'dividas' | 'outros';
  type: 'fixed' | 'variable';
  status: 'pending' | 'paid';
  paidAt?: string;
  isRecurring: boolean;
  notes?: string;
}

// 2. Fontes de Renda
export interface IncomeItem {
  id: string;
  title: string;
  amount: number;
  frequency: 'monthly' | 'biweekly' | 'variable' | 'one_time';
  category: 'salary' | 'freelance' | 'investment' | 'rental' | 'other';
  receivedDate: string;
  isFixed: boolean;
}

// 3. Financiamentos & Amortizações
export interface FinancingItem {
  id: string;
  title: string;
  category: 'imovel' | 'veiculo' | 'educacao' | 'pessoal' | 'outro';
  totalFinancedAmount: number;
  annualInterestRate: number;
  installmentAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  startDate: string;
  amortizations: Array<{
    id: string;
    date: string;
    amount: number;
    strategy: 'reduce_term' | 'reduce_installment';
    monthsSavedEstimate?: number;
    interestSavedEstimate?: number;
    newInstallmentAmount?: number;
  }>;
}

// 4. Perfil de Usuário
export interface UserProfile {
  id: string;
  name: string;
  currency: 'BRL';
  monthlySavingsTarget: number;
  dueAlertDays: number; // padrão 3 dias
}`}
            </pre>
          </div>

          {/* 3. Bottom Navigation Architecture */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">
                3. Arquitetura da Navegação Inferior (Bottom Navigation)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
              {[
                { tab: '1. Painel', desc: 'Dashboard executivo, balanço mensal, gráfico por categorias e alertas rápidos' },
                { tab: '2. Despesas', desc: 'Gestão completa, filtros (Atrasadas, 3d, Pagas), cadastro e botão 1-clique Pagar' },
                { tab: '3. Renda', desc: 'Registro de salário, rendimentos de aplicações, serviços extras fixos/variáveis' },
                { tab: '4. Financiamentos', desc: 'Barra de progresso de quitação, saldo devedor e simulador de amortização SAC/Price' },
                { tab: '5. Assistente IA', desc: 'Diagnóstico inteligente com Gemini 3.8 Flash, metas de economia e aceleração de dívidas' },
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs space-y-1">
                  <span className="font-bold text-emerald-400 block">{item.tab}</span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
