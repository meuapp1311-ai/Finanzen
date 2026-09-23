/**
 * Modelagem de Estrutura de Dados do FinanZen
 * Aplicativo de Gerenciamento Financeiro Pessoal
 */

export type ExpenseCategory =
  | 'moradia'
  | 'alimentacao'
  | 'transporte'
  | 'saude'
  | 'lazer'
  | 'educacao'
  | 'assinaturas'
  | 'dividas'
  | 'outros';

export type ExpenseType = 'fixed' | 'variable';

export type ExpenseStatus = 'pending' | 'paid';

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  category: ExpenseCategory;
  type: ExpenseType; // fixo ou variável
  status: ExpenseStatus; // pendente ou pago
  paidAt?: string; // Data em que foi pago
  isRecurring: boolean;
  notes?: string;
}

export type IncomeFrequency = 'monthly' | 'biweekly' | 'variable' | 'one_time';
export type IncomeCategory = 'salary' | 'freelance' | 'investment' | 'rental' | 'other';

export interface IncomeItem {
  id: string;
  title: string;
  amount: number;
  frequency: IncomeFrequency;
  category: IncomeCategory;
  receivedDate: string; // YYYY-MM-DD
  isFixed: boolean; // Fixa ou Variável
  notes?: string;
}

export interface AmortizationRecord {
  id: string;
  date: string;
  amount: number;
  strategy: 'reduce_term' | 'reduce_installment'; // redução de prazo ou de parcela
  monthsSavedEstimate?: number;
  interestSavedEstimate?: number;
  newInstallmentAmount?: number;
}

export interface FinancingItem {
  id: string;
  title: string; // ex: Apartamento Jardins, Carro Corolla Cross
  category: 'imovel' | 'veiculo' | 'educacao' | 'pessoal' | 'outro';
  totalFinancedAmount: number; // Valor financiado inicial
  annualInterestRate: number; // Ex: 10.5 para 10.5% ao ano
  installmentAmount: number; // Valor mensal da parcela
  totalInstallments: number; // Total de parcelas contratadas (ex: 360 ou 48)
  paidInstallments: number; // Parcelas já quitadas
  startDate: string; // Data de início
  amortizations: AmortizationRecord[];
  notes?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  currency: string;
  monthlySavingsTarget: number; // Meta mensal de economia em R$
  dueAlertDays: number; // Dias de antecedência para aviso (default: 3 dias)
}

// Resposta Estruturada da Inteligência Artificial (Gemini)
export interface AIPattern {
  category: ExpenseCategory | string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  percentageDifference?: string; // Ex: "+35% comparado ao ideal"
}

export interface AICutSuggestion {
  id: string;
  title: string;
  category: ExpenseCategory | string;
  currentEstimatedCost: number;
  potentialMonthlySavings: number;
  actionPlan: string;
  impactLevel: 'alto' | 'medio' | 'baixo';
  difficulty: 'facil' | 'moderado' | 'avancado';
}

export interface AIFinancingImpact {
  recommendedExtraPaymentMonthly: number;
  acceleratedFinancingId?: string;
  financingName?: string;
  monthsReduced: number;
  estimatedInterestSaved: number;
  projectedPayoffDateNote: string;
}

export interface AIFinancialAnalysis {
  generatedAt: string;
  executiveSummary: string;
  patterns: AIPattern[];
  cutSuggestions: AICutSuggestion[];
  savingsPotential: {
    monthlyTotal: number;
    yearlyTotal: number;
  };
  financingImpact: AIFinancingImpact;
  motivationQuote: string;
}

// Modelagem do Cofrinho / Poupança Guardada
export type PiggyBankCategory =
  | 'emergency' // Reserva de Emergência
  | 'travel' // Viagem & Férias
  | 'vehicle' // Carro / Moto
  | 'home' // Imóvel / Reforma
  | 'investment' // Investimento & Futuro
  | 'education' // Cursos & Estudos
  | 'poupanca' // Poupança Geral
  | 'other'; // Outro objetivo

export type PiggyBankYield = 'cdi' | 'poupanca' | 'fixed' | 'none';

export interface PiggyBankTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  type: 'deposit' | 'withdraw'; // 'deposit' = guardado, 'withdraw' = resgatado
  description?: string;
}

export interface PiggyBankItem {
  id: string;
  title: string; // Ex: Reserva de Emergência (6 Meses), Viagem para Europa
  category: PiggyBankCategory;
  currentAmount: number; // Valor guardado atualmente
  targetAmount: number; // Meta desejada (ex: R$ 20.000)
  targetDate?: string; // Data limite estimada (YYYY-MM-DD)
  yieldType: PiggyBankYield; // CDI (100%), Poupança (6,17%), Taxa Fixa ou Sem Rendimento
  annualYieldRate?: number; // Ex: 10.75 (% a.a.)
  color: string; // Cor temática do card
  icon?: string; // Ícone temático
  transactions: PiggyBankTransaction[];
  notes?: string;
  createdAt: string;
}

// Resumo financeiro consolidado
export interface MonthlyFinanceSummary {
  currentBalance: number;
  totalIncome: number;
  totalExpenses: number;
  totalPaidExpenses: number;
  totalPendingExpenses: number;
  overdueCount: number;
  overdueAmount: number;
  dueSoonCount: number; // vencendo em até X dias
  dueSoonAmount: number;
  totalDebtRemaining: number;
  totalDebtPaid: number;
  totalSavedInPiggyBanks: number; // Total acumulado nos cofrinhos/poupanças
  totalPiggyBanksCount: number;
  monthlyPiggyEstimatedYield: number; // Rendimento mensal estimado dos cofrinhos
}
