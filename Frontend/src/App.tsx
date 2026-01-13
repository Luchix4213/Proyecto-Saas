import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './layout/PrivateRoute';
import { MainLayout } from './layout/MainLayout';

/* Auth Pages */
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

/* Admin Pages */
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminTenantsPage } from './pages/admin/AdminTenantsPage';
import { AdminTenantDetailPage } from './pages/admin/AdminTenantDetailPage';
import { AdminPlansPage } from './pages/admin/AdminPlansPage';
import { AdminSystemUsersPage } from './pages/admin/AdminSystemUsersPage';

/* Owner / Seller Pages */
import { UsersPage } from './pages/usuarios/UsersPage';
import { SubscriptionPage } from './pages/admin/SubscriptionPage';
import MyTenantPage from './pages/tenants/MyTenantPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ===================== */}
          {/* RUTAS PÚBLICAS */}
          {/* ===================== */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* ===================== */}
          {/* RUTAS PROTEGIDAS */}
          {/* ===================== */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            {/* ----------------- */}
            {/* DASHBOARD GENERAL */}
            {/* ----------------- */}
            <Route
              index
              element={
                <div className="p-4">
                  <h1 className="text-2xl font-bold">Dashboard</h1>
                  <p>Bienvenido al sistema multi-tenant.</p>
                </div>
              }
            />

            {/* ===================== */}
            {/* ADMIN */}
            {/* ===================== */}
            <Route
              path="admin/dashboard"
              element={
                <PrivateRoute roles={['ADMIN']}>
                  <AdminDashboardPage />
                </PrivateRoute>
              }
            />

            <Route
              path="admin/tenants"
              element={
                <PrivateRoute roles={['ADMIN']}>
                  <AdminTenantsPage />
                </PrivateRoute>
              }
            />

            <Route
              path="admin/tenants/:id"
              element={
                <PrivateRoute roles={['ADMIN']}>
                  <AdminTenantDetailPage />
                </PrivateRoute>
              }
            />

            <Route
              path="admin/planes"
              element={
                <PrivateRoute roles={['ADMIN']}>
                  <AdminPlansPage />
                </PrivateRoute>
              }
            />

            <Route
              path="admin/usuarios"
              element={
                <PrivateRoute roles={['ADMIN']}>
                  <AdminSystemUsersPage />
                </PrivateRoute>
              }
            />

            {/* ===================== */}
            {/* PROPIETARIO */}
            {/* ===================== */}
            <Route
              path="usuarios"
              element={
                <PrivateRoute roles={['PROPIETARIO']}>
                  <UsersPage />
                </PrivateRoute>
              }
            />

            <Route
              path="mi-empresa"
              element={
                <PrivateRoute roles={['PROPIETARIO']}>
                  <MyTenantPage />
                </PrivateRoute>
              }
            />

            <Route
              path="suscripcion"
              element={
                <PrivateRoute roles={['PROPIETARIO']}>
                  <SubscriptionPage />
                </PrivateRoute>
              }
            />

            {/* ===================== */}
            {/* FALLBACK */}
            {/* ===================== */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
