import React, { useEffect, useState } from 'react';
import { View, ScrollView, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Text, Searchbar, Chip, Surface, useTheme, ActivityIndicator, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AestheticHeader } from '../..//components/v2/AestheticHeader';
import { productsService, Product } from '../..//api/productsService';
import { categoriesService, Category } from '../..//api/categoriesService';
import { Package, AlertCircle, ChevronRight, Filter, Search, Tag } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { getApiImageUrl } from '../..//utils/imageUtils';

export const InventoryScreen = () => {
  const navigation = useNavigation<any>();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const theme = useTheme();

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodsData, catsData] = await Promise.all([
        productsService.getAll(),
        categoriesService.getAll()
      ]);
      setProducts(prodsData);
      setCategories(catsData);
    } catch (error) {
      console.error('Error loading inventory data', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? p.categoria_id === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const renderProductItem = ({ item }: { item: Product }) => (
    <Surface style={styles.productCard} elevation={1}>
      <TouchableOpacity
        style={styles.productTouchable}
        onPress={() => navigation.navigate('ProductForm', { product: item })}
      >
        <View style={styles.imageContainer}>

          {item.imagenes && item.imagenes.length > 0 ? (
            <Image
              source={{ uri: getApiImageUrl(item.imagenes.find(img => img.es_principal)?.url || item.imagenes[0].url) || '' }}
              style={styles.productImage}
            />
          ) : (
            <Package size={28} color="#94a3b8" />
          )}
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>{item.nombre}</Text>
          <View style={styles.categoryBadge}>
            <Tag size={10} color="#64748b" />
            <Text style={styles.categoryText}>{item.categoria?.nombre || 'Sin categoría'}</Text>
          </View>

          <View style={styles.stockRow}>
            <View style={[
                styles.stockIndicator,
                { backgroundColor: item.stock_actual <= item.stock_minimo ? '#fee2e2' : '#f0fdf4' }
            ]}>
                <Text style={[
                    styles.stockValue,
                    { color: item.stock_actual <= item.stock_minimo ? '#ef4444' : '#22c55e' }
                ]}>
                    {item.stock_actual} en stock
                </Text>
            </View>
            {item.stock_actual <= item.stock_minimo && (
              <AlertCircle size={14} color="#ef4444" style={{ marginLeft: 6 }} />
            )}
          </View>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.currency}>$</Text>
          <Text style={styles.price}>{item.precio}</Text>
          <ChevronRight size={18} color="#cbd5e1" style={{ marginTop: 4 }} />
        </View>
      </TouchableOpacity>
    </Surface>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AestheticHeader title="Inventario" subtitle="Gestión de Stock" />

      <View style={styles.searchSection}>
        <Searchbar
          placeholder="Buscar productos..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={theme.colors.primary}
          placeholderTextColor="#94a3b8"
        />
      </View>

      <View style={styles.categoriesSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          <Chip
            selected={selectedCategory === null}
            onPress={() => setSelectedCategory(null)}
            style={[styles.chip, selectedCategory === null && styles.activeChip]}
            textStyle={[styles.chipText, selectedCategory === null && styles.activeChipText]}
            showSelectedOverlay
          >
            Todos
          </Chip>
          {categories.map(cat => (
            <Chip
              key={cat.categoria_id}
              selected={selectedCategory === cat.categoria_id}
              onPress={() => setSelectedCategory(cat.categoria_id)}
              style={[styles.chip, selectedCategory === cat.categoria_id && styles.activeChip]}
              textStyle={[styles.chipText, selectedCategory === cat.categoria_id && styles.activeChipText]}
              showSelectedOverlay
            >
              {cat.nombre}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={item => item.producto_id.toString()}
          renderItem={renderProductItem}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={onRefresh}
          numColumns={1}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBox}>
                <Package size={48} color="#cbd5e1" />
              </View>
              <Text style={styles.emptyTitle}>Sin resultados</Text>
              <Text style={styles.emptySub}>No encontramos lo que buscas</Text>
            </View>
          }
        />
      )}

      <FAB
        icon="plus"
        onPress={() => navigation.navigate('ProductForm')}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="white"
        label="NUEVO PRODUCTO"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  loadingContainer: { flex: 1, justifyContent: 'center' },
  searchSection: { paddingHorizontal: 20, paddingVertical: 12 },
  searchBar: {
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 0,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  searchInput: { fontSize: 15, fontWeight: '500' },
  categoriesSection: { height: 50 },
  categoriesScroll: { paddingHorizontal: 20, alignItems: 'center' },
  chip: {
    marginRight: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  activeChip: { backgroundColor: '#1e293b' },
  chipText: { color: '#64748b', fontSize: 13, fontWeight: '600' },
  activeChipText: { color: 'white' },
  listContent: { paddingHorizontal: 20, paddingBottom: 100, paddingTop: 8 },
  productCard: {
    borderRadius: 20,
    backgroundColor: 'white',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden'
  },
  productTouchable: { flexDirection: 'row', padding: 14, alignItems: 'center' },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  productImage: { width: '100%', height: '100%' },
  productInfo: { flex: 1, marginLeft: 16 },
  productName: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 4 },
  categoryText: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  stockRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  stockIndicator: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  stockValue: { fontSize: 11, fontWeight: 'bold' },
  priceContainer: { alignItems: 'flex-end', justifyContent: 'center' },
  currency: { fontSize: 12, fontWeight: '700', color: '#94a3b8' },
  price: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyIconBox: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  emptySub: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
  fab: { position: 'absolute', margin: 20, right: 0, bottom: 0, borderRadius: 16, elevation: 4 }
});

