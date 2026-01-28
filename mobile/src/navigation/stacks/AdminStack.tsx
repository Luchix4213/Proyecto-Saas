import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import { AdminDashboard } from '../../screens/v2/admin/AdminDashboard';
import { TenantsScreen } from '../../screens/v2/admin/TenantsScreen';
import { PlansScreen } from '../../screens/v2/admin/PlansScreen';
import { AuditLogScreen } from '../../screens/v2/admin/AuditLogScreen';
import { LayoutDashboard, Building2, CreditCard, ShieldAlert } from 'lucide-react-native';

const Tab = createBottomTabNavigator();

export const AdminStack = () => {
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
                    tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
                    tabBarLabel: 'Inicio'
                }}
            />
            <Tab.Screen
                name="Tenants"
                component={TenantsScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Building2 color={color} size={size} />,
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
        </Tab.Navigator>
    );
};
