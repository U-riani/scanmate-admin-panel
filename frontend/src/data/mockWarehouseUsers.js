// src/data/mockPocketUsers.js

export const mockPocketUsers = [
  {
    id: 1,
    username: "giorgi",
    role: "warehouse_operator",
    warehouses: [1, 2],
    active: true,
    modules: {
      inventorization: true,
      transfer: true,
      receive: false,
      sales: false
    },
    last_login: "2026-03-10"
  },
  {
    id: 2,
    username: "nika",
    role: "warehouse_supervisor",
    warehouses: [1],
    active: true,
    modules: {
      inventorization: true,
      transfer: true,
      receive: true,
      sales: false
    },
    last_login: "2026-03-11"
  }
];