import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Text, Searchbar, Chip, Surface, useTheme, ActivityIndicator, FAB, Badge } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AestheticHeader } from '../..//components/v2/AestheticHeader';
import { API_URL } from '../..//api/client';
import { productsService, Product } from '../..//api/productsService';
import { categoriesService, Category } from '../..//api/categoriesService';
import { useCartStore } from '../..//store/cartStore'; // Taking assumption this store exists and is shareable
import { Package, ShoppingCart, Plus, Minus, Search } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getApiImageUrl } from '../..//utils/imageUtils';

export const POSCatalogScreen = () => {
  const navigation = useNavigation<any>();
  const theme = useTheme();
  const { addItem, items } = useCartStore(); // Assuming cart store has these

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

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
      console.error('Error loading POS data', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? p.categoria_id === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const getCartQuantity = (id: number) => {
    const item = items.find(i => i.producto_id === id);
    return item ? item.cantidad : 0;
  };

  const renderProductItem = ({ item }: { item: Product }) => {
    const qty = getCartQuantity(item.producto_id);
    const hasStock = item.stock_actual > 0;
    const canAddMore = qty < item.stock_actual;

    const mainImageUrl = item.imagenes?.find(i => i.es_principal)?.url || item.imagenes?.[0]?.url;
    const resolvedImageUrl = getApiImageUrl(mainImageUrl);

    return (
      <Surface style={[styles.card, !hasStock && { opacity: 0.6 }]} elevation={1}>
        <View style={styles.imageContainer}>
             {resolvedImageUrl ? (
                <Image source={{ uri: resolvedImageUrl }} style={styles.image} />
             ) : (
                <Package size={32} color="#cbd5e1" />
             )}
             {qty > 0 && (
                <Badge style={styles.badge} size={22}>{qty}</Badge>
             )}
             {!hasStock && (
                 <View style={styles.outOfStockOverlay}>
                     <Text style={styles.outOfStockText}>AGOTADO</Text>
                 </View>
             )}
        </View>

        <View style={styles.info}>
            <Text style={styles.name} numberOfLines={2}>{item.nombre}</Text>
            <Text style={styles.price}>Bs {Number(item.precio || 0).toFixed(2)}</Text>
            <Text style={[styles.stock, { color: item.stock_actual <= item.stock_minimo ? '#ef4444' : '#64748b' }]}>
                {item.stock_actual > 0 ? `${item.stock_actual} disp.` : 'Sin stock'}
            </Text>
        </View>

        <TouchableOpacity
            style={[
                styles.addBtn,
                { backgroundColor: hasStock && canAddMore ? theme.colors.primary : '#cbd5e1' }
            ]}
            disabled={!hasStock || !canAddMore}
            onPress={() => {
                addItem({
                    producto_id: item.producto_id,
                    nombre: item.nombre,
                    precio: Number(item.precio),
                    imagen_url: resolvedImageUrl,
                    cantidad: 1,
                    stock_actual: item.stock_actual
                }, 'local');
            }}
        >
            <Plus size={20} color="white" />
        </TouchableOpacity>
      </Surface>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AestheticHeader title="Nueva Venta" subtitle="Catálogo de Productos" showBack />

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
        <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
            ListHeaderComponent={
                <Chip
                    selected={selectedCategory === null}
                    onPress={() => setSelectedCategory(null)}
                    style={[styles.chip, selectedCategory === null && styles.activeChip]}
                    textStyle={[styles.chipText, selectedCategory === null && styles.activeChipText]}
                    showSelectedOverlay
                >
                    Todos
                </Chip>
            }
            renderItem={({item}) => (
                <Chip
                    selected={selectedCategory === item.categoria_id}
                    onPress={() => setSelectedCategory(item.categoria_id)}
                    style={[styles.chip, selectedCategory === item.categoria_id && styles.activeChip]}
                    textStyle={[styles.chipText, selectedCategory === item.categoria_id && styles.activeChipText]}
                    showSelectedOverlay
                >
                    {item.nombre}
                </Chip>
            )}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
            data={filteredProducts}
            renderItem={renderProductItem}
            keyExtractor={item => item.producto_id.toString()}
            numColumns={2}
            contentContainerStyle={styles.grid}
            columnWrapperStyle={{ gap: 12 }}
            ListEmptyComponent={
                <View style={styles.center}>
                    <Text style={{ color: '#94a3b8', marginTop: 40 }}>No se encontraron productos</Text>
                </View>
            }
        />
      )}

      {items.length > 0 && (
          <FAB
            icon={() => <ShoppingCart color="white" />}
            label={`Ver Carrito (${items.reduce((acc, i) => acc + i.cantidad, 0)})`}
            style={[styles.fab, { backgroundColor: theme.colors.primary }]}
            color="white"
            onPress={() => navigation.navigate('POSCart')}
          />
      )}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  searchSection: { paddingHorizontal: 20, paddingVertical: 12 },
  searchBar: { backgroundColor: 'white', borderRadius: 16, elevation: 0, borderWidth: 1, borderColor: '#f1f5f9' },
  searchInput: { fontSize: 15 },
  categoriesSection: { height: 50, marginBottom: 8 },
  categoriesScroll: { paddingHorizontal: 20, gap: 8 },
  chip: { backgroundColor: 'white', borderWidth: 1, borderColor: '#f1f5f9' },
  activeChip: { backgroundColor: '#1e293b' },
  chipText: { color: '#64748b' },
  activeChipText: { color: 'white' },
  grid: { padding: 20, paddingBottom: 100 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Card
  card: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    position: 'relative'
  },
  imageContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative'
  },
  image: { width: '100%', height: '100%', borderRadius: 12 },
  badge: { position: 'absolute', top: -5, right: -5 },
  outOfStockOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ef4444'
  },
  outOfStockText: { color: '#ef4444', fontSize: 10, fontWeight: '900' },
  info: { alignItems: 'center', width: '100%' },
  name: { fontSize: 13, fontWeight: '700', color: '#1e293b', textAlign: 'center', height: 36 },
  price: { fontSize: 16, fontWeight: '900', color: '#0f172a', marginVertical: 4 },
  stock: { fontSize: 11, fontWeight: '500' },
  addBtn: {
    position: 'absolute',
    bottom: -10,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 }
  },
  fab: { position: 'absolute', margin: 20, right: 0, bottom: 0, borderRadius: 30 }
});
