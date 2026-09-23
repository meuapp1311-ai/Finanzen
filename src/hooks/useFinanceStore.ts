import { useState, useEffect, useMemo } from 'react';
import {
  ExpenseItem,
  FinancingItem,
  IncomeItem,
  MonthlyFinanceSummary,
  UserProfile,
  AmortizationRecord,
  AIFinancialAnalysis,
  PiggyBankItem,
  PiggyBankTransaction,
} from '../types/finance';
import {
  INITIAL_EXPENSES,
  INITIAL_FINANCINGS,
  INITIAL_INCOMES,
  INITIAL_USER_PROFILE,
  INITIAL_PIGGY_BANKS,
} from '../utils/sampleData';
import { calculateFinancingMetrics, getExpenseAlertStatus } from '../utils/financeCalculations';

const STORAGE_KEYS = {
  PROFILE: 'finanzen_profile_v1',
  INCOMES: 'finanzen_incomes_v1',
  EXPENSES: 'finanzen_expenses_v1',
  FINANCINGS: 'finanzen_financings_v1',
  PIGGY_BANKS: 'finanzen_piggy_banks_v1',
  AI_ANALYSIS: 'finanzen_ai_analysis_v1',
};

export function useFinanceStore() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return saved ? JSON.parse(saved) : INITIAL_USER_PROFILE;
    } catch {
      return INITIAL_USER_PROFILE;
    }
  });

  const [incomes, setIncomes] = useState<IncomeItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INCOMES);
      return saved ? JSON.parse(saved) : INITIAL_INCOMES;
    } catch {
      return INITIAL_INCOMES;
    }
  });

  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  });

  const [financings, setFinancings] = useState<FinancingItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FINANCINGS);
      return saved ? JSON.parse(saved) : INITIAL_FINANCINGS;
    } catch {
      return INITIAL_FINANCINGS;
    }
  });

  const [piggyBanks, setPiggyBanks] = useState<PiggyBankItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PIGGY_BANKS);
      return saved ? JSON.parse(saved) : INITIAL_PIGGY_BANKS;
    } catch {
      return INITIAL_PIGGY_BANKS;
    }
  });

  const [aiAnalysis, setAiAnalysis] = useState<AIFinancialAnalysis | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AI_ANALYSIS);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FINANCINGS, JSON.stringify(financings));
  }, [financings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PIGGY_BANKS, JSON.stringify(piggyBanks));
  }, [piggyBanks]);

  useEffect(() => {
    if (aiAnalysis) {
      localStorage.setItem(STORAGE_KEYS.AI_ANALYSIS, JSON.stringify(aiAnalysis));
    }
  }, [aiAnalysis]);

  // Consolidated Financial Metrics
  const summary: MonthlyFinanceSummary = useMemo(() => {
    const totalIncome = incomes.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    let totalPaidExpenses = 0;
    let totalPendingExpenses = 0;
    let overdueCount = 0;
    let overdueAmount = 0;
    let dueSoonCount = 0;
    let dueSoonAmount = 0;

    expenses.forEach((item) => {
      const amt = Number(item.amount) || 0;
      if (item.status === 'paid') {
        totalPaidExpenses += amt;
      } else {
        totalPendingExpenses += amt;
        const alert = getExpenseAlertStatus(item, profile.dueAlertDays || 3);
        if (alert.status === 'overdue') {
          overdueCount++;
          overdueAmount += amt;
        } else if (alert.status === 'due_soon' || alert.status === 'due_today') {
          dueSoonCount++;
          dueSoonAmount += amt;
        }
      }
    });

    let totalDebtRemaining = 0;
    let totalDebtPaid = 0;

    financings.forEach((f) => {
      const metrics = calculateFinancingMetrics(f);
      totalDebtRemaining += metrics.estimatedRemainingBalance;
      totalDebtPaid += metrics.totalPaid;
    });

    const currentBalance = totalIncome - totalExpenses;

    // Cofrinho / Poupança metrics
    const totalSavedInPiggyBanks = piggyBanks.reduce(
      (sum, item) => sum + (Number(item.currentAmount) || 0),
      0
    );
    const totalPiggyBanksCount = piggyBanks.length;

    // Estimated monthly yield across all piggy banks
    const monthlyPiggyEstimatedYield = piggyBanks.reduce((sum, item) => {
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

    return {
      currentBalance,
      totalIncome,
      totalExpenses,
      totalPaidExpenses,
      totalPendingExpenses,
      overdueCount,
      overdueAmount,
      dueSoonCount,
      dueSoonAmount,
      totalDebtRemaining,
      totalDebtPaid,
      totalSavedInPiggyBanks,
      totalPiggyBanksCount,
      monthlyPiggyEstimatedYield,
    };
  }, [incomes, expenses, financings, piggyBanks, profile.dueAlertDays]);

  // Expenses CRUD
  const addExpense = (expense: Omit<ExpenseItem, 'id'>) => {
    const newItem: ExpenseItem = {
      ...expense,
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setExpenses((prev) => [newItem, ...prev]);
  };

  const updateExpense = (id: string, updated: Partial<ExpenseItem>) => {
    setExpenses((prev) => prev.map((item) => (item.id === id ? { ...item, ...updated } : item)));
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleExpenseStatus = (id: string) => {
    setExpenses((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newStatus = item.status === 'paid' ? 'pending' : 'paid';
        return {
          ...item,
          status: newStatus,
          paidAt: newStatus === 'paid' ? new Date().toISOString().split('T')[0] : undefined,
        };
      })
    );
  };

  // Incomes CRUD
  const addIncome = (income: Omit<IncomeItem, 'id'>) => {
    const newItem: IncomeItem = {
      ...income,
      id: `inc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setIncomes((prev) => [newItem, ...prev]);
  };

  const updateIncome = (id: string, updated: Partial<IncomeItem>) => {
    setIncomes((prev) => prev.map((item) => (item.id === id ? { ...item, ...updated } : item)));
  };

  const deleteIncome = (id: string) => {
    setIncomes((prev) => prev.filter((item) => item.id !== id));
  };

  // Financings CRUD
  const addFinancing = (financing: Omit<FinancingItem, 'id' | 'amortizations'>) => {
    const newItem: FinancingItem = {
      ...financing,
      id: `fin-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      amortizations: [],
    };
    setFinancings((prev) => [newItem, ...prev]);
  };

  const updateFinancing = (id: string, updated: Partial<FinancingItem>) => {
    setFinancings((prev) => prev.map((item) => (item.id === id ? { ...item, ...updated } : item)));
  };

  const deleteFinancing = (id: string) => {
    setFinancings((prev) => prev.filter((item) => item.id !== id));
  };

  const recordAmortization = (financingId: string, amortData: Omit<AmortizationRecord, 'id'>) => {
    const newRecord: AmortizationRecord = {
      ...amortData,
      id: `amort-${Date.now()}`,
    };

    setFinancings((prev) =>
      prev.map((item) => {
        if (item.id !== financingId) return item;

        let updatedTotalInstallments = item.totalInstallments;
        let updatedInstallmentAmount = item.installmentAmount;

        if (amortData.strategy === 'reduce_term' && amortData.monthsSavedEstimate) {
          // Reduces total installments needed
          updatedTotalInstallments = Math.max(
            item.paidInstallments + 1,
            item.totalInstallments - amortData.monthsSavedEstimate
          );
        } else if (amortData.strategy === 'reduce_installment' && amortData.newInstallmentAmount) {
          updatedInstallmentAmount = amortData.newInstallmentAmount;
        }

        return {
          ...item,
          totalInstallments: updatedTotalInstallments,
          installmentAmount: updatedInstallmentAmount,
          amortizations: [newRecord, ...(item.amortizations || [])],
        };
      })
    );
  };

  // Cofrinho / Poupança CRUD
  const addPiggyBank = (
    bank: Omit<PiggyBankItem, 'id' | 'transactions' | 'createdAt'> & { initialAmount?: number }
  ) => {
    const id = `piggy-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const initialAmt = Number(bank.currentAmount ?? bank.initialAmount ?? 0);
    const initialTransactions: PiggyBankTransaction[] = [];

    if (initialAmt > 0) {
      initialTransactions.push({
        id: `ptx-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        amount: initialAmt,
        type: 'deposit',
        description: 'Depósito inicial de abertura do cofrinho',
      });
    }

    const newItem: PiggyBankItem = {
      ...bank,
      id,
      currentAmount: initialAmt,
      createdAt: new Date().toISOString().split('T')[0],
      transactions: initialTransactions,
    };

    setPiggyBanks((prev) => [newItem, ...prev]);
  };

  const updatePiggyBank = (id: string, updated: Partial<PiggyBankItem>) => {
    setPiggyBanks((prev) => prev.map((item) => (item.id === id ? { ...item, ...updated } : item)));
  };

  const deletePiggyBank = (id: string) => {
    setPiggyBanks((prev) => prev.filter((item) => item.id !== id));
  };

  // Depositar / Guardar Dinheiro no Cofrinho
  const depositToPiggyBank = (
    id: string,
    amount: number,
    description?: string,
    date?: string
  ) => {
    const numAmount = Math.max(0, Number(amount) || 0);
    if (numAmount <= 0) return;

    const newTx: PiggyBankTransaction = {
      id: `ptx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: date || new Date().toISOString().split('T')[0],
      amount: numAmount,
      type: 'deposit',
      description: description || 'Depósito no cofrinho',
    };

    setPiggyBanks((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          currentAmount: (Number(item.currentAmount) || 0) + numAmount,
          transactions: [newTx, ...(item.transactions || [])],
        };
      })
    );
  };

  // Resgatar / Sacar Dinheiro do Cofrinho
  const withdrawFromPiggyBank = (
    id: string,
    amount: number,
    description?: string,
    date?: string
  ) => {
    const numAmount = Math.max(0, Number(amount) || 0);
    if (numAmount <= 0) return;

    const target = piggyBanks.find((p) => p.id === id);
    if (!target) return;

    const actualAmount = Math.min(numAmount, Number(target.currentAmount) || 0);
    if (actualAmount <= 0) return;

    const newTx: PiggyBankTransaction = {
      id: `ptx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: date || new Date().toISOString().split('T')[0],
      amount: actualAmount,
      type: 'withdraw',
      description: description || 'Resgate do cofrinho',
    };

    setPiggyBanks((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          currentAmount: Math.max(0, (Number(item.currentAmount) || 0) - actualAmount),
          transactions: [newTx, ...(item.transactions || [])],
        };
      })
    );
  };

  // Reset to default sample
  const resetToSampleData = () => {
    setProfile(INITIAL_USER_PROFILE);
    setIncomes(INITIAL_INCOMES);
    setExpenses(INITIAL_EXPENSES);
    setFinancings(INITIAL_FINANCINGS);
    setPiggyBanks(INITIAL_PIGGY_BANKS);
    setAiAnalysis(null);
    localStorage.removeItem(STORAGE_KEYS.AI_ANALYSIS);
  };

  // Export / Import
  const exportData = () => {
    const data = {
      profile,
      incomes,
      expenses,
      financings,
      piggyBanks,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finanzen_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.incomes && parsed.expenses && parsed.financings) {
        if (parsed.profile) setProfile(parsed.profile);
        setIncomes(parsed.incomes);
        setExpenses(parsed.expenses);
        setFinancings(parsed.financings);
        if (parsed.piggyBanks && Array.isArray(parsed.piggyBanks)) {
          setPiggyBanks(parsed.piggyBanks);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return {
    profile,
    setProfile,
    incomes,
    expenses,
    financings,
    piggyBanks,
    setPiggyBanks,
    aiAnalysis,
    setAiAnalysis,
    summary,
    // Methods
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
  };
}
