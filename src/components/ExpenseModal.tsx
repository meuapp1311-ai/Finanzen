import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { ExpenseCategory, ExpenseItem, ExpenseType, ExpenseStatus } from '../types/finance';
import { CATEGORY_DETAILS } from '../utils/financeCalculations';

interface ExpenseModalProps {
  isOpen: boolean;
  expenseToEdit?: ExpenseItem | null;
  onClose: () => void;
  onSave: (expense: Omit<ExpenseItem, 'id'>) => void;
  onUpdate?: (id: string, expense: Partial<ExpenseItem>) => void;
  onDelete?: (id: string) => void;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  expenseToEdit,
  onClose,
  onSave,
  onUpdate,
  onDelete,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ExpenseCategory>('alimentacao');
  const [type, setType] = useState<ExpenseType>('variable');
  const [status, setStatus] = useState<ExpenseStatus>('pending');
  const [isRecurring, setIsRecurring] = useState(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (expenseToEdit) {
      setTitle(expenseToEdit.title);
      setAmount(expenseToEdit.amount);
      setDueDate(expenseToEdit.dueDate);
      setCategory(expenseToEdit.category);
      setType(expenseToEdit.type);
      setStatus(expenseToEdit.status);
      setIsRecurring(expenseToEdit.isRecurring);
      setNotes(expenseToEdit.notes || '');
    } else {
      setTitle('');
      setAmount('');
      setDueDate(new Date().toISOString().split('T')[0]);
      setCategory('alimentacao');
      setType('variable');
      setStatus('pending');
      setIsRecurring(true);
      setNotes('');
    }
  }, [expenseToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    const payload = {
      title,
      amount: Number(amount),
      dueDate,
      category,
      type,
      status,
      isRecurring,
      notes: notes.trim() || undefined,
    };

    if (expenseToEdit && onUpdate) {
      onUpdate(expenseToEdit.id, payload);
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
            {expenseToEdit ? 'Editar Despesa' : 'Nova Despesa'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-bold px-2"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Descrição / Nome da Despesa
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Aluguel, Supermercado, Conta de Luz"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Amount & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Valor (R$)
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
                Data de Vencimento
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Category & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {Object.entries(CATEGORY_DETAILS).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Tipo de Gasto
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ExpenseType)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="fixed">Fixo (Contrato, mensalidade)</option>
                <option value="variable">Variável (Consumo, compras)</option>
              </select>
            </div>
          </div>

          {/* Status & Recurring */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Status Atual
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('pending')}
                  className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    status === 'pending'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  Pendente
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('paid')}
                  className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    status === 'paid'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  PAGO
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isRecurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-0"
              />
              <label htmlFor="isRecurring" className="text-slate-300 cursor-pointer select-none">
                Despesa Recorrente (mensal)
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Observações / Notas (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Código de barras, boleto via app, parcelado em 3x"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
            {expenseToEdit && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(expenseToEdit.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                title="Excluir despesa"
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
                {expenseToEdit ? 'Salvar Alterações' : 'Cadastrar Despesa'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
