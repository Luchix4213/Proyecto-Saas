import React, { useState, useEffect } from 'react';
import { View, FlatList, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface, useTheme, ActivityIndicator, IconButton, Badge } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AestheticHeader } from '../../components/v2/AestheticHeader';
import client from '../../api/client'; // Direct client usage for notifications
import { Bell, Package, CheckCircle, AlertTriangle, ShoppingBag, X } from 'lucide-react-native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Notification {
    notificacion_id: number;
    mensaje: string;
    tipo: 'STOCK_BAJO' | 'VENTA_NUEVA' | 'COMPRA_APROBADA' | 'GENERAL';
    leida: boolean;
    fecha_creacion: string;
    data?: any;
}

export const NotificationsScreen = () => {
    const navigation = useNavigation<any>();
    const theme = useTheme();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = async () => {
        try {
            const response = await client.get('/notificaciones');
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            await client.patch(`/notificaciones/${id}/leer`);
            setNotifications(prev => prev.map(n => n.notificacion_id === id ? { ...n, leida: true } : n));
        } catch (error) {
            console.error('Error marking as read', error);
        }
    };

    const markAllRead = async () => {
        try {
            await client.patch(`/notificaciones/leer-todas`);
            setNotifications(prev => prev.map(n => ({ ...n, leida: true })));
        } catch (error) {
            console.error('Error marking all as read', error);
        }
    };

    const deleteRead = async () => {
        try {
            await client.delete(`/notificaciones/limpiar-leidas`);
            setNotifications(prev => prev.filter(n => !n.leida));
        } catch (error) {
           console.error('Error clearing read notifications', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const getIcon = (tipo: string) => {
        switch (tipo) {
            case 'STOCK_BAJO': return <AlertTriangle size={24} color="#ef4444" />;
            case 'VENTA_NUEVA': return <ShoppingBag size={24} color="#10b981" />;
            case 'COMPRA_APROBADA': return <CheckCircle size={24} color="#3b82f6" />;
            default: return <Bell size={24} color="#6366f1" />;
        }
    };

    const renderItem = ({ item }: { item: Notification }) => (
        <TouchableOpacity
            onPress={() => !item.leida && markAsRead(item.notificacion_id)}
            activeOpacity={0.8}
        >
            <Surface style={[styles.card, !item.leida && styles.unreadCard]} elevation={1}>
                <View style={styles.iconContainer}>
                    {getIcon(item.tipo)}
                </View>
                <View style={styles.contentContainer}>
                    <Text style={[styles.message, !item.leida && styles.boldText]}>{item.mensaje}</Text>
                    <Text style={styles.date}>
                        {format(new Date(item.fecha_creacion), "d 'de' MMMM, HH:mm", { locale: es })}
                    </Text>
                </View>
                {!item.leida && <View style={styles.dot} />}
            </Surface>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <AestheticHeader title="Notificaciones" subtitle="Mantente al día" showBack />

            <View style={styles.actionsBar}>
                <TouchableOpacity onPress={markAllRead}>
                     <Text style={styles.actionText}>Marcar todo como leído</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={deleteRead}>
                     <Text style={[styles.actionText, { color: '#ef4444' }]}>Borrar leídas</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={item => item.notificacion_id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotifications(); }} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Bell size={48} color="#cbd5e1" />
                            <Text style={styles.emptyText}>No tienes notificaciones nuevas</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    actionsBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    actionText: { fontSize: 13, fontWeight: '600', color: '#6366f1' },
    listContent: { padding: 20 },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 12,
        backgroundColor: 'white',
        borderRadius: 16,
        // Default shadow
    },
    unreadCard: {
        backgroundColor: '#eff6ff', // Light blue tint
        borderLeftWidth: 4,
        borderLeftColor: '#3b82f6'
    },
    iconContainer: { marginRight: 16 },
    contentContainer: { flex: 1 },
    message: { fontSize: 14, color: '#334155', lineHeight: 20 },
    boldText: { fontWeight: '700', color: '#0f172a' },
    date: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3b82f6', marginLeft: 8 },
    emptyContainer: { alignItems: 'center', marginTop: 60, gap: 12 },
    emptyText: { color: '#94a3b8', fontSize: 16, fontWeight: '500' }
});
