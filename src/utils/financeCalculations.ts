import { ExpenseCategory, ExpenseItem, FinancingItem, MonthlyFinanceSummary } from '../types/finance';

export const CATEGORY_DETAILS: Record<
  ExpenseCategory,
  { label: string; color: string; bgColor: string; iconName: string }
> = {
  moradia: { label: 'Moradia & Contas', color: '#38bdf8', bgColor: 'rgba(56, 189, 248, 0.15)', iconName: 'Home' },
  alimentacao: { label: 'Alimentação & Mercado', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)', iconName: 'Utensils' },
  transporte: { label: 'Transporte & Combustível', color: '#a855f7', bgColor: 'rgba(168, 85, 247, 0.15)', iconName: 'Car' },
  saude: { label: 'Saúde & Farmácia', color: '#ec4899', bgColor: 'rgba(236, 72, 153, 0.15)', iconName: 'HeartPulse' },
  lazer: { label: 'Lazer & Entretenimento', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)', iconName: 'Gamepad2' },
  educacao: { label: 'Educação & Cursos', color: '#6366f1', bgColor: 'rgba(99, 102, 241, 0.15)', iconName: 'GraduationCap' },
  assinaturas: { label: 'Assinaturas & Serviços', color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.15)', iconName: 'CreditCard' },
  dividas: { label: 'Dívidas & Empréstimos', color: '#f43f5e', bgColor: 'rgba(244, 63, 94, 0.15)', iconName: 'TrendingDown' },
  outros: { label: 'Outras Despesas', color: '#94a3b8', bgColor: 'rgba(148, 163, 184, 0.15)', iconName: 'MoreHorizontal' },
};

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value || 0);
}

export function formatDateBR(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  if (!year || !month || !day) return dateString;
  return `${day}/${month}/${year}`;
}

export type DueAlertStatus = 'overdue' | 'due_today' | 'due_soon' | 'upcoming' | 'paid';

export function getExpenseAlertStatus(
  expense: ExpenseItem,
  notifyDaysAhead = 3
): {
  status: DueAlertStatus;
  daysDiff: number;
  label: string;
  badgeClass: string;
} {
  if (expense.status === 'paid') {
    return {
      status: 'paid',
      daysDiff: 0,
      label: 'Pago',
      badgeClass: 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/60',
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [y, m, d] = expense.dueDate.split('-').map(Number);
  const dueDate = new Date(y, m - 1, d);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return {
      status: 'overdue',
      daysDiff: diffDays,
      label: `Atrasada (${overdueDays}d)`,
      badgeClass: 'text-rose-400 bg-rose-950/50 border border-rose-800/80 animate-pulse',
    };
  }

  if (diffDays === 0) {
    return {
      status: 'due_today',
      daysDiff: 0,
      label: 'Vence Hoje!',
      badgeClass: 'text-amber-300 bg-amber-950/60 border border-amber-600/80 font-semibold',
    };
  }

  if (diffDays <= notifyDaysAhead) {
    return {
      status: 'due_soon',
      daysDiff: diffDays,
      label: `Vence em ${diffDays}d`,
      badgeClass: 'text-amber-400 bg-amber-950/40 border border-amber-800/60',
    };
  }

  return {
    status: 'upcoming',
    daysDiff: diffDays,
    label: `Vence ${formatDateBR(expense.dueDate)}`,
    badgeClass: 'text-slate-400 bg-slate-800/40 border border-slate-700/50',
  };
}

export function calculateFinancingMetrics(financing: FinancingItem) {
  const totalExtraAmortized = (financing.amortizations || []).reduce((acc, a) => acc + (a.amount || 0), 0);
  
  // Total regular paid
  const regularPaid = (financing.paidInstallments || 0) * (financing.installmentAmount || 0);
  const totalPaid = regularPaid + totalExtraAmortized;

  const remainingInstallments = Math.max(0, (financing.totalInstallments || 0) - (financing.paidInstallments || 0));
  
  // Saldo devedor aproximado considerando parcelas faltantes e amortizações extras já abatidas
  const baselineRemaining = remainingInstallments * (financing.installmentAmount || 0);
  const estimatedRemainingBalance = Math.max(0, baselineRemaining);

  const totalContractValue = (financing.totalInstallments || 0) * (financing.installmentAmount || 0);
  const progressPercent = totalContractValue > 0 ? Math.min(100, Math.round((totalPaid / totalContractValue) * 100)) : 0;

  const yearsRemaining = Math.floor(remainingInstallments / 12);
  const monthsRemaining = remainingInstallments % 12;

  let timeString = '';
  if (yearsRemaining > 0 && monthsRemaining > 0) {
    timeString = `${yearsRemaining}a e ${monthsRemaining}m`;
  } else if (yearsRemaining > 0) {
    timeString = `${yearsRemaining} anos`;
  } else {
    timeString = `${monthsRemaining} meses`;
  }

  return {
    totalPaid,
    totalExtraAmortized,
    remainingInstallments,
    estimatedRemainingBalance,
    progressPercent,
    timeString,
    yearsRemaining,
    monthsRemaining,
  };
}

// Simulador de Amortização
export interface AmortizationSimulationResult {
  strategy: 'reduce_term' | 'reduce_installment';
  amortizationAmount: number;
  // Redução de prazo:
  installmentsEliminated: number;
  newRemainingInstallments: number;
  newPayoffTimeString: string;
  interestSavedEstimate: number;
  // Redução de parcela:
  newInstallmentAmount: number;
  monthlyReductionAmount: number;
}

export function simulateAmortization(
  financing: FinancingItem,
  amount: number,
  strategy: 'reduce_term' | 'reduce_installment'
): AmortizationSimulationResult {
  const currentMetrics = calculateFinancingMetrics(financing);
  const installment = financing.installmentAmount || 1;
  const annualRate = (financing.annualInterestRate || 10) / 100;
  const monthlyRate = annualRate / 12;

  if (strategy === 'reduce_term') {
    // Na redução de prazo pelo método SAC/Price, amortizar saldo direto elimina parcelas do final
    // Economiza todos os juros futuros dessas parcelas eliminadas!
    const effectiveAmortization = amount;
    // Estimativa de juros poupados: juros médios embutidos nas últimas parcelas
    const installmentsEliminated = Math.min(
      currentMetrics.remainingInstallments,
      Math.max(1, Math.round(effectiveAmortization / (installment * 0.65)))
    );
    const newRemaining = Math.max(0, currentMetrics.remainingInstallments - installmentsEliminated);
    
    // Estimativa de juros poupados
    const interestSavedEstimate = Math.round(installmentsEliminated * installment * (1 - 0.55));

    const y = Math.floor(newRemaining / 12);
    const m = newRemaining % 12;
    const newPayoffTimeString = y > 0 ? `${y}a ${m}m` : `${m} meses`;

    return {
      strategy,
      amortizationAmount: amount,
      installmentsEliminated,
      newRemainingInstallments: newRemaining,
      newPayoffTimeString,
      interestSavedEstimate,
      newInstallmentAmount: installment,
      monthlyReductionAmount: 0,
    };
  } else {
    // Redução de valor da parcela
    const remaining = currentMetrics.remainingInstallments || 1;
    // O valor amortizado reduz a base de cálculo dividida pelas parcelas restantes + juros futuros
    const monthlyReductionAmount = Math.round((amount / remaining) * (1 + monthlyRate * (remaining / 2)));
    const newInstallment = Math.max(10, Math.round(installment - monthlyReductionAmount));
    const interestSavedEstimate = Math.round(monthlyReductionAmount * remaining * 0.4);

    return {
      strategy,
      amortizationAmount: amount,
      installmentsEliminated: 0,
      newRemainingInstallments: remaining,
      newPayoffTimeString: currentMetrics.timeString,
      interestSavedEstimate,
      newInstallmentAmount: newInstallment,
      monthlyReductionAmount: installment - newInstallment,
    };
  }
}
