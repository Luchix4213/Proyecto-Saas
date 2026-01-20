import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './layout/PrivateRoute';
// import { MainLayout } from './layout/MainLayout'; // Deprecated
import { AdminLayout } from './layout/AdminLayout';
import { OwnerLayout } from './layout/OwnerLayout';

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
import { AdminSubscriptionsPage } from './pages/admin/AdminSubscriptionsPage';
import { AdminRubrosPage } from './pages/admin/AdminRubrosPage';
import { AdminClientsPage } from './pages/admin/AdminClientsPage';

import { UsersPage } from './pages/owner/UsersPage';
import { SubscriptionPage } from './pages/owner/SubscriptionPage';
import { OwnerSuppliersPage } from './pages/owner/OwnerSuppliersPage';
import MyTenantPage from './pages/owner/MyTenantPage';
import { NotificationsPage } from './pages/owner/NotificationsPage';
import { ClientsPage } from './pages/owner/ClientsPage';
import { CategoriesPage } from './pages/owner/categories/CategoriesPage';
import { ProductsPage } from './pages/owner/products/ProductsPage';
import { PosPage } from './pages/owner/sales/PosPage';
import { OwnerPurchasesPage } from './pages/owner/purchases/OwnerPurchasesPage';
import { OnlineSalesPage } from './pages/owner/OnlineSalesPage';
import { ProfilePage } from './pages/common/ProfilePage';

/* Marketplace Pages */
import { MarketplaceLayout } from './layout/MarketplaceLayout';
import { LandingPage } from './pages/marketplace/LandingPage';
import { StorefrontPage } from './pages/marketplace/StorefrontPage';
import { CheckoutPage } from './pages/marketplace/CheckoutPage';
import { GlobalProductsPage } from './pages/marketplace/GlobalProductsPage';
import { OwnerDashboardPage } from './pages/owner/OwnerDashboardPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ===================== */}
          {/* MARKETPLACE (PÚBLICO) */}
          {/* ===================== */}
          <Route element={<MarketplaceLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/tienda/:slug" element={<StorefrontPage />} />
            <Route path="/tienda/:slug/checkout" element={<CheckoutPage />} />
            <Route path="/stores" element={<LandingPage />} />
            <Route path="/productos-global" element={<GlobalProductsPage />} />
          </Route>

          {/* ===================== */}
          {/* AUTH */}
          {/* ===================== */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* ===================== */}
          {/* ADMIN ROUTES */}
          {/* ===================== */}
          <Route
            element={
              <PrivateRoute roles={['ADMIN']}>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/tenants" element={<AdminTenantsPage />} />
            <Route path="/admin/tenants/:id" element={<AdminTenantDetailPage />} />
            <Route path="/admin/planes" element={<AdminPlansPage />} />
            <Route path="/admin/usuarios" element={<AdminSystemUsersPage />} />
            <Route path="/admin/suscripciones" element={<AdminSubscriptionsPage />} />
            <Route path="/admin/rubros" element={<AdminRubrosPage />} />
            <Route path="/admin/clientes" element={<AdminClientsPage />} />
            <Route path="/admin/profile" element={<ProfilePage />} />
          </Route>

          {/* ===================== */}
          {/* OWNER/APP ROUTES */}
          {/* ===================== */}
          <Route
            element={
              <PrivateRoute roles={['PROPIETARIO', 'VENDEDOR']}>
                <OwnerLayout />
              </PrivateRoute>
            }
          >
            <Route path="/dashboard" element={<OwnerDashboardPage />} />
            <Route path="/mi-empresa" element={<MyTenantPage />} />
            <Route path="/notificaciones" element={<NotificationsPage />} />
            <Route path="/usuarios" element={<UsersPage />} />
            <Route path="/clientes" element={<ClientsPage />} />
            <Route path="/suscripcion" element={<SubscriptionPage />} />
            <Route path="/categorias" element={<CategoriesPage />} />
            <Route path="/productos" element={<ProductsPage />} />
            <Route path="/proveedores" element={<OwnerSuppliersPage />} />
            <Route path="/compras" element={<OwnerPurchasesPage />} />
            <Route path="/compras" element={<OwnerPurchasesPage />} />
            <Route path="/ventas-online" element={<OnlineSalesPage />} />
            <Route path="/pos" element={<PosPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* ===================== */}
          {/* FALLBACK */}
          {/* ===================== */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
