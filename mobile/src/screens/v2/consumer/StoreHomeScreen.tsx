import React, { useState, useEffect } from 'react';
import { View, FlatList, Image, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Surface, Searchbar, useTheme, Button, IconButton, Badge } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ShoppingCart, Store as StoreIcon, Clock, MapPin, Search, Heart } from 'lucide-react-native';
import { consumerService, PublicTenant, PublicProduct, PublicCategory } from '../../../api/consumerService';
import { productsService } from '../../../api/productsService';
import { getApiImageUrl } from '../../../utils/imageUtils';
import { useCartStore } from '../../../store/cartStore';

export const StoreHomeScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const theme = useTheme();
    const { items } = useCartStore();

    // Params determine if we are in Marketplace mode or Storefront mode
    const { tenantSlug, tenantName } = route.params || {};
    const isStorefront = !!tenantSlug;

    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [tenants, setTenants] = useState<PublicTenant[]>([]);
    const [products, setProducts] = useState<PublicProduct[]>([]);
    const [categories, setCategories] = useState<PublicCategory[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

    // Debounce search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            loadData(searchQuery);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, tenantSlug, selectedCategoryId]);

    // Initial load handled by search effect (searchQuery is '' initially)

    const loadData = async (query = '') => {
        setLoading(true);
        try {
            if (isStorefront) {
                const [productData, categoryData] = await Promise.all([
                    consumerService.getStoreProducts(tenantSlug, selectedCategoryId || undefined, query),
                    consumerService.getStoreCategories(tenantSlug)
                ]);
                setProducts(productData);
                setCategories(categoryData);
            } else {
                const data = await consumerService.getFeaturedTenants(undefined, query);
                // For Home, we want global products as well? The user asked for "products of any company" in home.
                // Assuming "Home" means the initial screen where featured tenants are shown.
                // Currently it shows tenants. User asked "en el inicio me cargue solo productos de cualquier empresa".
                // So instead of featured tenants, we should show global products?
                // The implementation plan says "Use getGlobalProducts".
                // Converting this screen to show Products in the main view instead of Tenants.

                const globalProducts = await productsService.getGlobalProducts(selectedCategoryId || undefined);
                // Map Product[] to PublicProduct[]
                const mappedProducts: PublicProduct[] = globalProducts.map(p => {
                    return {
                        producto_id: p.producto_id,
                        nombre: p.nombre,
                        precio: p.precio,
                        imagen_url: p.imagenes?.find(i => i.es_principal)?.url || p.imagenes?.[0]?.url || '',
                        categoria_id: p.categoria_id,
                        categoria: p.categoria ? {
                            nombre: p.categoria.nombre,
                        } : undefined,
                        descripcion: p.descripcion || null,
                        stock_actual: p.stock_actual,

                        // Extra fields for navigation
                        tenant_id: p.tenant?.tenant_id,
                        tenant_slug: p.tenant?.slug,
                    } as unknown as PublicProduct;
                });
                setProducts(mappedProducts);
                // cleaning tenants as we are showing products now
                setTenants([]);
            }
        } catch (error) {
            console.error('Error loading data', error);
        } finally {
            setLoading(false);
        }
    };

    // Data is already filtered by backend
    const filteredProducts = products;
    // const filteredTenants = tenants; // Unused if we show products

    // Helper for images
    const getImg = (url?: string | null) => getApiImageUrl(url) || 'https://via.placeholder.com/150';

    // We don't need renderTenant if we are showing global products in home
    /*
    const renderTenant = ({ item }: { item: PublicTenant }) => (
         // ... existing code ...
    );
    */

    const renderProduct = ({ item }: { item: PublicProduct }) => (
        <TouchableOpacity
            style={styles.productCardContainer}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ProductDetail', { product: { ...item, tenant_slug: tenantSlug }, tenantName })}
        >
            <Surface style={styles.productCard} elevation={1}>
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: getImg(item.imagen_url) }}
                        style={styles.productImage}
                        resizeMode="cover"
                    />
                    <Surface style={styles.priceTag} elevation={2}>
                        <Text style={styles.priceTagText}>Bs {Number(item.precio).toFixed(2)}</Text>
                    </Surface>
                </View>
                <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>{item.nombre}</Text>
                    {item.categoria && (
                        <Text style={styles.itemCategoryName}>{item.categoria.nombre}</Text>
                    )}
                </View>
            </Surface>
        </TouchableOpacity>
    );

    const SkeletonCard = () => (
        <View style={styles.skeletonCard}>
            <View style={styles.skeletonImage} />
            <View style={styles.skeletonText} />
            <View style={[styles.skeletonText, { width: '60%' }]} />
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <View style={styles.skeletonHeaderCircle} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <View style={[styles.skeletonText, { width: 100 }]} />
                        <View style={[styles.skeletonText, { width: 150, height: 20 }]} />
                    </View>
                </View>
                <View style={styles.searchSection}>
                    <View style={[styles.skeletonText, { width: '100%', height: 50, borderRadius: 16 }]} />
                </View>
                <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10 }}>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                        {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {isStorefront && (
                        <IconButton
                            icon="arrow-left"
                            size={24}
                            onPress={() => navigation.goBack()}
                            style={{ marginLeft: -10 }}
                        />
                    )}
                    <View>
                        <Text style={styles.welcomeText}>
                            {isStorefront ? 'Tienda' : 'Entrega en'}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {!isStorefront && <MapPin size={16} color={theme.colors.primary} style={{ marginRight: 4 }} />}
                            <Text style={styles.storeName}>
                                {isStorefront ? tenantName : 'Santa Cruz, BO'}
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <IconButton
                        icon={() => <Clock size={24} color="#1e293b" />}
                        onPress={() => navigation.navigate('OrdersTab')}
                    />
                    <IconButton
                        icon={() => <Heart size={24} color="#1e293b" />}
                        onPress={() => navigation.navigate('FavoritesTab')}
                    />
                    <View>
                        <IconButton
                            icon={() => <ShoppingCart size={24} color="#1e293b" />}
                            onPress={() => navigation.navigate('Cart')}
                        />
                        {items.length > 0 && (
                            <Badge style={styles.badge} size={16}>{items.length}</Badge>
                        )}
                    </View>
                </View>
            </View>

            {/* Search Section */}
            <TouchableOpacity style={styles.searchSection} onPress={() => navigation.navigate('SearchTab')} activeOpacity={0.9}>
                <Searchbar
                    placeholder={isStorefront ? `Buscar en ${tenantName}...` : "Buscar tiendas..."}
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={{ backgroundColor: 'white', elevation: 0, borderWidth: 1, borderColor: '#f1f5f9' }}
                    inputStyle={{ fontSize: 14 }}
                    iconColor={theme.colors.primary}
                />
            </TouchableOpacity>

            {/* Content */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {isStorefront ? (
                    <View>
                        {/* Categories Horizontal Scroller */}
                        {categories.length > 0 && (
                            <View style={styles.categoriesWrapper}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
                                    <TouchableOpacity
                                        style={[styles.categoryChip, selectedCategoryId === null && styles.categoryChipActive]}
                                        onPress={() => setSelectedCategoryId(null)}
                                    >
                                        <Text style={[styles.categoryText, selectedCategoryId === null && styles.categoryTextActive]}>Todos</Text>
                                    </TouchableOpacity>
                                    {categories.map((cat) => (
                                        <TouchableOpacity
                                            key={cat.categoria_id}
                                            style={[styles.categoryChip, selectedCategoryId === cat.categoria_id && styles.categoryChipActive]}
                                            onPress={() => setSelectedCategoryId(cat.categoria_id)}
                                        >
                                            <Text style={[styles.categoryText, selectedCategoryId === cat.categoria_id && styles.categoryTextActive]}>
                                                {cat.nombre}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                        <FlatList
                            data={filteredProducts}
                            renderItem={renderProduct}
                            keyExtractor={item => item.producto_id.toString()}
                            numColumns={2}
                            scrollEnabled={false}
                            columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 20 }}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptySubtitle}>No hay productos disponibles.</Text>
                                </View>
                            }
                        />
                    </View>
                ) : (
                    <View>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Explorar Mercado</Text>
                        </View>
                        <FlatList
                            data={filteredProducts}
                            renderItem={renderProduct}
                            keyExtractor={item => item.producto_id.toString()}
                            numColumns={2}
                            scrollEnabled={false}
                            columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 20 }}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <Search size={48} color="#e2e8f0" />
                                    <Text style={styles.emptyTitle}>No encontramos productos</Text>
                                    <Text style={styles.emptySubtitle}>Intenta con otros términos.</Text>
                                </View>
                            }
                        />
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 },
    welcomeText: { fontSize: 14, color: '#64748b' },
    storeName: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
    badge: { position: 'absolute', top: 4, right: 4, backgroundColor: '#ef4444' },

    searchSection: { paddingHorizontal: 20, marginBottom: 16 },
    searchBar: { backgroundColor: 'white', borderRadius: 16, elevation: 0, borderWidth: 1, borderColor: '#f1f5f9' },
    searchInput: { fontSize: 14 },

    categoriesWrapper: { marginBottom: 20 },
    categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'white', borderWidth: 1, borderColor: '#f1f5f9', marginRight: 8 },
    categoryChipActive: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
    categoryText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
    categoryTextActive: { color: 'white' },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },

    tenantCardContainer: { marginBottom: 16 },
    tenantCard: { backgroundColor: 'white', borderRadius: 16, overflow: 'hidden' },
    tenantBanner: { width: '100%', height: 100, backgroundColor: '#cbd5e1' },
    tenantInfo: { padding: 12 },
    tenantHeader: { flexDirection: 'row', alignItems: 'center', marginTop: -30 },
    tenantLogo: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: 'white', backgroundColor: '#f1f5f9' },
    tenantName: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
    tenantCategory: { fontSize: 12, color: '#64748b' },

    productCardContainer: { width: '48%', marginBottom: 16 },
    productCard: { backgroundColor: 'white', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#f1f5f9' },
    imageContainer: { height: 140, backgroundColor: '#f1f5f9', position: 'relative' },
    productImage: { width: '100%', height: '100%' },
    priceTag: { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'white', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    priceTagText: { fontSize: 13, fontWeight: '800', color: '#10b981' },
    productInfo: { padding: 12 },
    productName: { fontSize: 14, fontWeight: '700', color: '#1e293b', marginBottom: 4, height: 40 },
    itemCategoryName: { fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 },
    addButton: { marginHorizontal: 10, marginBottom: 10, borderRadius: 8 },

    emptyContainer: { alignItems: 'center', marginTop: 40, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginTop: 12 },
    emptySubtitle: { fontSize: 13, color: '#64748b', textAlign: 'center', marginTop: 4 },

    // Skeleton Styles
    skeletonCard: { width: '48%', marginBottom: 16 },
    skeletonImage: { height: 140, backgroundColor: '#f1f5f9', borderRadius: 20, marginBottom: 8 },
    skeletonText: { height: 12, backgroundColor: '#f1f5f9', borderRadius: 4, marginBottom: 8 },
    skeletonHeaderCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f1f5f9' }
});
