import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
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
import { SalesHistoryPage } from './pages/owner/sales/SalesHistoryPage';
import { OwnerPurchasesPage } from './pages/owner/purchases/OwnerPurchasesPage';
import { OnlineSalesPage } from './pages/owner/OnlineSalesPage';
import { AuditPage } from './pages/owner/AuditPage';
import { PurchaseHistoryPage } from './pages/owner/purchases/PurchaseHistoryPage';
import { ProfilePage } from './pages/common/ProfilePage';

/* Marketplace Pages */
import { MarketplaceLayout } from './layout/MarketplaceLayout';
import { LandingPage } from './pages/marketplace/LandingPage';
import { StorefrontPage } from './pages/marketplace/StorefrontPage';
import { CheckoutPage } from './pages/marketplace/CheckoutPage';
import { GlobalProductsPage } from './pages/marketplace/GlobalProductsPage';
import { OwnerDashboardPage } from './pages/owner/OwnerDashboardPage';
import { SellerDashboardPage } from './pages/seller/SellerDashboardPage';

// Dashboard route component to conditionally render based on role
import { useAuth } from './context/AuthContext';

const DashboardRoute = () => {
  const { user } = useAuth();
  return user?.rol === 'VENDEDOR' ? <SellerDashboardPage /> : <OwnerDashboardPage />;
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* ===================== */}
            {/* MARKETPLACE (PÚBLICO) */}
            {/* ===================== */}
            <Route element={<MarketplaceLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/stores" element={<LandingPage />} />
              <Route path="/tienda/:slug" element={<StorefrontPage />} />
              <Route path="/tienda/:slug/checkout" element={<CheckoutPage />} />
              <Route path="/productos-global" element={<GlobalProductsPage />} />
            </Route>

            {/* ===================== */}
            {/* 🔐 AUTH */}
            {/* ===================== */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* ===================== */}
            {/* ADMIN (SAAS OWNER) */}
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
              <Route path="/admin/notificaciones" element={<NotificationsPage />} />
              <Route path="/admin/perfil" element={<ProfilePage />} />
              <Route path="/admin/auditoria" element={<AuditPage />} />
            </Route>

            {/* ===================== */}
            {/* 🏪 PANEL DEL NEGOCIO (OWNER / VENDEDOR) */}
            {/* ===================== */}
            <Route
              element={
                <PrivateRoute roles={['PROPIETARIO', 'VENDEDOR']}>
                  <OwnerLayout />
                </PrivateRoute>
              }
            >
              {/* Dashboard dinámico por rol */}
              <Route path="/app/dashboard" element={<DashboardRoute />} />

              {/* Configuración del negocio (solo owner normalmente) */}
              <Route path="/app/empresa" element={<MyTenantPage />} />
              <Route path="/app/suscripciones" element={<SubscriptionPage />} />
              <Route path="/app/usuarios" element={<UsersPage />} />

              {/* Gestión general */}
              <Route path="/app/notificaciones" element={<NotificationsPage />} />
              <Route path="/app/perfil" element={<ProfilePage />} />
              <Route path="/app/auditoria" element={<AuditPage />} />

              {/* Inventario */}
              <Route path="/app/productos" element={<ProductsPage />} />
              <Route path="/app/categorias" element={<CategoriesPage />} />
              <Route path="/app/proveedores" element={<OwnerSuppliersPage />} />

              {/* Clientes */}
              <Route path="/app/clientes" element={<ClientsPage />} />

              {/* Compras */}
              <Route path="/app/compras" element={<OwnerPurchasesPage />} />
              <Route path="/app/compras/historial" element={<PurchaseHistoryPage />} />

              {/* Ventas */}
              <Route path="/app/ventas/pos" element={<PosPage />} />
              <Route path="/app/ventas/historial" element={<SalesHistoryPage />} />
              <Route path="/app/ventas/online" element={<OnlineSalesPage />} />
            </Route>

            {/* ===================== */}
            {/* FALLBACK */}
            {/* ===================== */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
