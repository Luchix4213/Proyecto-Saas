import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Text, Surface, useTheme, IconButton, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AestheticHeader } from '../..//components/v2/AestheticHeader';
import { Bell, Info, AlertCircle, CheckCircle, X, ShoppingBag, Package } from 'lucide-react-native';
import { productsService } from '../..//api/productsService';
import { salesService } from '../..//api/salesService';

interface NotificationItem {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    time: string;
    rawDate?: Date;
}

export const NotificationsScreen = () => {
    const navigation = useNavigation();
    const theme = useTheme();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            loadNotifications();
        }, [])
    );

    const loadNotifications = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];

            const [products, sales] = await Promise.all([
                productsService.getAll(),
                salesService.getAll({ inicio: today })
            ]);

            const newNotifications: NotificationItem[] = [];

            // 1. Check Low Stock
            products.forEach(p => {
                if (p.stock_actual <= p.stock_minimo) {
                    newNotifications.push({
                        id: `stock-${p.producto_id}`,
                        title: 'Stock Bajo',
                        message: `El producto "${p.nombre}" tiene solo ${p.stock_actual} unidades.`,
                        type: 'warning',
                        time: 'Ahora',
                        rawDate: new Date()
                    });
                }
            });

            // 2. Check Recent Sales
            sales.forEach(s => {
                const timeStr = new Date(s.fecha_venta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                newNotifications.push({
                    id: `sale-${s.venta_id}`,
                    title: 'Nueva Venta',
                    message: `Venta #${s.venta_id} registrada por Bs ${Number(s.total).toFixed(2)}.`,
                    type: 'success',
                    time: timeStr,
                    rawDate: new Date(s.fecha_venta)
                });
            });

            // Sort by recent
            newNotifications.sort((a, b) => (b.rawDate?.getTime() || 0) - (a.rawDate?.getTime() || 0));

            // Add Welcome if empty or just as a persistent info
            if (newNotifications.length === 0) {
                 newNotifications.push({
                    id: 'welcome',
                    title: 'Todo en orden',
                    message: 'No hay alertas críticas ni ventas recientes hoy.',
                    type: 'info',
                    time: 'Ahora',
                    rawDate: new Date()
                });
            }

            setNotifications(newNotifications);
        } catch (error) {
            console.error('Error loading notifications', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadNotifications();
    };

    const getIcon = (type: string) => {
        switch(type) {
            case 'success': return { icon: CheckCircle, color: '#10b981', bg: '#ecfdf5' };
            case 'warning': return { icon: AlertCircle, color: '#f59e0b', bg: '#fffbeb' };
            case 'error': return { icon: AlertCircle, color: '#ef4444', bg: '#fef2f2' };
            default: return { icon: Info, color: '#3b82f6', bg: '#eff6ff' };
        }
    };

    const handleDismiss = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const renderItem = ({ item }: { item: NotificationItem }) => {
        const { icon: Icon, color, bg } = getIcon(item.type);
        return (
            <Surface style={styles.card} elevation={0}>
                <View style={[styles.iconBox, { backgroundColor: bg }]}>
                    <Icon size={20} color={color} />
                </View>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.time}>{item.time}</Text>
                    </View>
                    <Text style={styles.message}>{item.message}</Text>
                </View>
                {item.id !== 'welcome' && (
                    <IconButton
                        icon={() => <X size={16} color="#94a3b8" />}
                        onPress={() => handleDismiss(item.id)}
                        style={{ margin: 0, width: 20, height: 20 }}
                    />
                )}
            </Surface>
        );
    };

    if (loading && !refreshing) {
        return (
             <View style={{ flex: 1, backgroundColor: '#f8fafc', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
             </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <AestheticHeader title="Notificaciones" subtitle="Centro de Novedades" />

            <FlatList
                data={notifications}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Bell size={48} color="#cbd5e1" />
                        <Text style={styles.emptyText}>No tienes notificaciones nuevas</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    list: { padding: 20 },
    card: {
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    content: { flex: 1, marginRight: 8 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    title: { fontSize: 13, fontWeight: '700', color: '#1e293b' },
    time: { fontSize: 11, color: '#94a3b8' },
    message: { fontSize: 13, color: '#64748b', lineHeight: 18 },
    empty: { alignItems: 'center', marginTop: 100, gap: 16 },
    emptyText: { color: '#94a3b8', fontSize: 16, fontWeight: '600' }
});
