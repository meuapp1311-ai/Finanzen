import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  CheckCircle2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { PiggyBankItem } from '../types/finance';
import { formatBRL } from '../utils/financeCalculations';

interface PiggyBankTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  piggyBanks: PiggyBankItem[];
  preSelectedPiggyBankId?: string | null;
  defaultType?: 'deposit' | 'withdraw';
  onConfirmTransaction: (
    piggyBankId: string,
    type: 'deposit' | 'withdraw',
    amount: number,
    description: string,
    date: string
  ) => void;
}

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000];

export const PiggyBankTransactionModal: React.FC<PiggyBankTransactionModalProps> = ({
  isOpen,
  onClose,
  piggyBanks,
  preSelectedPiggyBankId,
  defaultType = 'deposit',
  onConfirmTransaction,
}) => {
  const [selectedId, setSelectedId] = useState<string>('');
  const [type, setType] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (preSelectedPiggyBankId && piggyBanks.some((p) => p.id === preSelectedPiggyBankId)) {
        setSelectedId(preSelectedPiggyBankId);
      } else if (piggyBanks.length > 0) {
        setSelectedId(piggyBanks[0].id);
      }
      setType(defaultType);
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setError(null);
    }
  }, [isOpen, preSelectedPiggyBankId, defaultType, piggyBanks]);

  if (!isOpen) return null;

  const currentPiggy = piggyBanks.find((p) => p.id === selectedId);
  const currentAmount = currentPiggy ? Number(currentPiggy.currentAmount) : 0;
  const targetAmount = currentPiggy ? Number(currentPiggy.targetAmount) : 0;
  const numAmount = Number(amount) || 0;

  const remainingToGoal = Math.max(0, targetAmount - currentAmount);

  const projectedBalance =
    type === 'deposit'
      ? currentAmount + numAmount
      : Math.max(0, currentAmount - numAmount);

  const projectedProgress = targetAmount > 0
    ? Math.min(100, Math.round((projectedBalance / targetAmount) * 100))
    : 100;

  const handleQuickAdd = (val: number) => {
    setAmount((prev) => (Number(prev) || 0) + val);
    setError(null);
  };

  const handleFillRemaining = () => {
    if (remainingToGoal > 0) {
      setAmount(remainingToGoal);
      setError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) {
      setError('Selecione um cofrinho.');
      return;
    }

    if (numAmount <= 0) {
      setError('Informe um valor maior que zero.');
      return;
    }

    if (type === 'withdraw' && numAmount > currentAmount) {
      setError(`O valor de resgate não pode ser maior que o saldo guardado (${formatBRL(currentAmount)}).`);
      return;
    }

    const defaultDesc =
      type === 'deposit'
        ? 'Aporte guardado no cofrinho'
        : 'Resgate do cofrinho';

    onConfirmTransaction(
      selectedId,
      type,
      numAmount,
      description.trim() || defaultDesc,
      date
    );

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              type === 'deposit'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
            }`}
          >
            {type === 'deposit' ? (
              <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
            ) : (
              <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
            )}
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              {type === 'deposit' ? 'Guardar no Cofrinho' : 'Resgatar do Cofrinho'}
            </h2>
            <p className="text-xs text-slate-400">
              {type === 'deposit'
                ? 'Adicione uma quantia à sua poupança guardada'
                : 'Retire um valor guardado para sua conta corrente'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de Operação (Toggle Tabs) */}
          <div className="grid grid-cols-2 p-1 bg-slate-950/70 border border-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setType('deposit');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                type === 'deposit'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Guardar (+)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setType('withdraw');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                type === 'withdraw'
                  ? 'bg-sky-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Resgatar (-)</span>
            </button>
          </div>

          {/* Seleção do Cofrinho */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Cofrinho de Destino / Origem
            </label>
            <select
              value={selectedId}
              onChange={(e) => {
                setSelectedId(e.target.value);
                setError(null);
              }}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {piggyBanks.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} • Saldo: {formatBRL(p.currentAmount)} (Meta: {formatBRL(p.targetAmount)})
                </option>
              ))}
            </select>
          </div>

          {/* Valor Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-300">
                Valor da Movimentação (R$) *
              </label>
              {currentPiggy && (
                <span className="text-[11px] text-slate-400">
                  Saldo: <strong className="text-emerald-400 font-mono">{formatBRL(currentAmount)}</strong>
                </span>
              )}
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm text-slate-400 font-mono">
                R$
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                autoFocus
                placeholder="0,00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value === '' ? '' : parseFloat(e.target.value));
                  setError(null);
                }}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-base font-bold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {QUICK_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAdd(val)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] font-medium text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700/60 transition-colors"
                >
                  +{val}
                </button>
              ))}
              {type === 'deposit' && remainingToGoal > 0 && (
                <button
                  type="button"
                  onClick={handleFillRemaining}
                  className="px-2.5 py-1 rounded-lg bg-emerald-950/40 text-[11px] font-medium text-emerald-400 hover:bg-emerald-900/50 border border-emerald-800/50 transition-colors"
                >
                  Completar Meta ({formatBRL(remainingToGoal)})
                </button>
              )}
              {type === 'withdraw' && currentAmount > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(currentAmount)}
                  className="px-2.5 py-1 rounded-lg bg-sky-950/40 text-[11px] font-medium text-sky-400 hover:bg-sky-900/50 border border-sky-800/50 transition-colors"
                >
                  Resgatar Tudo ({formatBRL(currentAmount)})
                </button>
              )}
            </div>
          </div>

          {/* Impact preview */}
          {currentPiggy && numAmount > 0 && (
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Saldo projetado após {type === 'deposit' ? 'guardar' : 'resgate'}:</span>
                <span className="font-bold text-white font-mono">{formatBRL(projectedBalance)}</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    type === 'deposit' ? 'bg-emerald-400' : 'bg-sky-400'
                  }`}
                  style={{ width: `${projectedProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>{projectedProgress}% da meta atingida</span>
                {targetAmount > 0 && (
                  <span>Meta: {formatBRL(targetAmount)}</span>
                )}
              </div>
            </div>
          )}

          {/* Data & Descrição */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Data
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Motivo / Descrição
              </label>
              <input
                type="text"
                placeholder={type === 'deposit' ? 'Ex: Sobra do salário, Bônus' : 'Ex: Manutenção do carro'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Erro */}
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Rodapé e Ações */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 ${
                type === 'deposit'
                  ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-emerald-500/20'
                  : 'bg-sky-400 hover:bg-sky-300 text-slate-950 shadow-sky-500/20'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{type === 'deposit' ? 'Confirmar Aporte' : 'Confirmar Resgate'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
