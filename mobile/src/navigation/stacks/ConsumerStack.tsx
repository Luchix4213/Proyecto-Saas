import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { StoreHomeScreen } from '../../screens/v2/consumer/StoreHomeScreen';
import { ProductDetailScreen } from '../../screens/v2/consumer/ProductDetailScreen';
import { CartScreen } from '../../screens/v2/consumer/CartScreen';
import { CheckoutScreen } from '../../screens/v2/consumer/CheckoutScreen';
import { MyOrdersScreen } from '../../screens/v2/consumer/MyOrdersScreen';

const Stack = createNativeStackNavigator();

export const ConsumerStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="StoreHome" component={StoreHomeScreen} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
        </Stack.Navigator>
    );
};
