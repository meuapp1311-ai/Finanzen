import React, { useState, useEffect } from 'react';
import { FinancingItem } from '../types/finance';

interface FinancingModalProps {
  isOpen: boolean;
  financingToEdit?: FinancingItem | null;
  onClose: () => void;
  onSave: (financing: Omit<FinancingItem, 'id' | 'amortizations'>) => void;
  onUpdate?: (id: string, financing: Partial<FinancingItem>) => void;
}

export const FinancingModal: React.FC<FinancingModalProps> = ({
  isOpen,
  financingToEdit,
  onClose,
  onSave,
  onUpdate,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'imovel' | 'veiculo' | 'educacao' | 'pessoal' | 'outro'>('imovel');
  const [totalFinancedAmount, setTotalFinancedAmount] = useState<number | ''>('');
  const [annualInterestRate, setAnnualInterestRate] = useState<number | ''>(9.5);
  const [installmentAmount, setInstallmentAmount] = useState<number | ''>('');
  const [totalInstallments, setTotalInstallments] = useState<number | ''>(360);
  const [paidInstallments, setPaidInstallments] = useState<number | ''>(0);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (financingToEdit) {
      setTitle(financingToEdit.title);
      setCategory(financingToEdit.category);
      setTotalFinancedAmount(financingToEdit.totalFinancedAmount);
      setAnnualInterestRate(financingToEdit.annualInterestRate || '');
      setInstallmentAmount(financingToEdit.installmentAmount);
      setTotalInstallments(financingToEdit.totalInstallments);
      setPaidInstallments(financingToEdit.paidInstallments);
      setStartDate(financingToEdit.startDate);
      setNotes(financingToEdit.notes || '');
    } else {
      setTitle('');
      setCategory('imovel');
      setTotalFinancedAmount('');
      setAnnualInterestRate(9.5);
      setInstallmentAmount('');
      setTotalInstallments(360);
      setPaidInstallments(0);
      setStartDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
  }, [financingToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !totalFinancedAmount || !installmentAmount || !totalInstallments) return;

    const payload = {
      title,
      category,
      totalFinancedAmount: Number(totalFinancedAmount),
      annualInterestRate: Number(annualInterestRate) || 0,
      installmentAmount: Number(installmentAmount),
      totalInstallments: Number(totalInstallments),
      paidInstallments: Number(paidInstallments) || 0,
      startDate,
      notes: notes.trim() || undefined,
    };

    if (financingToEdit && onUpdate) {
      onUpdate(financingToEdit.id, payload);
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
            {financingToEdit ? 'Editar Financiamento' : 'Novo Financiamento de Longo Prazo'}
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
              Nome do Bem Financiado
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Apartamento Jardins (Caixa), Carro Corolla Cross"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Categoria do Bem
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="imovel">Imóvel (Casa, Apartamento, Terreno)</option>
                <option value="veiculo">Veículo (Carro, Moto)</option>
                <option value="educacao">Estudos (FIES, Pós-graduação)</option>
                <option value="pessoal">Empréstimo Pessoal / Consignado</option>
                <option value="outro">Outro Financiamento</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Valor Total Financiado (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                placeholder="Ex: 280000"
                value={totalFinancedAmount}
                onChange={(e) => setTotalFinancedAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Valor da Parcela Mensal (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                placeholder="Ex: 2450.00"
                value={installmentAmount}
                onChange={(e) => setInstallmentAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Taxa de Juros Anual % (opcional)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder="Ex: 9.8"
                value={annualInterestRate}
                onChange={(e) => setAnnualInterestRate(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Total de Parcelas
              </label>
              <input
                type="number"
                min="1"
                required
                placeholder="Ex: 360 ou 48"
                value={totalInstallments}
                onChange={(e) => setTotalInstallments(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Parcelas Já Quitadas
              </label>
              <input
                type="number"
                min="0"
                required
                value={paidInstallments}
                onChange={(e) => setPaidInstallments(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Data de Início
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Notas & Observações do Contrato
            </label>
            <input
              type="text"
              placeholder="Ex: Sistema SAC, amortização pelo FGTS permitida, banco Caixa"
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
              {financingToEdit ? 'Salvar Alterações' : 'Cadastrar Financiamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
