import { ExpenseItem, FinancingItem, IncomeItem, UserProfile, PiggyBankItem } from '../types/finance';

// Helper to get formatted date relative to today
function getDateOffset(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const INITIAL_USER_PROFILE: UserProfile = {
  id: 'user_default',
  name: 'Alexandre Silva',
  email: 'alexandre.silva@exemplo.com',
  currency: 'BRL',
  monthlySavingsTarget: 1200,
  dueAlertDays: 3,
};

export const INITIAL_INCOMES: IncomeItem[] = [
  {
    id: 'inc-1',
    title: 'Salário Empresa Tech',
    amount: 7800.0,
    frequency: 'monthly',
    category: 'salary',
    receivedDate: getDateOffset(-10),
    isFixed: true,
    notes: 'Salário líquido após deduções CLT',
  },
  {
    id: 'inc-2',
    title: 'Projetos Freelance UI/UX',
    amount: 1950.0,
    frequency: 'variable',
    category: 'freelance',
    receivedDate: getDateOffset(-3),
    isFixed: false,
    notes: 'Consultoria de design para startup',
  },
  {
    id: 'inc-3',
    title: 'Dividendos & Fundos Imobiliários',
    amount: 320.0,
    frequency: 'monthly',
    category: 'investment',
    receivedDate: getDateOffset(-12),
    isFixed: false,
    notes: 'Rendimentos FIIs na B3',
  },
];

export const INITIAL_EXPENSES: ExpenseItem[] = [
  {
    id: 'exp-1',
    title: 'Aluguel & Condomínio',
    amount: 2200.0,
    dueDate: getDateOffset(-1), // Atrasada ontem se não foi paga
    category: 'moradia',
    type: 'fixed',
    status: 'pending',
    isRecurring: true,
    notes: 'Boleto bancário via app da imobiliária',
  },
  {
    id: 'exp-2',
    title: 'Energia Elétrica (Enel)',
    amount: 285.5,
    dueDate: getDateOffset(2), // Vence em 2 dias (alerta visual)
    category: 'moradia',
    type: 'variable',
    status: 'pending',
    isRecurring: true,
    notes: 'Conta com bandeira tarifária amarela',
  },
  {
    id: 'exp-3',
    title: 'Internet Fibra 600MB',
    amount: 129.9,
    dueDate: getDateOffset(3), // Vence em 3 dias
    category: 'moradia',
    type: 'fixed',
    status: 'pending',
    isRecurring: true,
  },
  {
    id: 'exp-4',
    title: 'Supermercado & Feira do Mês',
    amount: 1450.0,
    dueDate: getDateOffset(-15),
    category: 'alimentacao',
    type: 'variable',
    status: 'paid',
    paidAt: getDateOffset(-15),
    isRecurring: true,
    notes: 'Compras no atacado e feira orgânica',
  },
  {
    id: 'exp-5',
    title: 'Delivery & Restaurantes (iFood excessivo)',
    amount: 890.0,
    dueDate: getDateOffset(-5),
    category: 'alimentacao',
    type: 'variable',
    status: 'paid',
    paidAt: getDateOffset(-5),
    isRecurring: false,
    notes: 'Muitos pedidos nos fins de semana e noites',
  },
  {
    id: 'exp-6',
    title: 'Combustível & Estacionamento',
    amount: 540.0,
    dueDate: getDateOffset(-8),
    category: 'transporte',
    type: 'variable',
    status: 'paid',
    paidAt: getDateOffset(-8),
    isRecurring: true,
  },
  {
    id: 'exp-7',
    title: 'Plano de Saúde Unimed',
    amount: 480.0,
    dueDate: getDateOffset(7),
    category: 'saude',
    type: 'fixed',
    status: 'pending',
    isRecurring: true,
  },
  {
    id: 'exp-8',
    title: 'Academia & Crossfit',
    amount: 169.9,
    dueDate: getDateOffset(10),
    category: 'saude',
    type: 'fixed',
    status: 'pending',
    isRecurring: true,
  },
  {
    id: 'exp-9',
    title: 'Combo Streaming (Netflix, Max, Spotify)',
    amount: 148.7,
    dueDate: getDateOffset(12),
    category: 'assinaturas',
    type: 'fixed',
    status: 'pending',
    isRecurring: true,
    notes: 'Várias assinaturas ativas simultaneamente',
  },
  {
    id: 'exp-10',
    title: 'Cinema, Bares & Lazer',
    amount: 420.0,
    dueDate: getDateOffset(-2),
    category: 'lazer',
    type: 'variable',
    status: 'paid',
    paidAt: getDateOffset(-2),
    isRecurring: false,
  },
];

export const INITIAL_FINANCINGS: FinancingItem[] = [
  {
    id: 'fin-1',
    title: 'Apartamento Jardins (Caixa)',
    category: 'imovel',
    totalFinancedAmount: 290000.0,
    annualInterestRate: 9.8,
    installmentAmount: 2450.0,
    totalInstallments: 360,
    paidInstallments: 46,
    startDate: '2022-11-10',
    amortizations: [
      {
        id: 'amort-1',
        date: '2024-12-15',
        amount: 8000.0,
        strategy: 'reduce_term',
        monthsSavedEstimate: 14,
        interestSavedEstimate: 12500.0,
      },
    ],
    notes: 'Sistema SAC com taxa de juros bonificada pela conta salário',
  },
  {
    id: 'fin-2',
    title: 'Carro SUV Hyundai Creta',
    category: 'veiculo',
    totalFinancedAmount: 72000.0,
    annualInterestRate: 14.5,
    installmentAmount: 1680.0,
    totalInstallments: 48,
    paidInstallments: 20,
    startDate: '2024-01-20',
    amortizations: [],
    notes: 'Financiamento CDC com alienação fiduciária',
  },
];

export const INITIAL_PIGGY_BANKS: PiggyBankItem[] = [
  {
    id: 'piggy-1',
    title: 'Reserva de Emergência (6 Meses)',
    category: 'emergency',
    currentAmount: 14500.0,
    targetAmount: 25000.0,
    targetDate: '2026-12-31',
    yieldType: 'cdi',
    annualYieldRate: 10.75, // 100% CDI
    color: '#10b981', // Emerald
    icon: 'shield',
    createdAt: '2024-01-10',
    notes: 'Conta digital de alta liquidez diária com rendimento automático a 100% do CDI.',
    transactions: [
      {
        id: 'ptx-1',
        date: getDateOffset(-20),
        amount: 1000.0,
        type: 'deposit',
        description: 'Aporte mensal planejado',
      },
      {
        id: 'ptx-2',
        date: getDateOffset(-50),
        amount: 2500.0,
        type: 'deposit',
        description: 'Depósito de parte do 13º salário',
      },
      {
        id: 'ptx-3',
        date: getDateOffset(-75),
        amount: 600.0,
        type: 'withdraw',
        description: 'Resgate para reparo emergencial de encanamento',
      },
    ],
  },
  {
    id: 'piggy-2',
    title: 'Viagem & Férias em Família',
    category: 'travel',
    currentAmount: 5200.0,
    targetAmount: 9000.0,
    targetDate: '2027-01-15',
    yieldType: 'cdi',
    annualYieldRate: 10.75,
    color: '#38bdf8', // Sky / Blue
    icon: 'plane',
    createdAt: '2024-04-15',
    notes: 'Fundo reservado para passagens aéreas e hospedagem de verão.',
    transactions: [
      {
        id: 'ptx-4',
        date: getDateOffset(-12),
        amount: 450.0,
        type: 'deposit',
        description: 'Economia extra de lazer',
      },
      {
        id: 'ptx-5',
        date: getDateOffset(-42),
        amount: 1200.0,
        type: 'deposit',
        description: 'Rendimento de freelance UI/UX',
      },
    ],
  },
  {
    id: 'piggy-3',
    title: 'Poupança / Entrada Carro Novo',
    category: 'vehicle',
    currentAmount: 18000.0,
    targetAmount: 35000.0,
    targetDate: '2027-06-30',
    yieldType: 'poupanca',
    annualYieldRate: 6.17, // Poupança
    color: '#a855f7', // Purple
    icon: 'car',
    createdAt: '2023-10-01',
    notes: 'Poupança tradicional para amortizar ou trocar de veículo.',
    transactions: [
      {
        id: 'ptx-6',
        date: getDateOffset(-8),
        amount: 1500.0,
        type: 'deposit',
        description: 'Depósito mensal de poupança',
      },
    ],
  },
  {
    id: 'piggy-4',
    title: 'Fundo Reforma & Decoração',
    category: 'home',
    currentAmount: 3400.0,
    targetAmount: 6000.0,
    targetDate: '2026-11-20',
    yieldType: 'cdi',
    annualYieldRate: 10.75,
    color: '#f59e0b', // Amber
    icon: 'home',
    createdAt: '2024-06-01',
    notes: 'Troca de piso da varanda e pintura da sala.',
    transactions: [
      {
        id: 'ptx-7',
        date: getDateOffset(-18),
        amount: 800.0,
        type: 'deposit',
        description: 'Economia de cortes do iFood',
      },
    ],
  },
];
