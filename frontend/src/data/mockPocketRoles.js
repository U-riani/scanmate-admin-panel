// frontend/mockPocketRoles.js

export const mockPocketRoles = [
  {
    id: 1,
    name: "warehouse_operator",
    description: "Standard warehouse operator",
    modules: {
      inventorization: true,
      transfer: true,
      receive: false,
      sales: false,
    },
  },
  {
    id: 2,
    name: "warehouse_supervisor",
    description: "Supervisor with wider permissions",
    modules: {
      inventorization: true,
      transfer: true,
      receive: true,
      sales: false,
    },
  },
  {
    id: 3,
    name: "warehouse_manager",
    description: "Full access",
    modules: {
      inventorization: true,
      transfer: true,
      receive: true,
      sales: true,
    },
  },
];