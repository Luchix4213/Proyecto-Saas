import React from 'react';
import { View } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { useAuthStore } from '../../../store/authStore';

export const AdminDashboard = () => {
  const theme = useTheme();
  const { logout, user } = useAuthStore();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text variant="headlineMedium" style={{ color: '#6200ee', marginBottom: 10 }}>
        SaaS Admin
      </Text>
      <Text variant="bodyLarge" style={{ marginBottom: 20 }}>
        Super Usuario: {user?.nombre_completo}
      </Text>

      <Button mode="outlined" onPress={logout}>
        Salir
      </Button>
    </View>
  );
};
