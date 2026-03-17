// frontend/src/data/mockWebsiteRoles.js

export const mockWebsiteRoles = [
  {
    id: 1,
    name: "super_admin",
    description: "Full system access",
    modules: {
      dashboard: true,
      users: true,
      transfer: true,
      sales: true,
      website_users: true,
      website_roles: true,
      pocket_users: true,
      pocket_roles: true,
      warehouses: true,
      settings: true,
      reports: true,
      inventorization: true,
    },
  },
  {
    id: 2,
    name: "admin",
    description: "Operational admin",
    modules: {
      dashboard: true,
      transfer: true,
      sales: true,
      users: true,
      website_users: false,
      website_roles: false,
      pocket_users: true,
      pocket_roles: true,
      warehouses: true,
      settings: false,
      reports: true,
      inventorization: false,
    },
  },
];
