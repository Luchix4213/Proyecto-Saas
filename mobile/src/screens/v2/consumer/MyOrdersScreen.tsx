import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Surface, useTheme, ActivityIndicator, IconButton, Divider, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AestheticHeader } from '../../../components/v2/AestheticHeader';
import { ShoppingBag, Calendar, ChevronRight, PackageCheck } from 'lucide-react-native';
import { orderStorage, LocalOrder } from '../../../utils/orderStorage';

export const MyOrdersScreen = () => {
    const navigation = useNavigation<any>();
    const theme = useTheme();
    const [orders, setOrders] = useState<LocalOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadOrders();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadOrders();
        setRefreshing(false);
    };

    const loadOrders = async () => {
        const data = await orderStorage.getOrders();
        setOrders(data);
        setLoading(false);
    };

    const renderOrderItem = ({ item }: { item: LocalOrder }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('StoreHome', { tenantSlug: item.store_slug, tenantName: item.store_name })}
        >
            <Surface style={styles.orderCard} elevation={1}>
                <View style={styles.orderHeader}>
                    <View style={styles.orderIconBox}>
                        <ShoppingBag size={20} color={theme.colors.primary} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.storeName}>{item.store_name}</Text>
                        <View style={styles.dateRow}>
                            <Calendar size={12} color="#64748b" />
                            <Text style={styles.dateText}>{new Date(item.fecha).toLocaleDateString()}</Text>
                        </View>
                    </View>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>{item.estado}</Text>
                    </View>
                </View>

                <Divider style={{ marginVertical: 12 }} />

                <View style={styles.orderFooter}>
                    <Text style={styles.itemCount}>{item.items_count} {item.items_count === 1 ? 'producto' : 'productos'}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.totalText}>Bs {item.total.toFixed(2)}</Text>
                        <ChevronRight size={20} color="#cbd5e1" />
                    </View>
                </View>
            </Surface>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <AestheticHeader title="Mis Pedidos" subtitle="Historial local de compras" />

            <FlatList
                data={orders}
                renderItem={renderOrderItem}
                keyExtractor={(item, index) => item.order_id?.toString() || index.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <PackageCheck size={64} color="#e2e8f0" />
                        <Text style={styles.emptyTitle}>No tienes pedidos aún</Text>
                        <Text style={styles.emptySubtitle}>Cuando realices un pedido, aparecerá aquí para que puedas hacer seguimiento.</Text>
                        <Button
                            mode="contained"
                            style={{ marginTop: 20, borderRadius: 12 }}
                            onPress={() => navigation.navigate('HomeTab')}
                        >
                            Explorar Tiendas
                        </Button>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    listContent: { padding: 20 },
    orderCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2, // For Android shadow
    },
    orderHeader: { flexDirection: 'row', alignItems: 'center' },
    orderIconBox: { backgroundColor: '#f5f3ff', padding: 10, borderRadius: 12 },
    storeName: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
    dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    dateText: { fontSize: 12, color: '#64748b' },
    statusBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 10, fontWeight: '700', color: '#10b981', textTransform: 'uppercase' },
    orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    itemCount: { fontSize: 13, color: '#64748b' },
    totalText: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginRight: 4 },
    emptyContainer: { alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginTop: 20 },
    emptySubtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 8 }
});
