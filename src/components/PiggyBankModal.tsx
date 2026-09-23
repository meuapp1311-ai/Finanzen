import React, { useState, useEffect } from 'react';
import {
  X,
  PiggyBank,
  Shield,
  Plane,
  Car,
  Home,
  GraduationCap,
  TrendingUp,
  Target,
  Trash2,
  Percent,
  Calendar,
} from 'lucide-react';
import { PiggyBankCategory, PiggyBankItem, PiggyBankYield } from '../types/finance';

interface PiggyBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bank: Omit<PiggyBankItem, 'id' | 'transactions' | 'createdAt'> & { initialAmount?: number }) => void;
  onUpdate?: (id: string, bank: Partial<PiggyBankItem>) => void;
  onDelete?: (id: string) => void;
  piggyBankToEdit?: PiggyBankItem | null;
}

const CATEGORY_OPTIONS: { id: PiggyBankCategory; label: string; icon: React.FC<any> }[] = [
  { id: 'emergency', label: 'Reserva de Emergência', icon: Shield },
  { id: 'travel', label: 'Viagem & Férias', icon: Plane },
  { id: 'vehicle', label: 'Carro / Veículo', icon: Car },
  { id: 'home', label: 'Imóvel / Reforma', icon: Home },
  { id: 'poupanca', label: 'Poupança Geral', icon: PiggyBank },
  { id: 'investment', label: 'Investimento & Futuro', icon: TrendingUp },
  { id: 'education', label: 'Cursos & Estudos', icon: GraduationCap },
  { id: 'other', label: 'Outro Objetivo', icon: Target },
];

const COLOR_OPTIONS = [
  { color: '#10b981', label: 'Esmeralda' },
  { color: '#06b6d4', label: 'Ciano' },
  { color: '#3b82f6', label: 'Azul' },
  { color: '#8b5cf6', label: 'Violeta' },
  { color: '#ec4899', label: 'Rosa' },
  { color: '#f59e0b', label: 'Âmbar' },
];

export const PiggyBankModal: React.FC<PiggyBankModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  piggyBankToEdit,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PiggyBankCategory>('emergency');
  const [currentAmount, setCurrentAmount] = useState<number | ''>('');
  const [targetAmount, setTargetAmount] = useState<number | ''>('');
  const [targetDate, setTargetDate] = useState('');
  const [yieldType, setYieldType] = useState<PiggyBankYield>('cdi');
  const [customRate, setCustomRate] = useState<number | ''>(10.75);
  const [color, setColor] = useState('#10b981');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (piggyBankToEdit) {
      setTitle(piggyBankToEdit.title);
      setCategory(piggyBankToEdit.category);
      setCurrentAmount(piggyBankToEdit.currentAmount);
      setTargetAmount(piggyBankToEdit.targetAmount || '');
      setTargetDate(piggyBankToEdit.targetDate || '');
      setYieldType(piggyBankToEdit.yieldType || 'cdi');
      setCustomRate(piggyBankToEdit.annualYieldRate ?? (piggyBankToEdit.yieldType === 'poupanca' ? 6.17 : 10.75));
      setColor(piggyBankToEdit.color || '#10b981');
      setNotes(piggyBankToEdit.notes || '');
    } else {
      setTitle('');
      setCategory('emergency');
      setCurrentAmount('');
      setTargetAmount('');
      setTargetDate('');
      setYieldType('cdi');
      setCustomRate(10.75);
      setColor('#10b981');
      setNotes('');
    }
  }, [piggyBankToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const targetNum = Number(targetAmount) || 0;
    const currentNum = Number(currentAmount) || 0;

    let finalRate = Number(customRate) || 0;
    if (yieldType === 'cdi') finalRate = 10.75;
    else if (yieldType === 'poupanca') finalRate = 6.17;
    else if (yieldType === 'none') finalRate = 0;

    if (piggyBankToEdit && onUpdate) {
      onUpdate(piggyBankToEdit.id, {
        title: title.trim() || 'Meu Cofrinho',
        category,
        currentAmount: currentNum,
        targetAmount: targetNum,
        targetDate: targetDate || undefined,
        yieldType,
        annualYieldRate: finalRate,
        color,
        notes: notes.trim() || undefined,
      });
    } else {
      onSave({
        title: title.trim() || 'Meu Cofrinho',
        category,
        currentAmount: currentNum,
        initialAmount: currentNum,
        targetAmount: targetNum,
        targetDate: targetDate || undefined,
        yieldType,
        annualYieldRate: finalRate,
        color,
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-950 font-bold shadow-md"
            style={{ backgroundColor: color }}
          >
            <PiggyBank className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              {piggyBankToEdit ? 'Editar Cofrinho' : 'Novo Cofrinho / Poupança'}
            </h2>
            <p className="text-xs text-slate-400">
              Guarde valores para metas específicas, reserva ou conta poupança
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome / Título */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Nome do Cofrinho / Meta *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Reserva de Emergência, Viagem Europa, Carro Novo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Objetivo / Categoria
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {CATEGORY_OPTIONS.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-1.5 p-2 rounded-xl text-xs text-left transition-all border ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 font-medium'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Valores: Saldo Atual e Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {piggyBankToEdit ? 'Saldo Guardado Atual (R$)' : 'Valor Inicial Guardado (R$)'}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-mono">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={currentAmount}
                  onChange={(e) =>
                    setCurrentAmount(e.target.value === '' ? '' : parseFloat(e.target.value))
                  }
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Meta Desejada (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-mono">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="Ex: 10000,00"
                  value={targetAmount}
                  onChange={(e) =>
                    setTargetAmount(e.target.value === '' ? '' : parseFloat(e.target.value))
                  }
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Prazo / Data Limite */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Data Limite para Atingir a Meta (Opcional)
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Onde está guardado & Rendimento */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Onde está guardado / Rendimento
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setYieldType('cdi');
                  setCustomRate(10.75);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  yieldType === 'cdi'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
                }`}
              >
                <div className="text-xs font-semibold">100% CDI (~10,75% a.a.)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Nubank, Inter, PicPay, C6
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setYieldType('poupanca');
                  setCustomRate(6.17);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  yieldType === 'poupanca'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
                }`}
              >
                <div className="text-xs font-semibold">Poupança (~6,17% a.a.)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Caixa, BB, Itaú, Bradesco
                </div>
              </button>

              <button
                type="button"
                onClick={() => setYieldType('fixed')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  yieldType === 'fixed'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
                }`}
              >
                <div className="text-xs font-semibold">Taxa Personalizada</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  CDB promocional, LCI/LCA
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setYieldType('none');
                  setCustomRate(0);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  yieldType === 'none'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
                }`}
              >
                <div className="text-xs font-semibold">Sem Rendimento</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Dinheiro físico ou cofre
                </div>
              </button>
            </div>

            {yieldType === 'fixed' && (
              <div className="mt-2 relative">
                <Percent className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="100"
                  placeholder="Ex: 12.5% ao ano"
                  value={customRate}
                  onChange={(e) =>
                    setCustomRate(e.target.value === '' ? '' : parseFloat(e.target.value))
                  }
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            )}
          </div>

          {/* Cor Temática */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Cor do Cofrinho
            </label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.color}
                  type="button"
                  onClick={() => setColor(c.color)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c.color ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.color }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Observações (Opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Não mexer antes de Dezembro; aportar sempre no dia 10."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Rodapé e Ações */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
            {piggyBankToEdit && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(piggyBankToEdit.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
              >
                {piggyBankToEdit ? 'Salvar Alterações' : 'Criar Cofrinho'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
