import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StoreHomeScreen } from '../../screens/consumer/StoreHomeScreen';
import { SearchScreen } from '../../screens/consumer/SearchScreen';
import { FavoritesScreen } from '../../screens/consumer/FavoritesScreen';
import { MyOrdersScreen } from '../../screens/consumer/MyOrdersScreen';
import { MyProfileScreen } from '../../screens/consumer/MyProfileScreen';
import { Home, Search, Heart, ShoppingBag, User } from 'lucide-react-native';
import { useTheme } from 'react-native-paper';

export type ConsumerTabParamList = {
    HomeTab: { tenantSlug?: string; tenantName?: string } | undefined;
    SearchTab: undefined;
    FavoritesTab: undefined;
    OrdersTab: undefined;
    ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<ConsumerTabParamList>();

export const ConsumerTabs = () => {
    const theme = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: '#94a3b8',
                tabBarStyle: {
                    backgroundColor: 'white',
                    borderTopWidth: 1,
                    borderTopColor: '#f1f5f9',
                    height: 60,
                    paddingBottom: 5,
                    paddingTop: 5,
                    elevation: 0
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '600',
                    marginBottom: 5
                }
            }}
        >
            <Tab.Screen
                name="HomeTab"
                component={StoreHomeScreen}
                options={{
                    tabBarLabel: 'Inicio',
                    tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
                }}
            />
            <Tab.Screen
                name="SearchTab"
                component={SearchScreen}
                options={{
                    tabBarLabel: 'Explorar',
                    tabBarIcon: ({ color, size }) => <Search color={color} size={size} />
                }}
            />
            <Tab.Screen
                name="FavoritesTab"
                component={FavoritesScreen}
                options={{
                    tabBarLabel: 'Favoritos',
                    tabBarIcon: ({ color, size }) => <Heart color={color} size={size} />
                }}
            />
            <Tab.Screen
                name="OrdersTab"
                component={MyOrdersScreen}
                options={{
                    tabBarLabel: 'Pedidos',
                    tabBarIcon: ({ color, size }) => <ShoppingBag color={color} size={size} />
                }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={MyProfileScreen}
                options={{
                    tabBarLabel: 'Perfil',
                    tabBarIcon: ({ color, size }) => <User color={color} size={size} />
                }}
            />
        </Tab.Navigator>
    );
};
