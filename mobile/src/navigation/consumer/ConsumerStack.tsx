import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { StoreHomeScreen } from '../../screens/consumer/StoreHomeScreen';
import { ProductDetailScreen } from '../../screens/consumer/ProductDetailScreen';
import { CartScreen } from '../../screens/consumer/CartScreen';
import { CheckoutScreen } from '../../screens/consumer/CheckoutScreen';
import { OrderDetailScreen } from '../../screens/consumer/OrderDetailScreen';
import { ConsumerTabs } from './ConsumerTabs';

const Stack = createNativeStackNavigator();

export type ConsumerStackParamList = {
    MainTabs: undefined;
    StoreHome: { tenantSlug?: string; tenantName?: string };
    ProductDetail: { product: any; tenantSlug?: string };
    Cart: undefined;
    Checkout: { tenantSlug: string; total: number };
};

export const ConsumerStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={ConsumerTabs} />
            <Stack.Screen name="StoreHome" component={StoreHomeScreen} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
        </Stack.Navigator>
    );
};
