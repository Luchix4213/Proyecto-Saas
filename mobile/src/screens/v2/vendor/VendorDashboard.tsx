import React from 'react';
import { View } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { useAuthStore } from '../../../store/authStore';

export const VendorDashboard = () => {
  const theme = useTheme();
  const { logout, user } = useAuthStore();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text variant="headlineMedium" style={{ color: theme.colors.primary, marginBottom: 10 }}>
        Panel Vendedor
      </Text>
      <Text variant="bodyLarge" style={{ marginBottom: 20 }}>
        Hola, {user?.nombre_completo}
      </Text>

      <Button mode="contained" onPress={logout} icon="logout">
        Cerrar Sesión
      </Button>
    </View>
  );
};
