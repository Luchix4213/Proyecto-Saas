import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, TextInput, RefreshControl, TouchableOpacity } from 'react-native';
import client from '../../api/client';
import { ProductCard } from '../../components/ProductCard';
import { useCartStore } from '../../store/cartStore';
import { useNavigation } from '@react-navigation/native';

export const CatalogScreen = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const { addItem, items } = useCartStore();
  const navigation = useNavigation<any>();

  const fetchProducts = async () => {
    try {
      const response = await client.get('/productos');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchProducts();
  };

  const filteredProducts = products.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase())
  );

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
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar productos..."
          value={search}
          onChangeText={setSearch}
        />
        {items.length > 0 && (
          <TouchableOpacity
            style={styles.cartBadge}
            onPress={() => navigation.navigate('Cart')}
          >
            <Text style={styles.cartCount}>{items.length}</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.producto_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <ProductCard
              nombre={item.nombre}
              precio={item.precio}
              stock={item.stock}
              imagen_url={item.imagenes?.[0]?.url}
            />
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => addItem(item)}
            >
              <Text style={styles.addBtnText}>+ Agregar al carrito</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No se encontraron productos</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    fontSize: 16,
  },
  cartBadge: {
    marginLeft: 10,
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartCount: {
    color: 'white',
    fontWeight: 'bold',
  },
  cardContainer: {
    marginBottom: 20,
  },
  addBtn: {
    backgroundColor: '#E5F1FF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: -10, // Overlap slightly with card
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  addBtnText: {
    color: '#007AFF',
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
