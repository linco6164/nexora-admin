import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import ListingsPage from "./pages/ListingsPage";
import BroadcastPage from "./pages/BroadcastPage";
import UserDetailPage from "./pages/UserDetailPage";
import WithdrawalsPage from "./pages/WithdrawalsPage";
import SupportPage from "./pages/SupportPage";
import CreateUserPage from "./pages/CreateUserPage";

import PermissionRoute from "./components/PermissionRoute";

function Layout({ children }) {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, background: "#f5f5f5", minHeight: "100vh" }}>
        {children}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <PermissionRoute permission="finance">
                <Layout>
                  <DashboardPage />
                </Layout>
              </PermissionRoute>
            }
          />
          <Route
            path="/users/create"
            element={
              <PermissionRoute permission="admin">
                <Layout>
                  <CreateUserPage />
                </Layout>
              </PermissionRoute>
            }
          />
          <Route
            path="/users"
            element={
              <PermissionRoute permission="admin">
                <Layout>
                  <UsersPage />
                </Layout>
              </PermissionRoute>
            }
          />
          <Route
            path="/listings"
            element={
              <PermissionRoute permission="admin">
                <Layout>
                  <ListingsPage />
                </Layout>
              </PermissionRoute>
            }
          />
          <Route
            path="/broadcast"
            element={
              <PermissionRoute permission="admin">
                <Layout>
                  <BroadcastPage />
                </Layout>
              </PermissionRoute>
            }
          />
          <Route
            path="/users/:id"
            element={
              <PermissionRoute permission="admin">
                <Layout>
                  <UserDetailPage />
                </Layout>
              </PermissionRoute>
            }
          />
          <Route
            path="/withdrawals"
            element={
              <PermissionRoute permission="finance">
                <Layout>
                  <WithdrawalsPage />
                </Layout>
              </PermissionRoute>
            }
          />
          <Route path="/support" element={<PermissionRoute permission="finance"><SupportPage /></PermissionRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
