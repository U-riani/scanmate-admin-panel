import { Route, Routes } from "react-router-dom";

import ModuleRoute from "../components/auth/ModuleRoute";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import RoleRoute from "../components/auth/RoleRoute";
import Layout from "../components/layout/Layout";
import { PATHS } from "./paths";

import Dashboard from "../pages/dashboard/Dashboard";
import InventorizationDetail from "../pages/inventorization/InventorizationDetail";
import InventorizationList from "../pages/inventorization/InventorizationList";
import Login from "../pages/login/Login";
import LoginAccess from "../pages/loginAccess/LoginAccess";
import Api from "../pages/api/Api";
import Receive from "../pages/receive/Receive";
import ReceiveDetail from "../pages/receive/ReceiveDetail";
import Report from "../pages/report/Report";
import RolesPermissions from "../pages/rolesPermissions/RolesPermissions";
// import Sales from "../pages/sales/Sales";
import PriceLists from "../pages/sales/PriceLists";
import PriceUploadDetail from "../pages/sales/PriceUploadDetail";
import Settings from "../pages/settings/Settings";
import Warehouses from "../pages/settings/Warehouses";
import TransferDetail from "../pages/transfer/TransferDetail";
import TransferList from "../pages/transfer/TransferList";
import PocketRoles from "../pages/users/PocketRoles";
import PocketUsers from "../pages/users/PocketUsers";
import Users from "../pages/users/Users";
import WebsiteRoles from "../pages/users/WebsiteRoles";
import WebsiteUsers from "../pages/users/WebsiteUsers";

export default function Router() {
  return (
    <Routes>
      <Route path={PATHS.LOGIN} element={<Login />} />

      <Route
        element={(
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        )}
      >
        <Route index element={<Dashboard />} />
        <Route path={PATHS.RECEIVE} element={<Receive />} />
        <Route path={PATHS.REPORT} element={<Report />} />
        <Route path={PATHS.USERS} element={<Users />} />
        <Route path={PATHS.USERS_POCKET_USERS} element={<PocketUsers />} />
        <Route path={PATHS.USERS_POCKET_ROLES} element={<PocketRoles />} />
        <Route path={PATHS.LOGIN_ACCESS} element={<LoginAccess />} />
        <Route path={PATHS.API} element={<Api />} />
        <Route path={PATHS.SETTINGS} element={<Settings />} />

        <Route
          path={PATHS.ROLES_PERMISSIONS}
          element={(
            <RoleRoute roles={["super_admin"]}>
              <RolesPermissions />
            </RoleRoute>
          )}
        />

        {/* <Route
          path={PATHS.SALES}
          element={(
            <ModuleRoute module="sales">
              <Sales />
            </ModuleRoute>
          )}
        /> */}
        <Route
          path={PATHS.SALES_PRICE_LISTS}
          element={(
            <ModuleRoute module="sales">
              <PriceLists />
            </ModuleRoute>
          )}
        />
        <Route
          path={`${PATHS.SALES_PRICE_LISTS}/:id`}
          element={(
            <ModuleRoute module="sales">
              <PriceUploadDetail />
            </ModuleRoute>
          )}
        />
        <Route
          path={PATHS.USERS_WEBSITE_USERS}
          element={(
            <ModuleRoute module="website_users">
              <WebsiteUsers />
            </ModuleRoute>
          )}
        />
        <Route
          path={PATHS.USERS_WEBSITE_ROLES}
          element={(
            <ModuleRoute module="website_roles">
              <WebsiteRoles />
            </ModuleRoute>
          )}
        />
        <Route
          path={PATHS.SETTINGS_WAREHOUSES}
          element={(
            <ModuleRoute module="warehouses">
              <Warehouses />
            </ModuleRoute>
          )}
        />
        <Route
          path={PATHS.INVENTORIZATION}
          element={(
            <ModuleRoute module="inventorization">
              <InventorizationList />
            </ModuleRoute>
          )}
        />
        <Route
          path={`${PATHS.INVENTORIZATION}/:id`}
          element={(
            <ModuleRoute module="inventorization">
              <InventorizationDetail />
            </ModuleRoute>
          )}
        />
        <Route
          path={`${PATHS.RECEIVE}/:id`}
          element={(
            <ModuleRoute module="receive">
              <ReceiveDetail />
            </ModuleRoute>
          )}
        />
        <Route
          path={PATHS.TRANSFER_LIST}
          element={(
            <ModuleRoute module="transfer">
              <TransferList />
            </ModuleRoute>
          )}
        />
        <Route
          path="/transfer/:id"
          element={(
            <ModuleRoute module="transfer">
              <TransferDetail />
            </ModuleRoute>
          )}
        />
      </Route>
    </Routes>
  );
}
