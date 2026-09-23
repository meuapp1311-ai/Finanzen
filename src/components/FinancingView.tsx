import React, { useState } from 'react';
import {
  Plus,
  Landmark,
  Calculator,
  Calendar,
  Percent,
  CheckCircle2,
  Clock,
  TrendingDown,
  Trash2,
  Edit2,
  HelpCircle,
  History,
} from 'lucide-react';
import { FinancingItem } from '../types/finance';
import { calculateFinancingMetrics, formatBRL } from '../utils/financeCalculations';
import { ConfirmModal } from './ConfirmModal';

interface FinancingViewProps {
  financings: FinancingItem[];
  onOpenNewFinancingModal: () => void;
  onEditFinancing: (financing: FinancingItem) => void;
  onDeleteFinancing: (id: string) => void;
  onOpenAmortizationModal: (financing: FinancingItem) => void;
}

export const FinancingView: React.FC<FinancingViewProps> = ({
  financings,
  onOpenNewFinancingModal,
  onEditFinancing,
  onDeleteFinancing,
  onOpenAmortizationModal,
}) => {
  const [selectedFinancingForHistory, setSelectedFinancingForHistory] = useState<string | null>(null);
  const [financingToDelete, setFinancingToDelete] = useState<FinancingItem | null>(null);

  // Overall totals
  let totalOriginalFinanced = 0;
  let totalAlreadyPaid = 0;
  let totalRemainingBalance = 0;

  financings.forEach((f) => {
    totalOriginalFinanced += Number(f.totalFinancedAmount) || 0;
    const m = calculateFinancingMetrics(f);
    totalAlreadyPaid += m.totalPaid;
    totalRemainingBalance += m.estimatedRemainingBalance;
  });

  const totalContract = totalAlreadyPaid + totalRemainingBalance;
  const overallProgress = totalContract > 0 ? Math.round((totalAlreadyPaid / totalContract) * 100) : 0;

  return (
    <div className="space-y-6 pb-24">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Financiamentos & Dívidas</h1>
          <p className="text-xs text-slate-400">
            Acompanhamento de quitação a longo prazo, saldo devedor e simulação de amortizações
          </p>
        </div>

        <button
          onClick={onOpenNewFinancingModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Novo Financiamento</span>
        </button>
      </div>

      {/* Top Consolidate Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Saldo Devedor Restante */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs text-slate-400 block mb-1">Saldo Devedor Total Restante</span>
          <span className="text-2xl font-bold text-amber-400 font-mono tracking-tight block">
            {formatBRL(totalRemainingBalance)}
          </span>
          <span className="text-xs text-slate-500 mt-2 block">
            {financings.length} contrato(s) ativo(s)
          </span>
        </div>

        {/* Total Já Pago */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs text-slate-400 block mb-1">Total Já Pago (Regular + Amortizações)</span>
          <span className="text-2xl font-bold text-emerald-400 font-mono tracking-tight block">
            {formatBRL(totalAlreadyPaid)}
          </span>
          <span className="text-xs text-slate-500 mt-2 block">
            {overallProgress}% do total quitado
          </span>
        </div>

        {/* Progresso Geral */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>Progresso de Liberdade Financeira</span>
              <span className="text-emerald-400 font-mono font-bold">{overallProgress}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
          <span className="text-xs text-slate-500 mt-2">
            Valor original financiado: {formatBRL(totalOriginalFinanced)}
          </span>
        </div>
      </div>

      {/* Financings List */}
      <div className="space-y-4">
        {financings.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
            <p className="text-slate-400 text-sm">Nenhum financiamento cadastrado.</p>
            <p className="text-slate-500 text-xs max-w-md mx-auto">
              Cadastre seu imóvel, veículo ou empréstimo para acompanhar a redução de saldo devedor e testar amortizações extraordinárias.
            </p>
            <button
              onClick={onOpenNewFinancingModal}
              className="text-xs text-emerald-400 font-medium hover:underline"
            >
              + Cadastrar primeiro financiamento
            </button>
          </div>
        ) : (
          financings.map((financing) => {
            const metrics = calculateFinancingMetrics(financing);
            const isHistoryOpen = selectedFinancingForHistory === financing.id;

            return (
              <div
                key={financing.id}
                className="bg-slate-900/85 border border-slate-800 rounded-2xl p-5 transition-all hover:border-slate-700 space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                      <Landmark className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-bold text-white truncate">
                          {financing.title}
                        </h2>
                        {/* Quiet Unboxed Metadata */}
                        <span className="text-xs text-slate-500 flex items-center gap-1.5">
                          <span className="capitalize">{financing.category}</span>
                          <span aria-hidden="true">·</span>
                          <span>Início {financing.startDate}</span>
                          {financing.annualInterestRate > 0 && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>{financing.annualInterestRate}% a.a.</span>
                            </>
                          )}
                        </span>
                      </div>

                      {financing.notes && (
                        <p className="text-xs text-slate-400 mt-0.5">{financing.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => onOpenAmortizationModal(financing)}
                      className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-emerald-500/10 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Calculator className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Simular / Amortizar</span>
                    </button>

                    <button
                      onClick={() => onEditFinancing(financing)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      title="Editar financiamento"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setFinancingToDelete(financing)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Excluir financiamento"
                      aria-label={`Excluir financiamento ${financing.title}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress bar visual */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400 font-medium">
                      Progresso de Quitação: {financing.paidInstallments} de {financing.totalInstallments} parcelas pagas
                    </span>
                    <span className="text-emerald-400 font-mono font-bold text-sm">
                      {metrics.progressPercent}% quitado
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-700"
                      style={{ width: `${metrics.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80 font-mono">
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                    <span className="text-slate-500 block text-[11px]">Parcela Mensal</span>
                    <span className="text-white font-bold text-sm">
                      {formatBRL(financing.installmentAmount)}
                    </span>
                    <span className="text-slate-600 block text-[10px] mt-0.5">por mês</span>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                    <span className="text-slate-500 block text-[11px]">Já Pago Total</span>
                    <span className="text-emerald-400 font-bold text-sm">
                      {formatBRL(metrics.totalPaid)}
                    </span>
                    <span className="text-slate-600 block text-[10px] mt-0.5">
                      {metrics.totalExtraAmortized > 0
                        ? `+${formatBRL(metrics.totalExtraAmortized)} extra`
                        : 'em dia'}
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                    <span className="text-slate-500 block text-[11px]">Saldo Devedor Restante</span>
                    <span className="text-amber-400 font-bold text-sm">
                      {formatBRL(metrics.estimatedRemainingBalance)}
                    </span>
                    <span className="text-slate-600 block text-[10px] mt-0.5">
                      {metrics.remainingInstallments} parcelas restantes
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                    <span className="text-slate-500 block text-[11px]">Tempo Restante</span>
                    <span className="text-cyan-300 font-bold text-sm">
                      {metrics.timeString}
                    </span>
                    <span className="text-slate-600 block text-[10px] mt-0.5">para quitação</span>
                  </div>
                </div>

                {/* Amortization history toggle */}
                {(financing.amortizations || []).length > 0 && (
                  <div className="pt-2">
                    <button
                      onClick={() =>
                        setSelectedFinancingForHistory(
                          isHistoryOpen ? null : financing.id
                        )
                      }
                      className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1.5 font-medium"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>
                        {isHistoryOpen
                          ? 'Ocultar histórico de amortizações'
                          : `Ver histórico de amortizações extras (${financing.amortizations.length})`}
                      </span>
                    </button>

                    {isHistoryOpen && (
                      <div className="mt-3 bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-2">
                        {financing.amortizations.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-xs py-1 border-b border-slate-900 last:border-b-0"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400 font-mono">{item.date}</span>
                              <span className="text-slate-200">
                                {item.strategy === 'reduce_term'
                                  ? 'Redução de Prazo'
                                  : 'Redução de Parcela'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 font-mono">
                              <span className="text-emerald-400 font-semibold">
                                +{formatBRL(item.amount)}
                              </span>
                              {item.monthsSavedEstimate && (
                                <span className="text-slate-500 text-[11px]">
                                  (-{item.monthsSavedEstimate} parcelas)
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Modal for Deleting Financing */}
      <ConfirmModal
        isOpen={!!financingToDelete}
        title="Excluir Financiamento"
        message={
          financingToDelete ? (
            <span>
              Tem certeza de que deseja excluir o financiamento{' '}
              <strong className="text-white">"{financingToDelete.title}"</strong> com parcela de{' '}
              <strong className="text-emerald-400 font-mono">
                {formatBRL(financingToDelete.installmentAmount)}
              </strong>
              ?
            </span>
          ) : null
        }
        confirmText="Excluir Financiamento"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={() => {
          if (financingToDelete) {
            onDeleteFinancing(financingToDelete.id);
            setFinancingToDelete(null);
          }
        }}
        onClose={() => setFinancingToDelete(null)}
      />
    </div>
  );
};
