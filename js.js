const transactions = [
  {
    _id: '65f1bb97220e528c49a7dc74',
    userId: '65d7190a1b32cb48ada5e02e',
    __v: 0,
    transactions: {
      amount: 100,
      type: '+ CREDIT',
      transactionDate: '2024-03-13T14:42:49.343Z',
      _id: '65f1bb96a26faf370ef9e050'
    },
    walletBalance: 49712
  },
  {
    _id: '65f1bb97220e528c49a7dc74',
    userId: '65d7190a1b32cb48ada5e02e',
    __v: 0,
    transactions: {
      amount: 20000,
      type: '+ CREDIT',
      transactionDate: '2024-03-14T08:44:19.853Z',
      _id: '65f2baeb9b9c3a347550fe44'
    },
    walletBalance: 49712
  },
  {
    _id: '65f1bb97220e528c49a7dc74',
    userId: '65d7190a1b32cb48ada5e02e',
    __v: 0,
    transactions: {
      amount: 8900,
      type: '+ CREDIT',
      transactionDate: '2024-03-14T09:36:49.902Z',
      _id: '65f2c592ed1f966c7f1c4858'
    },
    walletBalance: 49712
  },
  {
    _id: '65f1bb97220e528c49a7dc74',
    userId: '65d7190a1b32cb48ada5e02e',
    __v: 0,
    transactions: {
      amount: 8900,
      type: '+ CREDIT',
      transactionDate: '2024-03-14T09:46:16.197Z',
      _id: '65f2c793f897a48af8e5fd9a'
    },
    walletBalance: 49712
  },
  {
    _id: '65f1bb97220e528c49a7dc74',
    userId: '65d7190a1b32cb48ada5e02e',
    __v: 0,
    transactions: {
      amount: 8900,
      type: '+ CREDIT',
      transactionDate: '2024-03-14T09:51:41.091Z',
      _id: '65f2c8e908c5fdc3dd1a3e65'
    },
    walletBalance: 49712
  },
  {
    _id: '65f1bb97220e528c49a7dc74',
    userId: '65d7190a1b32cb48ada5e02e',
    __v: 0,
    transactions: {
      amount: 1212,
      type: '+ CREDIT',
      transactionDate: '2024-03-14T09:57:44.477Z',
      _id: '65f2cacdb3c9c26e4fda4fd9'
    },
    walletBalance: 49712
  },
  {
    _id: '65f1bb97220e528c49a7dc74',
    userId: '65d7190a1b32cb48ada5e02e',
    __v: 0,
    transactions: {
      amount: 1700,
      type: '+ CREDIT',
      transactionDate: '2024-03-14T10:04:45.908Z',
      _id: '65f2cbec8a45b2072a4a6a40'
    },
    walletBalance: 49712
  }
]

transactions.sort((a, b) => new Date(b.transactions.transactionDate) - new Date(a.transactions.transactionDate));

console.log(transactions);