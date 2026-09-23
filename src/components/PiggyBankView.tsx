import React, { useState } from 'react';
import {
  PiggyBank,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Shield,
  Plane,
  Car,
  Home,
  GraduationCap,
  Target,
  Clock,
  History,
  Pencil,
  Trash2,
  Calendar,
  Sparkles,
  Percent,
} from 'lucide-react';
import { PiggyBankCategory, PiggyBankItem } from '../types/finance';
import { formatBRL } from '../utils/financeCalculations';
import { ConfirmModal } from './ConfirmModal';
import { PiggyBankHistoryModal } from './PiggyBankHistoryModal';

interface PiggyBankViewProps {
  piggyBanks: PiggyBankItem[];
  onOpenNewPiggyBank: () => void;
  onEditPiggyBank: (bank: PiggyBankItem) => void;
  onDeletePiggyBank: (id: string) => void;
  onOpenTransactionModal: (piggyBankId?: string, defaultType?: 'deposit' | 'withdraw') => void;
}

const CATEGORY_ICONS: Record<PiggyBankCategory, React.FC<any>> = {
  emergency: Shield,
  travel: Plane,
  vehicle: Car,
  home: Home,
  poupanca: PiggyBank,
  investment: TrendingUp,
  education: GraduationCap,
  other: Target,
};

const CATEGORY_LABELS: Record<PiggyBankCategory, string> = {
  emergency: 'Reserva de Emergência',
  travel: 'Viagem & Férias',
  vehicle: 'Carro / Veículo',
  home: 'Imóvel / Reforma',
  poupanca: 'Poupança Geral',
  investment: 'Investimento & Futuro',
  education: 'Cursos & Estudos',
  other: 'Outro Objetivo',
};

export const PiggyBankView: React.FC<PiggyBankViewProps> = ({
  piggyBanks,
  onOpenNewPiggyBank,
  onEditPiggyBank,
  onDeletePiggyBank,
  onOpenTransactionModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [piggyToDelete, setPiggyToDelete] = useState<PiggyBankItem | null>(null);
  const [selectedForHistory, setSelectedForHistory] = useState<PiggyBankItem | null>(null);

  // Consolidate totals
  const totalSaved = piggyBanks.reduce((s, p) => s + (Number(p.currentAmount) || 0), 0);
  const totalTarget = piggyBanks.reduce((s, p) => s + (Number(p.targetAmount) || 0), 0);
  const totalProgress = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

  // Monthly yield
  const totalMonthlyYield = piggyBanks.reduce((sum, item) => {
    const amt = Number(item.currentAmount) || 0;
    let annualRate = item.annualYieldRate;
    if (annualRate === undefined) {
      if (item.yieldType === 'cdi') annualRate = 10.75;
      else if (item.yieldType === 'poupanca') annualRate = 6.17;
      else annualRate = 0;
    }
    const monthlyRate = (annualRate / 100) / 12;
    return sum + amt * monthlyRate;
  }, 0);

  // Filtered list
  const filteredPiggyBanks = piggyBanks.filter((p) => {
    if (selectedCategory === 'all') return true;
    return p.category === selectedCategory;
  });

  return (
    <div className="space-y-6 pb-24">
      {/* Header & Main Call to Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Cofrinho & Poupança Guardada
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {piggyBanks.length} {piggyBanks.length === 1 ? 'meta ativa' : 'metas ativas'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Guarde valores separados para emergências, metas de curto e longo prazo ou poupança
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onOpenTransactionModal(undefined, 'deposit')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Guardar Dinheiro</span>
          </button>

          <button
            onClick={() => onOpenTransactionModal(undefined, 'withdraw')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-sky-400 hover:text-white bg-sky-950/40 hover:bg-sky-900/60 border border-sky-800/60 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            <span>Resgatar</span>
          </button>

          <button
            onClick={onOpenNewPiggyBank}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Novo Cofrinho</span>
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Guardado */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/80 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Total Guardado no Cofrinho</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono tracking-tight">
            {formatBRL(totalSaved)}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
            <span>Objetivo total:</span>
            <strong className="text-slate-300 font-mono">{formatBRL(totalTarget)}</strong>
          </div>
        </div>

        {/* Card 2: Progresso Geral das Metas */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/80 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Progresso Geral</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/15 flex items-center justify-center text-sky-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{totalProgress}%</span>
            <span className="text-xs text-slate-400">alcançado</span>
          </div>
          <div className="mt-2.5 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>

        {/* Card 3: Rendimento Estimado */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/80 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Rendimento Estimado</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono tracking-tight">
            +{formatBRL(totalMonthlyYield)}
            <span className="text-xs font-normal text-slate-400"> / mês</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Aproximadamente <strong className="text-slate-300 font-mono">+{formatBRL(totalMonthlyYield * 12)}</strong> ao ano
          </div>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-colors ${
            selectedCategory === 'all'
              ? 'bg-emerald-500 text-slate-950 font-semibold'
              : 'bg-slate-800/80 text-slate-400 hover:text-white'
          }`}
        >
          Todos ({piggyBanks.length})
        </button>

        {Object.entries(CATEGORY_LABELS).map(([catKey, label]) => {
          const count = piggyBanks.filter((p) => p.category === catKey).length;
          if (count === 0 && selectedCategory !== catKey) return null;
          return (
            <button
              key={catKey}
              onClick={() => setSelectedCategory(catKey)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-colors ${
                selectedCategory === catKey
                  ? 'bg-emerald-500 text-slate-950 font-semibold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Cofrinho Cards Grid */}
      {filteredPiggyBanks.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/60 rounded-2xl border border-slate-800 p-8">
          <PiggyBank className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">
            Nenhum cofrinho cadastrado nesta categoria
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
            Comece a guardar dinheiro para suas metas pessoais, reserva de segurança ou poupança de emergência.
          </p>
          <button
            onClick={onOpenNewPiggyBank}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Primeiro Cofrinho</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPiggyBanks.map((piggy) => {
            const Icon = CATEGORY_ICONS[piggy.category] || Target;
            const current = Number(piggy.currentAmount) || 0;
            const target = Number(piggy.targetAmount) || 0;
            const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 100;
            const remaining = Math.max(0, target - current);

            // Estimated monthly yield for this piggy
            let rate = piggy.annualYieldRate;
            if (rate === undefined) {
              rate = piggy.yieldType === 'poupanca' ? 6.17 : piggy.yieldType === 'cdi' ? 10.75 : 0;
            }
            const monthlyYield = current * ((rate / 100) / 12);

            return (
              <div
                key={piggy.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg relative group"
              >
                {/* Accent top stripe */}
                <div
                  className="absolute top-0 left-5 right-5 h-1 rounded-b-full"
                  style={{ backgroundColor: piggy.color || '#10b981' }}
                />

                <div>
                  {/* Top card header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-950 font-bold shadow-md shrink-0"
                        style={{ backgroundColor: piggy.color || '#10b981' }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {piggy.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-400">
                            {CATEGORY_LABELS[piggy.category]}
                          </span>
                          <span className="text-slate-600 text-xs">•</span>
                          <span className="text-[10px] font-mono text-emerald-400 font-medium">
                            {piggy.yieldType === 'cdi' && '100% CDI (~10,75% a.a.)'}
                            {piggy.yieldType === 'poupanca' && 'Poupança (~6,17% a.a.)'}
                            {piggy.yieldType === 'fixed' && `${rate}% a.a.`}
                            {piggy.yieldType === 'none' && 'Sem rendimento'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick options: Edit, Delete */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setSelectedForHistory(piggy)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Ver extrato de movimentações"
                      >
                        <History className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onEditPiggyBank(piggy)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Editar cofrinho"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setPiggyToDelete(piggy)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Excluir cofrinho"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="mt-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">
                          Saldo Guardado
                        </div>
                        <div className="text-xl font-bold text-white font-mono mt-0.5">
                          {formatBRL(current)}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">
                          Meta
                        </div>
                        <div className="text-sm font-semibold text-slate-300 font-mono mt-0.5">
                          {formatBRL(target)}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-emerald-400 font-semibold">{progress}% atingido</span>
                        <span className="text-slate-400">
                          {remaining > 0 ? `Faltam ${formatBRL(remaining)}` : 'Meta alcançada! 🎉'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${progress}%`,
                            backgroundColor: piggy.color || '#10b981',
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Yield & Date Badges */}
                  <div className="flex items-center justify-between gap-2 mt-3 text-xs">
                    {monthlyYield > 0 ? (
                      <div className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded-lg border border-emerald-900/50">
                        <TrendingUp className="w-3 h-3" />
                        <span>Rendendo ~{formatBRL(monthlyYield)}/mês</span>
                      </div>
                    ) : (
                      <div />
                    )}

                    {piggy.targetDate && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Calendar className="w-3 h-3" />
                        <span>
                          Meta: {new Date(piggy.targetDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Card Actions: Guardar (+) & Resgatar (-) */}
                <div className="grid grid-cols-2 gap-2 pt-4 mt-3 border-t border-slate-800/80">
                  <button
                    onClick={() => onOpenTransactionModal(piggy.id, 'deposit')}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Guardar (+)</span>
                  </button>

                  <button
                    onClick={() => onOpenTransactionModal(piggy.id, 'withdraw')}
                    disabled={current <= 0}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                      current <= 0
                        ? 'opacity-40 bg-slate-800/40 text-slate-500 border border-slate-800 cursor-not-allowed'
                        : 'bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30 cursor-pointer'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Resgatar (-)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* History Statement Modal */}
      <PiggyBankHistoryModal
        isOpen={!!selectedForHistory}
        piggyBank={selectedForHistory}
        onClose={() => setSelectedForHistory(null)}
      />

      {/* Confirmation Modal for Deleting Piggy Bank */}
      <ConfirmModal
        isOpen={!!piggyToDelete}
        title="Excluir Cofrinho"
        message={
          piggyToDelete ? (
            <span>
              Tem certeza de que deseja excluir o cofrinho{' '}
              <strong className="text-white">"{piggyToDelete.title}"</strong> com saldo guardado de{' '}
              <strong className="text-emerald-400 font-mono">
                {formatBRL(piggyToDelete.currentAmount)}
              </strong>
              ? O histórico de movimentações também será removido.
            </span>
          ) : null
        }
        confirmText="Excluir Cofrinho"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={() => {
          if (piggyToDelete) {
            onDeletePiggyBank(piggyToDelete.id);
            setPiggyToDelete(null);
          }
        }}
        onClose={() => setPiggyToDelete(null)}
      />
    </div>
  );
};
