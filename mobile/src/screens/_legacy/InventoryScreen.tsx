import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import client from '../../api/client';
import { ProductCard } from '../../components/ProductCard';

export const InventoryScreen = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterLowStock, setFilterLowStock] = useState(false);

  const fetchProducts = async () => {
    try {
      const response = await client.get('/productos');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching inventory', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const displayProducts = filterLowStock
    ? products.filter(p => p.stock <= 5) // Critical stock threshold
    : products;

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Estado de Inventario</Text>
        <TouchableOpacity
          style={[styles.filterBtn, filterLowStock && styles.filterBtnActive]}
          onPress={() => setFilterLowStock(!filterLowStock)}
        >
          <Text style={[styles.filterText, filterLowStock && styles.filterTextActive]}>
            Solo Stock Bajo
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayProducts}
        keyExtractor={(item) => item.producto_id.toString()}
        renderItem={({ item }) => (
          <ProductCard
            nombre={item.nombre}
            precio={item.precio}
            stock={item.stock}
            imagen_url={item.imagenes?.[0]?.url}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Todo el stock está al día</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filterBtnActive: {
    backgroundColor: '#FF3B30',
  },
  filterText: {
    fontSize: 12,
    color: '#666',
  },
  filterTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#999',
    fontSize: 16,
  },
});
