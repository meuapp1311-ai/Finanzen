import React, { useState, useMemo } from 'react';
import {
  Plus,
  Wallet,
  Briefcase,
  TrendingUp,
  DollarSign,
  Calendar,
  Trash2,
  Edit2,
  CheckCircle,
} from 'lucide-react';
import { IncomeCategory, IncomeFrequency, IncomeItem } from '../types/finance';
import { formatBRL } from '../utils/financeCalculations';
import { ConfirmModal } from './ConfirmModal';

interface IncomeViewProps {
  incomes: IncomeItem[];
  onOpenNewIncomeModal: () => void;
  onEditIncome: (income: IncomeItem) => void;
  onDeleteIncome: (id: string) => void;
}

const FREQUENCY_LABELS: Record<IncomeFrequency, string> = {
  monthly: 'Mensal',
  biweekly: 'Quinzenal',
  variable: 'Variável',
  one_time: 'Pontual / Única',
};

const CATEGORY_LABELS: Record<IncomeCategory, { label: string; icon: any }> = {
  salary: { label: 'Salário CLT / Pró-labore', icon: Briefcase },
  freelance: { label: 'Freelance & Serviços', icon: Wallet },
  investment: { label: 'Investimentos & Dividendos', icon: TrendingUp },
  rental: { label: 'Aluguel / Imóveis', icon: DollarSign },
  other: { label: 'Outras Fontes', icon: DollarSign },
};

export const IncomeView: React.FC<IncomeViewProps> = ({
  incomes,
  onOpenNewIncomeModal,
  onEditIncome,
  onDeleteIncome,
}) => {
  const [incomeToDelete, setIncomeToDelete] = useState<IncomeItem | null>(null);

  const metrics = useMemo(() => {
    let fixedTotal = 0;
    let variableTotal = 0;

    incomes.forEach((i) => {
      const amt = Number(i.amount) || 0;
      if (i.isFixed) {
        fixedTotal += amt;
      } else {
        variableTotal += amt;
      }
    });

    const total = fixedTotal + variableTotal;
    return { total, fixedTotal, variableTotal };
  }, [incomes]);

  return (
    <div className="space-y-6 pb-24">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Registro de Renda</h1>
          <p className="text-xs text-slate-400">
            Cadastre salário, rendimentos de aplicações, trabalhos freelancers e fontes de renda
          </p>
        </div>

        <button
          onClick={onOpenNewIncomeModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nova Fonte de Renda</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Renda */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs text-slate-400 block mb-1">Renda Total Mensal</span>
          <span className="text-2xl font-bold text-emerald-400 font-mono tracking-tight block">
            {formatBRL(metrics.total)}
          </span>
          <span className="text-xs text-slate-500 mt-2 block">
            {incomes.length} fonte(s) ativas
          </span>
        </div>

        {/* Renda Fixa */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs text-slate-400 block mb-1">Renda Fixa Garantida</span>
          <span className="text-2xl font-bold text-teal-300 font-mono tracking-tight block">
            {formatBRL(metrics.fixedTotal)}
          </span>
          <span className="text-xs text-slate-500 mt-2 block">
            {metrics.total > 0 ? `${Math.round((metrics.fixedTotal / metrics.total) * 100)}% da renda total` : '0%'}
          </span>
        </div>

        {/* Renda Variável */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs text-slate-400 block mb-1">Renda Variável / Extras</span>
          <span className="text-2xl font-bold text-cyan-400 font-mono tracking-tight block">
            {formatBRL(metrics.variableTotal)}
          </span>
          <span className="text-xs text-slate-500 mt-2 block">
            {metrics.total > 0 ? `${Math.round((metrics.variableTotal / metrics.total) * 100)}% da renda total` : '0%'}
          </span>
        </div>
      </div>

      {/* Incomes List */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-200">Fontes de Renda Cadastradas</h2>

        {incomes.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
            <p className="text-slate-400 text-sm">Nenhuma fonte de renda cadastrada ainda.</p>
            <button
              onClick={onOpenNewIncomeModal}
              className="text-xs text-emerald-400 font-medium hover:underline"
            >
              + Adicionar primeiro salário ou renda
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {incomes.map((income) => {
              const catConfig = CATEGORY_LABELS[income.category] || CATEGORY_LABELS.other;
              const Icon = catConfig.icon;

              return (
                <div
                  key={income.id}
                  className="bg-slate-900/85 border border-slate-800/80 rounded-2xl p-4 transition-all hover:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-white truncate">
                          {income.title}
                        </h3>
                        {/* Quiet Unboxed Metadata */}
                        <span className="text-xs text-slate-500 flex items-center gap-1.5">
                          <span>{catConfig.label}</span>
                          <span aria-hidden="true">·</span>
                          <span>{income.isFixed ? 'Renda Fixa' : 'Renda Variável'}</span>
                          <span aria-hidden="true">·</span>
                          <span>{FREQUENCY_LABELS[income.frequency]}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>Recebimento: {income.receivedDate}</span>
                        </span>
                      </div>

                      {income.notes && (
                        <p className="text-[11px] text-slate-500 mt-1 italic line-clamp-1">
                          {income.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right side: Amount & Controls */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                    <div className="text-left sm:text-right font-mono">
                      <span className="text-base font-bold text-emerald-400">
                        {formatBRL(income.amount)}
                      </span>
                      <span className="block text-[10px] text-slate-500 uppercase tracking-wider">
                        {FREQUENCY_LABELS[income.frequency]}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditIncome(income)}
                        className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Editar renda"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setIncomeToDelete(income)}
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Excluir renda"
                        aria-label={`Excluir fonte de renda ${income.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal for Deleting Income */}
      <ConfirmModal
        isOpen={!!incomeToDelete}
        title="Excluir Fonte de Renda"
        message={
          incomeToDelete ? (
            <span>
              Tem certeza de que deseja excluir a fonte de renda{' '}
              <strong className="text-white">"{incomeToDelete.title}"</strong> no valor de{' '}
              <strong className="text-emerald-400 font-mono">
                {formatBRL(incomeToDelete.amount)}
              </strong>
              ?
            </span>
          ) : null
        }
        confirmText="Excluir Renda"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={() => {
          if (incomeToDelete) {
            onDeleteIncome(incomeToDelete.id);
            setIncomeToDelete(null);
          }
        }}
        onClose={() => setIncomeToDelete(null)}
      />
    </div>
  );
};
