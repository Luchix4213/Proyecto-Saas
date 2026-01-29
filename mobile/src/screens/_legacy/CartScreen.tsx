import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useCartStore } from '../../store/cartStore';
import client from '../../api/client';
import { useNavigation } from '@react-navigation/native';

export const CartScreen = () => {
  const { items, total, updateQuantity, removeItem, clearCart } = useCartStore();
  const navigation = useNavigation<any>();

  const handleCheckout = async () => {
    if (items.length === 0) return;

    try {
      // Simplification: We only send items and totals
      // In a real app, you might need cliente_id, etc.
      const payload = {
        productos: items.map(i => ({
          producto_id: i.producto_id,
          cantidad: i.cantidad,
        })),
        tipo_venta: 'PRESENCIAL', // Requerido por el DTO en el backend
        metodo_pago: 'EFECTIVO'
      };

      await client.post('/ventas', payload);
      Alert.alert('Éxito', 'Venta registrada correctamente');
      clearCart();
      navigation.navigate('Main');
    } catch (error: any) {
      console.error('Checkout error', error);
      Alert.alert('Error', error.response?.data?.message || 'No se pudo registrar la venta');
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.producto_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.nombre}</Text>
              <Text style={styles.itemPrice}>${item.precio} x {item.cantidad}</Text>
            </View>
            <View style={styles.quantityControls}>
              <TouchableOpacity onPress={() => updateQuantity(item.producto_id, -1)} style={styles.qtyBtn}>
                <Text style={styles.qtyText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyCount}>{item.cantidad}</Text>
              <TouchableOpacity onPress={() => updateQuantity(item.producto_id, 1)} style={styles.qtyBtn}>
                <Text style={styles.qtyText}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => removeItem(item.producto_id)} style={styles.removeBtn}>
                <Text style={styles.removeText}>X</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>El carrito está vacío</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Catalog')} style={styles.suggestBtn}>
              <Text style={styles.suggestText}>Ir al catálogo</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {items.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>${Number(total || 0).toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
            <Text style={styles.checkoutText}>Registrar Venta</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  item: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemPrice: {
    color: '#666',
    marginTop: 2,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyBtn: {
    width: 30,
    height: 30,
    backgroundColor: '#eee',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  qtyCount: {
    marginHorizontal: 10,
    fontSize: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  removeBtn: {
    marginLeft: 15,
    padding: 5,
  },
  removeText: {
    color: '#FF3B30',
    fontWeight: 'bold',
  },
  empty: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
  },
  suggestBtn: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
  },
  suggestText: {
    color: 'white',
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  checkoutBtn: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  checkoutText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
