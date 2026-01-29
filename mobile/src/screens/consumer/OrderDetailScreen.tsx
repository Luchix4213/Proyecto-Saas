import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Image, Alert, TouchableOpacity } from 'react-native';
import { Text, Surface, Button, IconButton, useTheme, Divider, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AestheticHeader } from '../..//components/v2/AestheticHeader';
import { Calendar, Store, MapPin, Truck, CheckCircle, Clock, XCircle, ArrowRight } from 'lucide-react-native';
import { orderStorage, LocalOrder } from '../..//utils/orderStorage';
import { getApiImageUrl } from '../..//utils/imageUtils';

export const OrderDetailScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { orderId } = route.params || {};

    const [order, setOrder] = useState<LocalOrder | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrder();
    }, [orderId]);

    const loadOrder = async () => {
        try {
            const orders = await orderStorage.getOrders();
            const found = orders.find(o => o.order_id === orderId);
            setOrder(found || null);
        } catch (error) {
            console.error('Error loading order', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!order) {
        return (
            <SafeAreaView style={styles.container}>
                <AestheticHeader title="Detalle" showBack />
                <View style={[styles.center, { padding: 40 }]}>
                    <XCircle size={64} color="#cbd5e1" />
                    <Text style={{ marginTop: 16, fontSize: 18, color: '#64748b' }}>Pedido no encontrado</Text>
                </View>
            </SafeAreaView>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'REGISTRADA': return '#3b82f6';
            case 'PAGADA': return '#10b981';
            case 'EN_CAMINO': return '#f59e0b';
            case 'ENTREGADO': return '#10b981';
            case 'CANCELADA': return '#ef4444';
            default: return '#64748b';
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <AestheticHeader title={`Pedido #${orderId?.toString().slice(-4)}`} showBack />

            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Status Card */}
                <Surface style={styles.card} elevation={2}>
                    <View style={styles.rowBetween}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Store size={20} color="#64748b" />
                            <Text style={styles.storeName}>{order.store_name}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.estado) + '20' }]}>
                            <Text style={[styles.statusText, { color: getStatusColor(order.estado) }]}>{order.estado}</Text>
                        </View>
                    </View>
                    <Divider style={{ marginVertical: 12 }} />
                    <View style={styles.rowBetween}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Calendar size={16} color="#94a3b8" />
                            <Text style={styles.metaText}>{new Date(order.fecha).toLocaleString()}</Text>
                        </View>
                        <Text style={styles.totalHeader}>Bs {Number(order.total || 0).toFixed(2)}</Text>
                    </View>
                </Surface>

                {/* Items List */}
                <Text style={styles.sectionTitle}>Productos</Text>
                <Surface style={styles.card} elevation={1}>
                    {order.items?.map((item, index) => (
                        <View key={index}>
                            <View style={styles.itemRow}>
                                <Image
                                    source={{ uri: getApiImageUrl(item.imagen_url) || 'https://via.placeholder.com/100' }}
                                    style={styles.itemImage}
                                />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.itemName}>{item.nombre}</Text>
                                    <Text style={styles.itemPrice}>
                                        {item.cantidad} x Bs {Number(item.precio || 0).toFixed(2)}
                                    </Text>
                                </View>
                                <Text style={styles.itemTotal}>
                                    Bs {(item.cantidad * Number(item.precio || 0)).toFixed(2)}
                                </Text>
                            </View>
                            {index < (order.items?.length || 0) - 1 && <Divider style={{ marginVertical: 8 }} />}
                        </View>
                    ))}
                </Surface>

                {/* Delivery Info */}
                <Text style={styles.sectionTitle}>Entrega</Text>
                <Surface style={styles.card} elevation={1}>
                    <View style={styles.infoRow}>
                        <MapPin size={20} color="#64748b" />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.infoLabel}>Dirección</Text>
                            <Text style={styles.infoValue}>{order.details?.direccion || 'No especificada'}</Text>
                        </View>
                    </View>
                    {order.details?.metodo_entrega && (
                         <View style={[styles.infoRow, { marginTop: 16 }]}>
                            <Truck size={20} color="#64748b" />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.infoLabel}>Método</Text>
                                <Text style={styles.infoValue}>{order.details.metodo_entrega === 'delivery' ? 'Delivery' : 'Recojo en tienda'}</Text>
                            </View>
                        </View>
                    )}
                </Surface>

                <Button
                    mode="outlined"
                    icon={() => <Store size={18} />}
                    onPress={() => navigation.navigate('MainTabs', {
                        screen: 'HomeTab',
                        params: { tenantSlug: order.store_slug, tenantName: order.store_name }
                    })}
                    style={{ marginTop: 24, borderColor: '#cbd5e1' }}
                    textColor="#475569"
                >
                    Volver a la Tienda
                </Button>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scroll: { padding: 20 },
    card: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 8 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    storeName: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 12, fontWeight: '700' },
    metaText: { fontSize: 13, color: '#64748b' },
    totalHeader: { fontSize: 18, fontWeight: '800', color: '#10b981' },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#334155', marginTop: 24, marginBottom: 12, marginLeft: 4 },
    itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    itemImage: { width: 50, height: 50, borderRadius: 8, backgroundColor: '#f1f5f9' },
    itemName: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
    itemPrice: { fontSize: 13, color: '#64748b' },
    itemTotal: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
    infoRow: { flexDirection: 'row', gap: 12 },
    infoLabel: { fontSize: 12, color: '#94a3b8', marginBottom: 2 },
    infoValue: { fontSize: 14, color: '#334155' }
});
