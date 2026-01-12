import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layout/MainLayout';
import { PrivateRoute } from './layout/PrivateRoute';
import { UsersPage } from './pages/usuarios/UsersPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { SubscriptionPage } from './pages/admin/SubscriptionPage';
import { AdminTenantsPage } from './pages/admin/AdminTenantsPage';
import { AdminPlansPage } from './pages/admin/AdminPlansPage';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Rutas Protegidas */}
          <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
            <Route index element={<div className="p-4"><h1 className="text-2xl font-bold">Dashboard Multi-Tenant</h1><p>Bienvenido al panel de control.</p></div>} />
            <Route path="usuarios" element={<UsersPage />} />
            <Route path="admin" element={<AdminTenantsPage />} />
            <Route path="admin/planes" element={<AdminPlansPage />} />
            <Route path="suscripcion" element={<SubscriptionPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
