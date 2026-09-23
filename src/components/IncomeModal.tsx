import React, { useState, useEffect } from 'react';
import { IncomeCategory, IncomeFrequency, IncomeItem } from '../types/finance';

interface IncomeModalProps {
  isOpen: boolean;
  incomeToEdit?: IncomeItem | null;
  onClose: () => void;
  onSave: (income: Omit<IncomeItem, 'id'>) => void;
  onUpdate?: (id: string, income: Partial<IncomeItem>) => void;
}

export const IncomeModal: React.FC<IncomeModalProps> = ({
  isOpen,
  incomeToEdit,
  onClose,
  onSave,
  onUpdate,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<IncomeCategory>('salary');
  const [frequency, setFrequency] = useState<IncomeFrequency>('monthly');
  const [isFixed, setIsFixed] = useState(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (incomeToEdit) {
      setTitle(incomeToEdit.title);
      setAmount(incomeToEdit.amount);
      setReceivedDate(incomeToEdit.receivedDate);
      setCategory(incomeToEdit.category);
      setFrequency(incomeToEdit.frequency);
      setIsFixed(incomeToEdit.isFixed);
      setNotes(incomeToEdit.notes || '');
    } else {
      setTitle('');
      setAmount('');
      setReceivedDate(new Date().toISOString().split('T')[0]);
      setCategory('salary');
      setFrequency('monthly');
      setIsFixed(true);
      setNotes('');
    }
  }, [incomeToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    const payload = {
      title,
      amount: Number(amount),
      receivedDate,
      category,
      frequency,
      isFixed,
      notes: notes.trim() || undefined,
    };

    if (incomeToEdit && onUpdate) {
      onUpdate(incomeToEdit.id, payload);
    } else {
      onSave(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">
            {incomeToEdit ? 'Editar Fonte de Renda' : 'Nova Fonte de Renda'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-bold px-2"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Descrição / Nome da Entrada
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Salário Empresa, Consultoria UI, Rendimentos FII"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Valor Líquido Recebido (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Data do Recebimento
              </label>
              <input
                type="date"
                required
                value={receivedDate}
                onChange={(e) => setReceivedDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IncomeCategory)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="salary">Salário / Pró-labore</option>
                <option value="freelance">Freelance / Prestação de Serviço</option>
                <option value="investment">Investimentos / Dividendos</option>
                <option value="rental">Aluguel / Imóveis</option>
                <option value="other">Outras Fontes</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Frequência
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as IncomeFrequency)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="monthly">Mensal</option>
                <option value="biweekly">Quinzenal</option>
                <option value="variable">Variável</option>
                <option value="one_time">Pontual / Única</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Natureza da Renda
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFixed(true)}
                className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-all ${
                  isFixed
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Renda Fixa Garantida
              </button>
              <button
                type="button"
                onClick={() => setIsFixed(false)}
                className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-all ${
                  !isFixed
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Renda Variável / Extra
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Notas Adicionais (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Depositado no banco X, tributação descontada"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
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
              {incomeToEdit ? 'Salvar Alterações' : 'Cadastrar Renda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
