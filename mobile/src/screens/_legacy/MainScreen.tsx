import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useNavigation } from '@react-navigation/native';

export const MainScreen = () => {
  const { user, logout } = useAuthStore();
  const navigation = useNavigation<any>();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Hola, {user?.nombre_completo || 'Usuario'}</Text>
        <Text style={styles.role}>Rol: {user?.rol}</Text>
      </View>

      <Text style={styles.sectionTitle}>Módulos Principal</Text>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: '#E3F2FD' }]}
          onPress={() => navigation.navigate('Catalog')}
        >
          <Text style={[styles.cardTitle, { color: '#1976D2' }]}>Ventas</Text>
          <Text style={styles.cardDesc}>Ver catálogo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: '#FFF3E0' }]}
          onPress={() => navigation.navigate('Inventory')}
        >
          <Text style={[styles.cardTitle, { color: '#E65100' }]}>Inventario</Text>
          <Text style={styles.cardDesc}>Control stock</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: '#F3E5F5' }]}
          onPress={() => navigation.navigate('Clients')}
        >
          <Text style={[styles.cardTitle, { color: '#7B1FA2' }]}>Clientes</Text>
          <Text style={styles.cardDesc}>Gestión datos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: '#E8F5E9' }]}
          onPress={() => navigation.navigate('Cart')}
        >
          <Text style={[styles.cardTitle, { color: '#2E7D32' }]}>Carrito</Text>
          <Text style={styles.cardDesc}>Venta actual</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 30,
  },
  welcome: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },
  role: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#444',
    marginBottom: 15,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  card: {
    width: '48%',
    padding: 20,
    borderRadius: 15,
    height: 120,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  logoutButton: {
    marginTop: 40,
    marginBottom: 40,
    padding: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#C62828',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
