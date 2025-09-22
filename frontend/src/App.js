// App.js
import "./App.css";
import ActionHandler from "./pages/user/ActionHandler";
import RegisterPage from "./pages/user/RegisterPage";
import ForgotPassword from "./components/auth/ForgotPassword";
import LoginPage from "./pages/user/LoginPage";
import { Routes, Route } from "react-router-dom"; // remove Router import
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ResetPasswordPage from "./pages/user/ResetPasswordPage";
import UserDashboardPage from "./pages/user/UserDashboardPage";
import SuperAdminPage from "./pages/admin/SuperAdminPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import ManageUserPage from "./pages/admin/ManageUserPage";
import ManageRolesPage from "./pages/admin/ManageRolesPage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/action" element={<ActionHandler />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* SuperAdmin Dashboard with nested routes */}
        <Route
          path="/superadmin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <SuperAdminPage />
            </ProtectedRoute>
          }
        >
          <Route path="manage-users" element={<ManageUserPage />} />
          <Route path="manage-roles" element={<ManageRolesPage />} />
        </Route>

        <Route path="/dashboard" element={<UserDashboardPage />}>
          <Route
            path="manage-users"
            element={
              <ProtectedRoute requiredPermission="manageUsers">
                <ManageUserPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="manage-roles"
            element={
              <ProtectedRoute requiredPermission="manageRoles">
                <ManageRolesPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
