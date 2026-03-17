import { PATHS } from "../app/paths";

export const menu = [
  {
    name: "Dashboard",
    path: PATHS.DASHBOARD,
    module: "dashboard",
  },
  {
    name: "Inventorization",
    path: PATHS.INVENTORIZATION,
    module: "inventorization",
  },
  {
    name: "Transfer",
    path: PATHS.TRANSFER_LIST,
    module: "transfer",
  },
  {
    name: "Receive",
    path: PATHS.RECEIVE,
    module: "receive",
  },
  {
    name: "Sales",
    path: PATHS.SALES,
    module: "sales",
    children: [
      {
        name: "Price Lists",
        path: PATHS.SALES_PRICE_LISTS,
        module: "sales",
      },
    ],
  },
  {
    name: "Report",
    path: PATHS.REPORT,
    module: "report",
  },
  {
    name: "Users",
    path: PATHS.USERS,
    module: "users",
    children: [
      {
        name: "Website Users",
        path: PATHS.USERS_WEBSITE_USERS,
        module: "website_users",
      },
      {
        name: "Website Roles",
        path: PATHS.USERS_WEBSITE_ROLES,
        module: "website_roles",
      },
      {
        name: "Pocket Users",
        path: PATHS.USERS_POCKET_USERS,
        module: "pocket_users",
      },
      {
        name: "Pocket Roles",
        path: PATHS.USERS_POCKET_ROLES,
        module: "pocket_roles",
      },
    ],
  },
  {
    name: "Settings",
    path: PATHS.SETTINGS,
    module: "settings",
    children: [
      {
        name: "Warehouse",
        path: PATHS.SETTINGS_WAREHOUSES,
        module: "warehouses",
      },
    ],
  },
];
