import React, { useState } from 'react';
import { useFinanceStore } from './hooks/useFinanceStore';
import { Header } from './components/Header';
import { BottomNav, NavigationTab } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { ExpensesView } from './components/ExpensesView';
import { IncomeView } from './components/IncomeView';
import { PiggyBankView } from './components/PiggyBankView';
import { FinancingView } from './components/FinancingView';
import { AiAssistantView } from './components/AiAssistantView';
import { ExpenseModal } from './components/ExpenseModal';
import { IncomeModal } from './components/IncomeModal';
import { PiggyBankModal } from './components/PiggyBankModal';
import { PiggyBankTransactionModal } from './components/PiggyBankTransactionModal';
import { FinancingModal } from './components/FinancingModal';
import { AmortizationModal } from './components/AmortizationModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ExpenseItem, FinancingItem, IncomeItem, PiggyBankItem } from './types/finance';
import { useTheme } from './context/ThemeContext';

export default function App() {
  const { isDark } = useTheme();
  const {
    profile,
    setProfile,
    incomes,
    expenses,
    financings,
    piggyBanks,
    aiAnalysis,
    setAiAnalysis,
    summary,
    addExpense,
    updateExpense,
    deleteExpense,
    toggleExpenseStatus,
    addIncome,
    updateIncome,
    deleteIncome,
    addFinancing,
    updateFinancing,
    deleteFinancing,
    recordAmortization,
    addPiggyBank,
    updatePiggyBank,
    deletePiggyBank,
    depositToPiggyBank,
    withdrawFromPiggyBank,
    resetToSampleData,
    exportData,
    importData,
  } = useFinanceStore();

  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');

  // Modal states
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<ExpenseItem | null>(null);

  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [incomeToEdit, setIncomeToEdit] = useState<IncomeItem | null>(null);

  const [financingModalOpen, setFinancingModalOpen] = useState(false);
  const [financingToEdit, setFinancingToEdit] = useState<FinancingItem | null>(null);

  const [amortizationModalFinancing, setAmortizationModalFinancing] = useState<FinancingItem | null>(null);

  // Piggy bank modal states
  const [piggyModalOpen, setPiggyModalOpen] = useState(false);
  const [piggyToEdit, setPiggyToEdit] = useState<PiggyBankItem | null>(null);

  const [piggyTransactionModalOpen, setPiggyTransactionModalOpen] = useState(false);
  const [piggyTransactionTargetId, setPiggyTransactionTargetId] = useState<string | null>(null);
  const [piggyTransactionDefaultType, setPiggyTransactionDefaultType] = useState<'deposit' | 'withdraw'>('deposit');

  // Expense Handlers
  const handleOpenNewExpense = () => {
    setExpenseToEdit(null);
    setExpenseModalOpen(true);
  };

  const handleEditExpense = (expense: ExpenseItem) => {
    setExpenseToEdit(expense);
    setExpenseModalOpen(true);
  };

  // Income Handlers
  const handleOpenNewIncome = () => {
    setIncomeToEdit(null);
    setIncomeModalOpen(true);
  };

  const handleEditIncome = (income: IncomeItem) => {
    setIncomeToEdit(income);
    setIncomeModalOpen(true);
  };

  // Financing Handlers
  const handleOpenNewFinancing = () => {
    setFinancingToEdit(null);
    setFinancingModalOpen(true);
  };

  const handleEditFinancing = (financing: FinancingItem) => {
    setFinancingToEdit(financing);
    setFinancingModalOpen(true);
  };

  const handleOpenAmortizationModal = (financing: FinancingItem) => {
    setAmortizationModalFinancing(financing);
  };

  // Piggy Bank Handlers
  const handleOpenNewPiggyBank = () => {
    setPiggyToEdit(null);
    setPiggyModalOpen(true);
  };

  const handleEditPiggyBank = (bank: PiggyBankItem) => {
    setPiggyToEdit(bank);
    setPiggyModalOpen(true);
  };

  const handleOpenPiggyBankTransactionModal = (
    piggyBankId?: string,
    defaultType: 'deposit' | 'withdraw' = 'deposit'
  ) => {
    setPiggyTransactionTargetId(piggyBankId || null);
    setPiggyTransactionDefaultType(defaultType);
    setPiggyTransactionModalOpen(true);
  };

  const handleConfirmPiggyTransaction = (
    piggyBankId: string,
    type: 'deposit' | 'withdraw',
    amount: number,
    description: string,
    date: string
  ) => {
    if (type === 'deposit') {
      depositToPiggyBank(piggyBankId, amount, description, date);
    } else {
      withdrawFromPiggyBank(piggyBankId, amount, description, date);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-['Plus_Jakarta_Sans'] antialiased selection:bg-emerald-500 transition-colors duration-200 ${
        isDark
          ? 'bg-[#090d16] text-slate-100 selection:text-slate-950'
          : 'bg-slate-50 text-slate-900 selection:text-white'
      }`}
    >
      {/* Top Header */}
      <Header
        profile={profile}
        onUpdateProfile={(updated) => setProfile((p) => ({ ...p, ...updated }))}
        onResetData={resetToSampleData}
        onExportData={exportData}
        onImportData={importData}
        activeTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab as NavigationTab)}
        totalSavedInPiggyBanks={summary.totalSavedInPiggyBanks}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            summary={summary}
            expenses={expenses}
            incomes={incomes}
            financings={financings}
            piggyBanks={piggyBanks}
            onSelectTab={setCurrentTab}
            onOpenNewExpenseModal={handleOpenNewExpense}
            onOpenNewIncomeModal={handleOpenNewIncome}
            onToggleExpenseStatus={toggleExpenseStatus}
            onOpenPiggyBankTransactionModal={handleOpenPiggyBankTransactionModal}
          />
        )}

        {currentTab === 'expenses' && (
          <ExpensesView
            expenses={expenses}
            dueAlertDays={profile.dueAlertDays || 3}
            onOpenNewExpenseModal={handleOpenNewExpense}
            onEditExpense={handleEditExpense}
            onDeleteExpense={deleteExpense}
            onToggleStatus={toggleExpenseStatus}
          />
        )}

        {currentTab === 'income' && (
          <IncomeView
            incomes={incomes}
            onOpenNewIncomeModal={handleOpenNewIncome}
            onEditIncome={handleEditIncome}
            onDeleteIncome={deleteIncome}
          />
        )}

        {currentTab === 'savings' && (
          <PiggyBankView
            piggyBanks={piggyBanks}
            onOpenNewPiggyBank={handleOpenNewPiggyBank}
            onEditPiggyBank={handleEditPiggyBank}
            onDeletePiggyBank={deletePiggyBank}
            onOpenTransactionModal={handleOpenPiggyBankTransactionModal}
          />
        )}

        {currentTab === 'financings' && (
          <FinancingView
            financings={financings}
            onOpenNewFinancingModal={handleOpenNewFinancing}
            onEditFinancing={handleEditFinancing}
            onDeleteFinancing={deleteFinancing}
            onOpenAmortizationModal={handleOpenAmortizationModal}
          />
        )}

        {currentTab === 'ai' && (
          <AiAssistantView
            incomes={incomes}
            expenses={expenses}
            financings={financings}
            piggyBanks={piggyBanks}
            profile={profile}
            aiAnalysis={aiAnalysis}
            onSetAiAnalysis={setAiAnalysis}
            onSelectTab={setCurrentTab}
          />
        )}
      </main>

      {/* Bottom Navigation (Mobile-first, touch-friendly) */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        overdueCount={summary.overdueCount}
        dueSoonCount={summary.dueSoonCount}
      />

      {/* Offline Status Toast */}
      <OfflineIndicator />

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={expenseModalOpen}
        expenseToEdit={expenseToEdit}
        onClose={() => setExpenseModalOpen(false)}
        onSave={addExpense}
        onUpdate={updateExpense}
        onDelete={deleteExpense}
      />

      {/* Income Modal */}
      <IncomeModal
        isOpen={incomeModalOpen}
        incomeToEdit={incomeToEdit}
        onClose={() => setIncomeModalOpen(false)}
        onSave={addIncome}
        onUpdate={updateIncome}
      />

      {/* Financing Modal */}
      <FinancingModal
        isOpen={financingModalOpen}
        financingToEdit={financingToEdit}
        onClose={() => setFinancingModalOpen(false)}
        onSave={addFinancing}
        onUpdate={updateFinancing}
      />

      {/* Amortization Modal */}
      {amortizationModalFinancing && (
        <AmortizationModal
          financing={amortizationModalFinancing}
          onClose={() => setAmortizationModalFinancing(null)}
          onConfirmAmortization={(financingId, data) => {
            recordAmortization(financingId, data);
            setAmortizationModalFinancing(null);
          }}
        />
      )}

      {/* Piggy Bank Creation / Edit Modal */}
      <PiggyBankModal
        isOpen={piggyModalOpen}
        piggyBankToEdit={piggyToEdit}
        onClose={() => setPiggyModalOpen(false)}
        onSave={addPiggyBank}
        onUpdate={updatePiggyBank}
        onDelete={deletePiggyBank}
      />

      {/* Piggy Bank Deposit / Withdraw Modal */}
      <PiggyBankTransactionModal
        isOpen={piggyTransactionModalOpen}
        piggyBanks={piggyBanks}
        preSelectedPiggyBankId={piggyTransactionTargetId}
        defaultType={piggyTransactionDefaultType}
        onClose={() => setPiggyTransactionModalOpen(false)}
        onConfirmTransaction={handleConfirmPiggyTransaction}
      />
    </div>
  );
}
