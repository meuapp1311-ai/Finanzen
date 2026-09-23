import React, { useState, useMemo } from 'react';
import {
  Calculator,
  TrendingDown,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { FinancingItem } from '../types/finance';
import {
  calculateFinancingMetrics,
  formatBRL,
  simulateAmortization,
} from '../utils/financeCalculations';

interface AmortizationModalProps {
  financing: FinancingItem;
  onClose: () => void;
  onConfirmAmortization: (
    financingId: string,
    data: {
      date: string;
      amount: number;
      strategy: 'reduce_term' | 'reduce_installment';
      monthsSavedEstimate?: number;
      interestSavedEstimate?: number;
      newInstallmentAmount?: number;
    }
  ) => void;
}

export const AmortizationModal: React.FC<AmortizationModalProps> = ({
  financing,
  onClose,
  onConfirmAmortization,
}) => {
  const [strategy, setStrategy] = useState<'reduce_term' | 'reduce_installment'>('reduce_term');
  const [amount, setAmount] = useState<number>(3000);
  const [customDate, setCustomDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const metrics = useMemo(() => calculateFinancingMetrics(financing), [financing]);

  const simulation = useMemo(() => {
    return simulateAmortization(financing, Math.max(0, amount), strategy);
  }, [financing, amount, strategy]);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    onConfirmAmortization(financing.id, {
      date: customDate,
      amount,
      strategy,
      monthsSavedEstimate: simulation.installmentsEliminated,
      interestSavedEstimate: simulation.interestSavedEstimate,
      newInstallmentAmount: simulation.newInstallmentAmount,
    });
    onClose();
  };

  const quickPresets = [1000, 3000, 5000, 10000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <Calculator className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">Simulador de Amortização Extraordinária</h2>
            </div>
            <p className="text-xs text-slate-400">
              {financing.title} · Saldo Devedor: {formatBRL(metrics.estimatedRemainingBalance)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-bold px-2"
          >
            &times;
          </button>
        </div>

        {/* Strategy Selector Tabs */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Escolha o Objetivo da Amortização
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setStrategy('reduce_term')}
              className={`p-3 text-left rounded-xl border transition-all ${
                strategy === 'reduce_term'
                  ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-emerald-400">1. Reduzir Prazo</span>
                {strategy === 'reduce_term' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Elimina parcelas do final do contrato e economiza o máximo de juros bancários.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setStrategy('reduce_installment')}
              className={`p-3 text-left rounded-xl border transition-all ${
                strategy === 'reduce_installment'
                  ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-cyan-400">2. Reduzir Parcela</span>
                {strategy === 'reduce_installment' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Diminui o boleto mensal para aliviar o orçamento do dia a dia mantendo o prazo.
              </p>
            </button>
          </div>
        </div>

        {/* Amortization Amount Input */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">
            Valor a Amortizar (R$)
          </label>
          <input
            type="number"
            min="100"
            step="100"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-base font-bold font-mono text-white focus:outline-none focus:border-emerald-500"
          />

          {/* Quick preset chips */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] text-slate-500">Valores rápidos:</span>
            {quickPresets.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val)}
                className={`text-xs px-2.5 py-1 rounded-lg font-mono transition-colors ${
                  amount === val
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {formatBRL(val)}
              </button>
            ))}
          </div>
        </div>

        {/* Simulation Live Result Box */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 font-mono">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800/80">
            <span>Diagnóstico do Impacto Imediato</span>
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Simulação Dinâmica
            </span>
          </div>

          {strategy === 'reduce_term' ? (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 text-[11px] block">Parcelas Eliminadas</span>
                <span className="text-xl font-bold text-emerald-400">
                  -{simulation.installmentsEliminated} parcelas
                </span>
                <span className="text-slate-500 text-[10px] block mt-0.5">
                  do final do financiamento
                </span>
              </div>

              <div>
                <span className="text-slate-500 text-[11px] block">Novo Tempo p/ Quitar</span>
                <span className="text-xl font-bold text-white">
                  {simulation.newPayoffTimeString}
                </span>
                <span className="text-slate-500 text-[10px] block mt-0.5">
                  antes: {metrics.timeString}
                </span>
              </div>

              <div className="col-span-2 pt-2 border-t border-slate-900 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-xs block font-sans">
                    Estimativa de Juros Bancários Economizados:
                  </span>
                  <span className="text-base font-bold text-teal-300">
                    ≈ {formatBRL(simulation.interestSavedEstimate)}
                  </span>
                </div>
                <div className="text-right text-[11px] text-slate-500 font-sans">
                  Economia pura no seu bolso
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 text-[11px] block">Nova Parcela Mensal</span>
                <span className="text-xl font-bold text-cyan-400">
                  {formatBRL(simulation.newInstallmentAmount)}
                </span>
                <span className="text-slate-500 text-[10px] block mt-0.5">
                  era {formatBRL(financing.installmentAmount)}
                </span>
              </div>

              <div>
                <span className="text-slate-500 text-[11px] block">Alívio no Orçamento</span>
                <span className="text-xl font-bold text-emerald-400">
                  -{formatBRL(simulation.monthlyReductionAmount)}/mês
                </span>
                <span className="text-slate-500 text-[10px] block mt-0.5">
                  folga financeira contínua
                </span>
              </div>

              <div className="col-span-2 pt-2 border-t border-slate-900 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-xs block font-sans">
                    Total Poupança ao Longo do Contrato:
                  </span>
                  <span className="text-base font-bold text-cyan-300">
                    ≈ {formatBRL(simulation.interestSavedEstimate)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Date of Amortization */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Data do Registro
          </label>
          <input
            type="date"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Confirmar & Registrar no Contrato</span>
          </button>
        </div>
      </div>
    </div>
  );
};
