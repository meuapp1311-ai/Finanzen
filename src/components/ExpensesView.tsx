import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  Trash2,
  Edit2,
  Calendar,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { ExpenseCategory, ExpenseItem, ExpenseType } from '../types/finance';
import { CATEGORY_DETAILS, formatBRL, getExpenseAlertStatus } from '../utils/financeCalculations';
import { ConfirmModal } from './ConfirmModal';

interface ExpensesViewProps {
  expenses: ExpenseItem[];
  dueAlertDays: number;
  onOpenNewExpenseModal: () => void;
  onEditExpense: (expense: ExpenseItem) => void;
  onDeleteExpense: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

type FilterOption = 'all' | 'overdue' | 'due_soon' | 'pending' | 'paid' | 'fixed' | 'variable';

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  dueAlertDays,
  onOpenNewExpenseModal,
  onEditExpense,
  onDeleteExpense,
  onToggleStatus,
}) => {
  const [filter, setFilter] = useState<FilterOption>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'amount' | 'title'>('dueDate');
  const [expenseToDelete, setExpenseToDelete] = useState<ExpenseItem | null>(null);

  // Categorized expenses with alert status
  const processedExpenses = useMemo(() => {
    return expenses.map((e) => ({
      ...e,
      alert: getExpenseAlertStatus(e, dueAlertDays),
    }));
  }, [expenses, dueAlertDays]);

  // Counts for quick filter buttons
  const counts = useMemo(() => {
    let overdue = 0;
    let dueSoon = 0;
    let pending = 0;
    let paid = 0;

    processedExpenses.forEach((item) => {
      if (item.status === 'paid') {
        paid++;
      } else {
        pending++;
        if (item.alert.status === 'overdue') overdue++;
        if (item.alert.status === 'due_soon' || item.alert.status === 'due_today') dueSoon++;
      }
    });

    return { all: expenses.length, overdue, dueSoon, pending, paid };
  }, [processedExpenses, expenses.length]);

  // Filtered and sorted expenses
  const filteredExpenses = useMemo(() => {
    return processedExpenses
      .filter((item) => {
        // Search
        if (
          searchQuery &&
          !item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !(item.notes || '').toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }

        // Category filter
        if (categoryFilter !== 'all' && item.category !== categoryFilter) {
          return false;
        }

        // Quick status filter
        if (filter === 'overdue') return item.alert.status === 'overdue';
        if (filter === 'due_soon') return item.alert.status === 'due_soon' || item.alert.status === 'due_today';
        if (filter === 'pending') return item.status === 'pending';
        if (filter === 'paid') return item.status === 'paid';
        if (filter === 'fixed') return item.type === 'fixed';
        if (filter === 'variable') return item.type === 'variable';

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'amount') return b.amount - a.amount;
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        // Default: due date
        return a.dueDate.localeCompare(b.dueDate);
      });
  }, [processedExpenses, searchQuery, categoryFilter, filter, sortBy]);

  return (
    <div className="space-y-5 pb-24">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Gestão de Despesas</h1>
          <p className="text-xs text-slate-400">
            Controle de vencimentos, contas fixas, variáveis e status de quitação
          </p>
        </div>

        <button
          onClick={onOpenNewExpenseModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nova Despesa</span>
        </button>
      </div>

      {/* Due Alert Warning Banner if overdue exists */}
      {counts.overdue > 0 && (
        <div className="bg-rose-950/40 border border-rose-800/80 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="font-semibold text-rose-300 block text-sm">
                {counts.overdue} conta(s) em atraso!
              </span>
              <span className="text-slate-400 text-[11px]">
                Priorize o pagamento dessas faturas para não acumular juros de mora e encargos.
              </span>
            </div>
          </div>
          <button
            onClick={() => setFilter('overdue')}
            className="px-3 py-1.5 bg-rose-500 text-slate-950 font-semibold rounded-lg hover:bg-rose-400 transition-colors whitespace-nowrap"
          >
            Filtrar Atrasadas
          </button>
        </div>
      )}

      {/* Search and Secondary Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-3.5 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          {/* Search Box */}
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por descrição, empresa ou notas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Category Dropdown */}
          <div className="w-full sm:w-auto flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filtrar despesas por categoria"
              className="w-full sm:w-48 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Todas Categorias</option>
              {Object.entries(CATEGORY_DETAILS).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Ordenar despesas por"
              className="w-full sm:w-40 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="dueDate">Data Vencimento</option>
              <option value="amount">Maior Valor</option>
              <option value="title">Nome / Título</option>
            </select>
          </div>
        </div>

        {/* Quick Segmented Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'Todas', count: counts.all },
            { id: 'overdue', label: 'Atrasadas', count: counts.overdue, highlight: 'text-rose-400' },
            { id: 'due_soon', label: 'Vencendo em 3d', count: counts.dueSoon, highlight: 'text-amber-400' },
            { id: 'pending', label: 'Pendentes', count: counts.pending },
            { id: 'paid', label: 'Pagas', count: counts.paid },
            { id: 'fixed', label: 'Fixas' },
            { id: 'variable', label: 'Variáveis' },
          ].map((tab) => {
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as FilterOption)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span className={tab.highlight}>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isActive ? 'bg-emerald-400 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
          <p className="text-slate-400 text-sm">Nenhuma despesa encontrada para os filtros atuais.</p>
          <button
            onClick={() => {
              setFilter('all');
              setSearchQuery('');
              setCategoryFilter('all');
            }}
            className="text-xs text-emerald-400 hover:underline"
          >
            Limpar filtros de busca
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredExpenses.map((expense) => {
            const catMeta = CATEGORY_DETAILS[expense.category] || CATEGORY_DETAILS.outros;
            const isPaid = expense.status === 'paid';
            const alert = expense.alert;

            return (
              <div
                key={expense.id}
                className={`bg-slate-900/85 border rounded-2xl p-4 transition-all hover:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  !isPaid && alert.status === 'overdue'
                    ? 'border-rose-900/70 bg-rose-950/20 shadow-md shadow-rose-950/20'
                    : !isPaid && (alert.status === 'due_soon' || alert.status === 'due_today')
                    ? 'border-amber-900/60 bg-amber-950/15'
                    : 'border-slate-800/80'
                }`}
              >
                {/* Left info */}
                <div className="flex items-start gap-3.5 min-w-0">
                  {/* Category color indicator */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm"
                    style={{ backgroundColor: catMeta.bgColor, color: catMeta.color }}
                  >
                    <Layers className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2
                        className={`text-sm font-semibold truncate ${
                          isPaid ? 'line-through text-slate-500' : 'text-slate-100'
                        }`}
                      >
                        {expense.title}
                      </h2>
                      {/* Quiet Unboxed Metadata */}
                      <span className="text-xs text-slate-500 flex items-center gap-1.5">
                        <span>{catMeta.label}</span>
                        <span aria-hidden="true">·</span>
                        <span>{expense.type === 'fixed' ? 'Fixa' : 'Variável'}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>Vencimento: {expense.dueDate}</span>
                      </span>

                      {/* Status label badge */}
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${alert.badgeClass}`}>
                        {alert.label}
                      </span>
                    </div>

                    {expense.notes && (
                      <p className="text-[11px] text-slate-500 mt-1 italic line-clamp-1">
                        {expense.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right actions: Amount, Paid Toggle & Options */}
                <div className="flex items-center justify-between sm:justify-end gap-3.5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                  <div className="text-left sm:text-right font-mono">
                    <span
                      className={`text-base font-bold ${
                        isPaid ? 'text-slate-400 line-through' : 'text-white'
                      }`}
                    >
                      {formatBRL(expense.amount)}
                    </span>
                    <span className="block text-[10px] text-slate-500 uppercase tracking-wider">
                      {isPaid ? 'Quitado' : 'A Pagar'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* 1-Click Status Toggle */}
                    <button
                      onClick={() => onToggleStatus(expense.id)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                        isPaid
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/80 hover:bg-emerald-900/60'
                          : 'bg-emerald-400 text-slate-950 hover:bg-emerald-300 shadow'
                      }`}
                      title={isPaid ? 'Clique para marcar como pendente' : 'Clique para marcar como pago'}
                    >
                      <CheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{isPaid ? 'PAGO' : 'Pagar'}</span>
                    </button>

                    {/* Edit button */}
                    <button
                      onClick={() => onEditExpense(expense)}
                      className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Editar despesa"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => setExpenseToDelete(expense)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Excluir despesa"
                      aria-label={`Excluir despesa ${expense.title}`}
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

      {/* Confirmation Modal for Deleting Expense */}
      <ConfirmModal
        isOpen={!!expenseToDelete}
        title="Excluir Despesa"
        message={
          expenseToDelete ? (
            <span>
              Tem certeza de que deseja excluir a despesa{' '}
              <strong className="text-white">"{expenseToDelete.title}"</strong> no valor de{' '}
              <strong className="text-emerald-400 font-mono">
                {formatBRL(expenseToDelete.amount)}
              </strong>
              ? Esta ação removerá a despesa do seu orçamento mensal.
            </span>
          ) : null
        }
        confirmText="Excluir Despesa"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={() => {
          if (expenseToDelete) {
            onDeleteExpense(expenseToDelete.id);
            setExpenseToDelete(null);
          }
        }}
        onClose={() => setExpenseToDelete(null)}
      />
    </div>
  );
};
