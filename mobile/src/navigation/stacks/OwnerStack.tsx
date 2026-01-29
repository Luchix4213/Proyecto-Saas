import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import { OwnerDashboard } from '../../screens/v2/owner/OwnerDashboard';
import { InventoryScreen } from '../../screens/v2/owner/InventoryScreen';
import { SalesScreen } from '../../screens/v2/owner/SalesScreen';
import { ProductFormScreen } from '../../screens/v2/owner/ProductFormScreen';
import { SuppliersScreen } from '../../screens/v2/owner/SuppliersScreen';
import { SupplierFormScreen } from '../../screens/v2/owner/SupplierFormScreen';
import { PurchasesScreen } from '../../screens/v2/owner/PurchasesScreen';
import { PurchaseFormScreen } from '../../screens/v2/owner/PurchaseFormScreen';
import { StaffReportScreen } from '../../screens/v2/owner/StaffReportScreen';
import { MoreScreen } from '../../screens/v2/owner/MoreScreen';
import { CategoriesScreen } from '../../screens/v2/owner/CategoriesScreen';
import { CategoryFormScreen } from '../../screens/v2/owner/CategoryFormScreen';
import { BusinessSettingsScreen } from '../../screens/v2/owner/BusinessSettingsScreen';
import { SubscriptionScreen } from '../../screens/v2/owner/SubscriptionScreen';
import { ClientsScreen } from '../../screens/v2/owner/ClientsScreen';
import { LayoutDashboard, Package, ShoppingBag, Menu } from 'lucide-react-native';
import { ClientFormScreen } from '../../screens/v2/owner/ClientFormScreen';
import { NotificationsScreen } from '../../screens/v2/owner/NotificationsScreen';
import { POSCatalogScreen } from '../../screens/v2/sales/POSCatalogScreen';
import { POSCartScreen } from '../../screens/v2/sales/POSCartScreen';
import { POSCheckoutScreen } from '../../screens/v2/sales/POSCheckoutScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const OwnerTabs = () => {
    const theme = useTheme();
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: '#9ca3af',
                tabBarStyle: {
                    borderTopWidth: 0,
                    elevation: 5,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={OwnerDashboard}
                options={{
                    tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
                    tabBarLabel: 'Inicio'
                }}
            />
            <Tab.Screen
                name="Inventory"
                component={InventoryScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Package color={color} size={size} />,
                    tabBarLabel: 'Stock'
                }}
            />
            <Tab.Screen
                name="Sales"
                component={SalesScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <ShoppingBag color={color} size={size} />,
                    tabBarLabel: 'Ventas'
                }}
            />
            <Tab.Screen
                name="More"
                component={MoreScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Menu color={color} size={size} />,
                    tabBarLabel: 'Más'
                }}
            />
        </Tab.Navigator>
    );
};

export const OwnerStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OwnerMain" component={OwnerTabs} />
      <Stack.Screen name="ProductForm" component={ProductFormScreen} />
      <Stack.Screen name="Suppliers" component={SuppliersScreen} />
      <Stack.Screen name="SupplierForm" component={SupplierFormScreen} />
      <Stack.Screen name="Purchases" component={PurchasesScreen} />
      <Stack.Screen name="PurchaseForm" component={PurchaseFormScreen} />
      <Stack.Screen name="StaffPerformance" component={StaffReportScreen} />
      <Stack.Screen name="Categories" component={CategoriesScreen} />
      <Stack.Screen name="CategoryForm" component={CategoryFormScreen} />
      <Stack.Screen name="BusinessSettings" component={BusinessSettingsScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />

      <Stack.Screen name="Clients" component={ClientsScreen} />
      <Stack.Screen name="ClientForm" component={ClientFormScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />

      {/* POS / Sales Module */}
      <Stack.Screen name="POSCatalog" component={POSCatalogScreen} />
      <Stack.Screen name="POSCart" component={POSCartScreen} />
      <Stack.Screen name="POSCheckout" component={POSCheckoutScreen} />
    </Stack.Navigator>
  );
};
