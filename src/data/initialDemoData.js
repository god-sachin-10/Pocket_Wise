/**
 * Pocketwise — Initial Demo Data
 * Provides realistic seed data for new demo accounts.
 */

export const createInitialDemoData = (startDate = null) => {
  const now = startDate ? new Date(startDate) : new Date();
  const dayOfMonth = now.getDate();
  const daysInChallenge = 30;
  const daysPassed = Math.min(dayOfMonth - 1, daysInChallenge - 1);
  const daysRemaining = Math.max(daysInChallenge - daysPassed, 1);

  // Helper to get date string offset from today
  const daysAgo = (d) => {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    return date.toISOString().split('T')[0];
  };
  const daysFromNow = (d) => {
    const date = new Date(now);
    date.setDate(date.getDate() + d);
    return date.toISOString().split('T')[0];
  };

  return {
    settings: {
      startingBudget: 10000,
      challengeDays: 30,
      daysPassed,
      daysRemaining,
      startDate: daysAgo(daysPassed),
      endDate: daysFromNow(daysRemaining),
      emergencyReserve: 1000,
      currency: 'INR',
    },
    transactions: [
      {
        id: 'txn_001',
        name: 'Zomato — Dinner',
        category: 'Food',
        amount: 340,
        type: 'expense',
        date: daysAgo(0),
        description: 'Biryani order with friends',
        isEssential: false,
      },
      {
        id: 'txn_002',
        name: 'Metro Card Recharge',
        category: 'Transport',
        amount: 200,
        type: 'expense',
        date: daysAgo(1),
        description: 'Weekly commute pass',
        isEssential: true,
      },
      {
        id: 'txn_003',
        name: 'Grocery — BigBasket',
        category: 'Food',
        amount: 480,
        type: 'expense',
        date: daysAgo(2),
        description: 'Monthly groceries top-up',
        isEssential: true,
      },
      {
        id: 'txn_004',
        name: 'Netflix Subscription',
        category: 'Entertainment',
        amount: 199,
        type: 'expense',
        date: daysAgo(3),
        description: 'Monthly streaming plan',
        isEssential: false,
      },
      {
        id: 'txn_005',
        name: 'Ola Cab — Airport',
        category: 'Transport',
        amount: 155,
        type: 'expense',
        date: daysAgo(3),
        description: 'Ride to airport',
        isEssential: true,
      },
    ],
    savingsGoals: [
      {
        id: 'goal_001',
        name: 'Emergency Fund',
        targetAmount: 2500,
        savedAmount: 500,
        targetDate: daysFromNow(20),
        category: 'Emergency',
        color: '#43B7A2',
        description: 'Safety buffer for unexpected situations',
        isProtected: true,
      },
      {
        id: 'goal_002',
        name: 'New Laptop',
        targetAmount: 5000,
        savedAmount: 300,
        targetDate: daysFromNow(60),
        category: 'Tech',
        color: '#7968EF',
        description: 'Upgrade from current 5 year old laptop',
        isProtected: false,
      },
    ],
    commitments: [
      {
        id: 'commit_001',
        name: 'Mobile Recharge — Airtel',
        amount: 299,
        dueDate: daysFromNow(5),
        category: 'Bills',
        type: 'recurring',
        recurrenceInterval: 'monthly',
        status: 'active',
        isPaid: false,
        description: '2GB/day data plan',
      },
      {
        id: 'commit_002',
        name: 'Spotify Premium',
        amount: 119,
        dueDate: daysFromNow(8),
        category: 'Entertainment',
        type: 'recurring',
        recurrenceInterval: 'monthly',
        status: 'active',
        isPaid: false,
        description: 'Music streaming',
      },
      {
        id: 'commit_003',
        name: 'Transport Pass',
        amount: 400,
        dueDate: daysFromNow(12),
        category: 'Transport',
        type: 'recurring',
        recurrenceInterval: 'monthly',
        status: 'active',
        isPaid: false,
        description: 'Monthly bus/metro pass',
      },
      {
        id: 'commit_004',
        name: "Friend's Birthday Gift",
        amount: 500,
        dueDate: daysFromNow(3),
        category: 'Personal',
        type: 'one-time',
        recurrenceInterval: null,
        status: 'active',
        isPaid: false,
        description: 'Birthday celebration gift for Arjun',
      },
    ],
  };
};
