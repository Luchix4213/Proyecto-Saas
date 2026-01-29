import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import { AdminMoreScreen } from '../../screens/v2/admin/AdminMoreScreen';
import { LayoutDashboard, Building2, CreditCard, ShieldAlert, Menu } from 'lucide-react-native';

import { AdminDashboard } from '../../screens/v2/admin/AdminDashboard';
import { TenantsScreen } from '../../screens/v2/admin/TenantsScreen';
import { PlansScreen } from '../../screens/v2/admin/PlansScreen';
import { AuditLogScreen } from '../../screens/v2/admin/AuditLogScreen';
import { GlobalUsersScreen } from '../../screens/v2/admin/GlobalUsersScreen';
import { PlanFormScreen } from '../../screens/v2/admin/PlanFormScreen';
import { TenantFormScreen } from '../../screens/v2/admin/TenantFormScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const AdminTabs = () => {
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
                name="AdminDashboard"
                component={AdminDashboard}
                options={{
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => <LayoutDashboard color={color} size={size} />,
                    tabBarLabel: 'Inicio'
                }}
            />
            <Tab.Screen
                name="Tenants"
                component={TenantsScreen}
                options={{
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => <Building2 color={color} size={size} />,
                    tabBarLabel: 'Empresas'
                }}
            />
            <Tab.Screen
                name="Plans"
                component={PlansScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <CreditCard color={color} size={size} />,
                    tabBarLabel: 'Planes'
                }}
            />
            <Tab.Screen
                name="Audit"
                component={AuditLogScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <ShieldAlert color={color} size={size} />,
                    tabBarLabel: 'Logs'
                }}
            />
            <Tab.Screen
                name="More"
                component={AdminMoreScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Menu color={color} size={size} />,
                    tabBarLabel: 'Más'
                }}
            />
        </Tab.Navigator>
    );
};

export const AdminStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="AdminMain" component={AdminTabs} />
            <Stack.Screen name="GlobalUsers" component={GlobalUsersScreen} />
            <Stack.Screen name="PlanForm" component={PlanFormScreen} />
            <Stack.Screen name="TenantForm" component={TenantFormScreen} />
        </Stack.Navigator>
    );
};
