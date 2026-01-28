import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { MainScreen } from '../screens/MainScreen';

import { CatalogScreen } from '../screens/CatalogScreen';
import { InventoryScreen } from '../screens/InventoryScreen';
import { CartScreen } from '../screens/CartScreen';
import { ClientsScreen } from '../screens/ClientsScreen';

import { VendorStack } from './stacks/VendorStack';
import { OwnerStack } from './stacks/OwnerStack';
import { AdminStack } from './stacks/AdminStack';

import { AuthStack } from './stacks/AuthStack';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { token, user, isLoading, checkSession } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!token || !user ? (
        <AuthStack />
      ) : user.rol === 'PROPIETARIO' ? (
        <OwnerStack />
      ) : user.rol === 'ADMIN' ? (
        <AdminStack />
      ) : (
        <VendorStack />
      )}
    </NavigationContainer>
  );
};
