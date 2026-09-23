import React from 'react';
import {
  X,
  PiggyBank,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Clock,
} from 'lucide-react';
import { PiggyBankItem } from '../types/finance';
import { formatBRL } from '../utils/financeCalculations';

interface PiggyBankHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  piggyBank: PiggyBankItem | null;
}

export const PiggyBankHistoryModal: React.FC<PiggyBankHistoryModalProps> = ({
  isOpen,
  onClose,
  piggyBank,
}) => {
  if (!isOpen || !piggyBank) return null;

  const transactions = piggyBank.transactions || [];
  const totalDeposits = transactions
    .filter((t) => t.type === 'deposit')
    .reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const totalWithdrawals = transactions
    .filter((t) => t.type === 'withdraw')
    .reduce((s, t) => s + (Number(t.amount) || 0), 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-950 font-bold shadow-md"
            style={{ backgroundColor: piggyBank.color || '#10b981' }}
          >
            <PiggyBank className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">{piggyBank.title}</h2>
            <p className="text-xs text-slate-400">
              Extrato completo de depósitos e resgates guardados
            </p>
          </div>
        </div>

        {/* Resumo rápido do extrato */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800 mb-4">
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Saldo Atual
            </div>
            <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
              {formatBRL(piggyBank.currentAmount)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Total Guardado
            </div>
            <div className="text-xs font-semibold text-white font-mono mt-0.5">
              {formatBRL(totalDeposits)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Total Resgatado
            </div>
            <div className="text-xs font-semibold text-sky-400 font-mono mt-0.5">
              {formatBRL(totalWithdrawals)}
            </div>
          </div>
        </div>

        {/* Lista de Movimentações */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              <Clock className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              Nenhuma movimentação registrada ainda para este cofrinho.
            </div>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      tx.type === 'deposit'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                    }`}
                  >
                    {tx.type === 'deposit' ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">
                      {tx.description || (tx.type === 'deposit' ? 'Aporte guardado' : 'Resgate')}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(tx.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                      <span className="text-slate-600">•</span>
                      <span className={tx.type === 'deposit' ? 'text-emerald-400' : 'text-sky-400'}>
                        {tx.type === 'deposit' ? 'Depósito' : 'Saque'}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={`text-sm font-bold font-mono ${
                    tx.type === 'deposit' ? 'text-emerald-400' : 'text-sky-400'
                  }`}
                >
                  {tx.type === 'deposit' ? '+' : '-'} {formatBRL(tx.amount)}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-4 mt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
