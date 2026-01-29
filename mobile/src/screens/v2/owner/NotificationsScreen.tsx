import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Surface, useTheme, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AestheticHeader } from '../../../components/v2/AestheticHeader';
import { Bell, Info, AlertCircle, CheckCircle, X } from 'lucide-react-native';

// Mock data (replace with real service later)
const MOCK_NOTIFICATIONS = [
  { id: '1', title: 'Bienvenido de nuevo', message: 'Has iniciado sesión exitosamente.', type: 'info', time: 'Hace 5 min' },
  { id: '2', title: 'Venta realizada', message: 'Se ha registrado una nueva venta #1234.', type: 'success', time: 'Hace 1 hora' },
  { id: '3', title: 'Stock bajo', message: 'El producto "Coca Cola" se está agotando.', type: 'warning', time: 'Hace 2 horas' },
];

export const NotificationsScreen = () => {
    const navigation = useNavigation();
    const theme = useTheme();
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

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

    const renderItem = ({ item }: { item: any }) => {
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
                <IconButton
                    icon={() => <X size={16} color="#94a3b8" />}
                    onPress={() => handleDismiss(item.id)}
                    style={{ margin: 0 }}
                />
            </Surface>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <AestheticHeader title="Notificaciones" subtitle="Centro de Novedades" />

            <FlatList
                data={notifications}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
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
    title: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
    time: { fontSize: 11, color: '#94a3b8' },
    message: { fontSize: 13, color: '#64748b', lineHeight: 20 },
    empty: { alignItems: 'center', marginTop: 100, gap: 16 },
    emptyText: { color: '#94a3b8', fontSize: 16, fontWeight: '600' }
});
