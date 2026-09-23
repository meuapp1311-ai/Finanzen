import React, { useMemo, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  PlusCircle,
  Landmark,
  ShieldAlert,
  ChevronRight,
  PiggyBank,
  ArrowDownLeft,
} from 'lucide-react';
import {
  ExpenseItem,
  FinancingItem,
  IncomeItem,
  MonthlyFinanceSummary,
  ExpenseCategory,
  PiggyBankItem,
} from '../types/finance';
import { CATEGORY_DETAILS, formatBRL, getExpenseAlertStatus, calculateFinancingMetrics } from '../utils/financeCalculations';
import { NavigationTab } from './BottomNav';
import { PWAInstallButton } from './PWAInstallButton';

interface DashboardViewProps {
  summary: MonthlyFinanceSummary;
  expenses: ExpenseItem[];
  incomes: IncomeItem[];
  financings: FinancingItem[];
  piggyBanks?: PiggyBankItem[];
  onSelectTab: (tab: NavigationTab) => void;
  onOpenNewExpenseModal: () => void;
  onOpenNewIncomeModal: () => void;
  onToggleExpenseStatus: (id: string) => void;
  onOpenPiggyBankTransactionModal?: (piggyBankId?: string, defaultType?: 'deposit' | 'withdraw') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  expenses,
  incomes,
  financings,
  piggyBanks = [],
  onSelectTab,
  onOpenNewExpenseModal,
  onOpenNewIncomeModal,
  onToggleExpenseStatus,
  onOpenPiggyBankTransactionModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);

  // Group expenses by category
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { total: number; count: number; category: ExpenseCategory }> = {};
    let totalAll = 0;

    expenses.forEach((item) => {
      const amt = Number(item.amount) || 0;
      totalAll += amt;
      if (!map[item.category]) {
        map[item.category] = { total: 0, count: 0, category: item.category };
      }
      map[item.category].total += amt;
      map[item.category].count += 1;
    });

    const list = Object.values(map)
      .map((item) => ({
        ...item,
        percentage: totalAll > 0 ? (item.total / totalAll) * 100 : 0,
        meta: CATEGORY_DETAILS[item.category] || CATEGORY_DETAILS.outros,
      }))
      .sort((a, b) => b.total - a.total);

    return { list, totalAll };
  }, [expenses]);

  // Urgent expenses (overdue or due in <= 3 days)
  const urgentExpenses = useMemo(() => {
    return expenses
      .filter((e) => e.status === 'pending')
      .map((e) => ({
        ...e,
        alert: getExpenseAlertStatus(e, 3),
      }))
      .filter((e) => e.alert.status === 'overdue' || e.alert.status === 'due_soon' || e.alert.status === 'due_today')
      .sort((a, b) => a.alert.daysDiff - b.alert.daysDiff);
  }, [expenses]);

  // Overall financing progress
  const financingMetrics = useMemo(() => {
    let totalPaid = 0;
    let totalRemaining = 0;
    let totalFinanced = 0;

    financings.forEach((f) => {
      const m = calculateFinancingMetrics(f);
      totalPaid += m.totalPaid;
      totalRemaining += m.estimatedRemainingBalance;
      totalFinanced += f.totalFinancedAmount;
    });

    const overallTotal = totalPaid + totalRemaining;
    const progressPercent = overallTotal > 0 ? Math.round((totalPaid / overallTotal) * 100) : 0;

    return { totalPaid, totalRemaining, totalFinanced, progressPercent };
  }, [financings]);

  // SVG Donut calculations
  const donutSlices = useMemo(() => {
    const total = categoryBreakdown.totalAll || 1;
    let currentAngle = 0;

    return categoryBreakdown.list.map((item) => {
      const angle = (item.total / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle += angle;

      const r = 40;
      const cx = 50;
      const cy = 50;

      const startRad = (startAngle - 90) * (Math.PI / 180);
      const endRad = (endAngle - 90) * (Math.PI / 180);

      const x1 = cx + r * Math.cos(startRad);
      const y1 = cy + r * Math.sin(startRad);
      const x2 = cx + r * Math.cos(endRad);
      const y2 = cy + r * Math.sin(endRad);

      const largeArc = angle > 180 ? 1 : 0;
      const pathData =
        angle >= 359.9
          ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`
          : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

      return {
        ...item,
        pathData,
        color: item.meta.color,
      };
    });
  }, [categoryBreakdown]);

  return (
    <div className="space-y-6 pb-20">
      {/* PWA Mobile Install Invitation */}
      <PWAInstallButton variant="banner" />

      {/* Overview Top Card Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Saldo Atual */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Saldo Líquido Previsto</span>
            <div className={`p-1 rounded-lg ${summary.currentBalance >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className={`text-2xl font-bold tracking-tight font-mono ${summary.currentBalance >= 0 ? 'text-white' : 'text-rose-400'}`}>
            {formatBRL(summary.currentBalance)}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>Receitas vs Despesas</span>
            <span className={summary.currentBalance >= 0 ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
              {summary.totalIncome > 0 ? `${Math.round((summary.currentBalance / summary.totalIncome) * 100)}% margem` : '0%'}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/60 pt-1.5">
            <span>+ Cofrinho / Poupança:</span>
            <span className="font-mono text-emerald-400 font-semibold">
              {formatBRL(summary.totalSavedInPiggyBanks || 0)}
            </span>
          </div>
        </div>

        {/* Total Receitas */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total de Receitas</span>
            <button
              onClick={onOpenNewIncomeModal}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-0.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Nova</span>
            </button>
          </div>
          <div className="text-2xl font-bold tracking-tight font-mono text-emerald-400">
            {formatBRL(summary.totalIncome)}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            <span>{incomes.length} fonte(s) registradas</span>
          </div>
        </div>

        {/* Despesas Pagas */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Despesas Já Pagas</span>
            <div className="p-1 rounded-lg bg-teal-500/10 text-teal-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight font-mono text-slate-200">
            {formatBRL(summary.totalPaidExpenses)}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>{expenses.filter((e) => e.status === 'paid').length} quitadas</span>
            <span className="text-teal-400">
              {summary.totalExpenses > 0 ? `${Math.round((summary.totalPaidExpenses / summary.totalExpenses) * 100)}%` : '0%'}
            </span>
          </div>
        </div>

        {/* Total a Pagar */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total a Pagar (Pendente)</span>
            <button
              onClick={onOpenNewExpenseModal}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-0.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Nova</span>
            </button>
          </div>
          <div className="text-2xl font-bold tracking-tight font-mono text-amber-300">
            {formatBRL(summary.totalPendingExpenses)}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>{expenses.filter((e) => e.status === 'pending').length} conta(s) pendentes</span>
            {summary.overdueCount > 0 && (
              <span className="text-rose-400 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {summary.overdueCount} atrasada(s)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Cofrinho & Poupança Guardada Highlight */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-slate-900 border border-emerald-800/40 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-bold text-white">Cofrinho & Poupança Guardada</h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  {formatBRL(summary.totalSavedInPiggyBanks || 0)} guardados
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {piggyBanks.length} meta(s) ativas • Rendimento estimado de{' '}
                <span className="text-emerald-400 font-mono font-semibold">
                  +{formatBRL(summary.monthlyPiggyEstimatedYield || 0)}/mês
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onOpenPiggyBankTransactionModal && (
              <button
                onClick={() => onOpenPiggyBankTransactionModal(undefined, 'deposit')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow cursor-pointer"
              >
                <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Guardar Dinheiro</span>
              </button>
            )}
            <button
              onClick={() => onSelectTab('savings')}
              className="flex-1 sm:flex-none text-xs font-semibold text-emerald-300 hover:text-white flex items-center justify-center gap-1 bg-emerald-950/60 hover:bg-emerald-900/60 px-3 py-1.5 rounded-xl border border-emerald-800/60 transition-colors cursor-pointer"
            >
              <span>Ver Cofrinhos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {piggyBanks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 mt-3.5 pt-3 border-t border-emerald-900/40">
            {piggyBanks.slice(0, 4).map((p) => {
              const current = Number(p.currentAmount) || 0;
              const target = Number(p.targetAmount) || 0;
              const progress =
                target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 100;
              return (
                <div
                  key={p.id}
                  onClick={() => onSelectTab('savings')}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-emerald-700/60 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-200 truncate max-w-[130px]">
                      {p.title}
                    </span>
                    <span className="text-emerald-400 font-mono text-[11px] font-bold">
                      {formatBRL(current)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: p.color || '#10b981',
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>{progress}% da meta</span>
                    <span className="font-mono">{formatBRL(target)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Urgent Due Date Alert Box (If any overdue or due soon) */}
      {urgentExpenses.length > 0 && (
        <div className="bg-gradient-to-r from-rose-950/40 via-amber-950/20 to-slate-900 border border-rose-800/50 rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <ShieldAlert className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-rose-200">
                  Atenção aos Vencimentos ({urgentExpenses.length} conta{urgentExpenses.length > 1 ? 's prioritárias' : ' prioritária'})
                </h2>
                <p className="text-xs text-slate-400">
                  Pague em dia para evitar juros e multas de atraso.
                </p>
              </div>
            </div>
            <button
              onClick={() => onSelectTab('expenses')}
              className="text-xs font-medium text-rose-300 hover:text-rose-100 flex items-center gap-1 bg-rose-950/60 px-3 py-1.5 rounded-lg border border-rose-800/60 transition-colors"
            >
              <span>Ver todas despesas</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {urgentExpenses.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-200 truncate">{item.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono font-semibold text-white">
                      {formatBRL(item.amount)}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${item.alert.badgeClass}`}>
                      {item.alert.label}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onToggleExpenseStatus(item.id)}
                  className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shadow"
                >
                  Marcar Pago
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Category Distribution & Financing Teaser */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white">Distribuição de Gastos</h2>
              <p className="text-xs text-slate-400">Por categoria no mês</p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Total: {formatBRL(categoryBreakdown.totalAll)}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* SVG Donut */}
            <div className="relative w-44 h-44 flex-shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {donutSlices.map((slice, idx) => (
                  <path
                    key={idx}
                    d={slice.pathData}
                    fill={slice.color}
                    className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                    onClick={() =>
                      setSelectedCategory(selectedCategory === slice.category ? null : slice.category)
                    }
                  />
                ))}
                {/* Center hole for donut look */}
                <circle cx="50" cy="50" r="26" fill="#090d16" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Gastos</span>
                <span className="text-xs font-mono font-bold text-white">
                  {categoryBreakdown.list.length} categ.
                </span>
              </div>
            </div>

            {/* List breakdown */}
            <div className="w-full space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {categoryBreakdown.list.map((cat) => {
                const isSelected = selectedCategory === cat.category;
                return (
                  <div
                    key={cat.category}
                    onClick={() => setSelectedCategory(isSelected ? null : cat.category)}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                      isSelected ? 'bg-slate-800 border border-slate-700' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: cat.meta.color }}
                        />
                        <span className="text-slate-300 font-medium">{cat.meta.label}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-slate-100 font-semibold">{formatBRL(cat.total)}</span>
                        <span className="text-slate-500 text-[11px] w-9 text-right">
                          {cat.percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${cat.percentage}%`,
                          backgroundColor: cat.meta.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: AI Assistant Teaser & Financings Overview (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* AI Spending Cut Assistant Teaser */}
          <div className="bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-800/50 rounded-2xl p-5 relative overflow-hidden">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-semibold text-white">Assistente de Corte de Gastos</h2>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Gemini 3.8
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Descubra vazamentos de orçamento, despesas supérfluas acumuladas e saiba quanto você pode antecipar para quitar seus financiamentos mais rápido.
            </p>

            <button
              onClick={() => onSelectTab('ai')}
              className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Diagnosticar Finanças com IA</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Financings Widget */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-semibold text-white">Financiamentos Ativos</h2>
              </div>
              <button
                onClick={() => onSelectTab('financings')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
              >
                <span>Detalhes</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {financings.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">
                Nenhum financiamento cadastrado.
              </p>
            ) : (
              <div className="space-y-3.5">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400">Progresso Geral de Quitação</span>
                    <span className="text-cyan-400 font-bold font-mono">
                      {financingMetrics.progressPercent}% quitado
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${financingMetrics.progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/60 font-mono">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Já Pago (c/ amortizações)</span>
                    <span className="text-slate-200 font-semibold">
                      {formatBRL(financingMetrics.totalPaid)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Saldo Devedor Estimado</span>
                    <span className="text-amber-400 font-semibold">
                      {formatBRL(financingMetrics.totalRemaining)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectTab('financings')}
                  className="w-full py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 rounded-xl transition-colors border border-slate-700/50"
                >
                  Simular Amortização Antecipada
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
