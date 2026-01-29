import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import { OwnerDashboard } from '../../screens/owner/OwnerDashboard';
import { InventoryScreen } from '../../screens/owner/InventoryScreen';
import { SalesScreen } from '../../screens/owner/SalesScreen';
import { ProductFormScreen } from '../../screens/owner/ProductFormScreen';
import { SuppliersScreen } from '../../screens/owner/SuppliersScreen';
import { SupplierFormScreen } from '../../screens/owner/SupplierFormScreen';
import { PurchasesScreen } from '../../screens/owner/PurchasesScreen';
import { PurchaseFormScreen } from '../../screens/owner/PurchaseFormScreen';
import { StaffReportScreen } from '../../screens/owner/StaffReportScreen';
import { MoreScreen } from '../../screens/owner/MoreScreen';
import { CategoriesScreen } from '../../screens/owner/CategoriesScreen';
import { CategoryFormScreen } from '../../screens/owner/CategoryFormScreen';
import { BusinessSettingsScreen } from '../../screens/owner/BusinessSettingsScreen';
import { SubscriptionScreen } from '../../screens/owner/SubscriptionScreen';
import { ClientsScreen } from '../../screens/owner/ClientsScreen';
import { LayoutDashboard, Package, ShoppingBag, Menu } from 'lucide-react-native';
import { ClientFormScreen } from '../../screens/owner/ClientFormScreen';
import { NotificationsScreen } from '../../screens/owner/NotificationsScreen';
import { POSCatalogScreen } from '../../screens/sales/POSCatalogScreen';
import { POSCartScreen } from '../../screens/sales/POSCartScreen';
import { POSCheckoutScreen } from '../../screens/sales/POSCheckoutScreen';

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
