import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert, Linking, Image, Modal } from 'react-native';
import { Text, Surface, Button, useTheme, ActivityIndicator, IconButton, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { salesService, Venta } from '../../api/salesService';
import { AestheticHeader } from '../../components/v2/AestheticHeader';
import { User, MapPin, Truck, Check, X, FileText, Smartphone, Eye, ExternalLink } from 'lucide-react-native';
import { format } from 'date-fns';
import { getApiImageUrl } from '../../utils/imageUtils';

export const OnlineOrderDetailScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { saleId } = route.params;
    const theme = useTheme();

    const [sale, setSale] = useState<Venta | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    useEffect(() => {
        loadSale();
    }, [saleId]);

    const loadSale = async () => {
        setLoading(true);
        try {
            const data = await salesService.getOne(saleId);
            setSale(data);
        } catch (error) {
            console.error('Error loading sale', error);
            Alert.alert('Error', 'No se pudo cargar el pedido.');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action: 'approve' | 'reject' | 'dispatch' | 'deliver') => {
        setActionLoading(true);
        try {
            if (action === 'approve') await salesService.approvePayment(saleId);
            if (action === 'reject') await salesService.rejectSale(saleId);
            if (action === 'dispatch') await salesService.markAsDispatched(saleId);
            if (action === 'deliver') await salesService.markAsDelivered(saleId);

            Alert.alert('Éxito', 'Estado actualizado correctamente.');
            loadSale();
        } catch (error) {
            console.error('Error updating status', error);
            Alert.alert('Error', 'No se pudo actualizar el estado.');
        } finally {
            setActionLoading(false);
        }
    };

    const confirmAction = (action: 'approve' | 'reject' | 'dispatch' | 'deliver', title: string, msg: string) => {
        Alert.alert(
            title,
            msg,
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Confirmar', style: action === 'reject' ? 'destructive' : 'default', onPress: () => handleAction(action) }
            ]
        );
    };

    const openMap = () => {
        if (sale?.ubicacion_maps) {
            Linking.openURL(sale.ubicacion_maps);
        } else if (sale?.latitud && sale?.longitud) {
            const url = `https://www.google.com/maps/search/?api=1&query=${sale.latitud},${sale.longitud}`;
            Linking.openURL(url);
        } else {
            Alert.alert('Sin Ubicación', 'El cliente no proporcionó ubicación exacta.');
        }
    };

    if (loading || !sale) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    const getStatusColor = () => {
        if (sale.estado === 'REGISTRADA') return '#f59e0b';
        if (sale.estado === 'PAGADA') return '#10b981';
        if (sale.estado === 'CANCELADA') return '#ef4444';
        return '#64748b';
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <AestheticHeader title={`Pedido #${sale.venta_id}`} subtitle="Detalle de Venta Online" showBack />

            <ScrollView contentContainerStyle={styles.content}>

                {/* Status Card */}
                <Surface style={styles.card} elevation={0}>
                    <View style={styles.statusRow}>
                        <View style={{ gap: 4 }}>
                            <Text style={styles.label}>Estado del Pedido</Text>
                            <View style={[styles.badge, { backgroundColor: getStatusColor() + '20' }]}>
                                <View style={[styles.dot, { backgroundColor: getStatusColor() }]} />
                                <Text style={[styles.statusText, { color: getStatusColor() }]}>{sale.estado.replace('_', ' ')}</Text>
                            </View>
                        </View>
                        <View style={{ alignItems: 'flex-end', gap: 4 }}>
                            <Text style={styles.label}>Logística</Text>
                            <Text style={styles.logisticsText}>{sale.estado_entrega}</Text>
                        </View>
                    </View>

                    <Divider style={{ marginVertical: 16 }} />

                    {/* Actions based on state */}
                    {sale.estado === 'REGISTRADA' && (
                        <View style={styles.actionsRow}>
                            <Button
                                mode="contained"
                                onPress={() => confirmAction('approve', 'Aprobar Pago', '¿Confirmas que recibiste el pago?')}
                                style={[styles.actionBtn, { backgroundColor: '#0f172a' }]}
                                loading={actionLoading}
                            >
                                Aprobar Pago
                            </Button>
                            <Button
                                mode="outlined"
                                onPress={() => confirmAction('reject', 'Rechazar Venta', '¿Rechazar este pedido?')}
                                style={[styles.actionBtn, { borderColor: '#ef4444' }]}
                                textColor="#ef4444"
                                loading={actionLoading}
                            >
                                Rechazar
                            </Button>
                        </View>
                    )}

                    {sale.estado === 'PAGADA' && sale.estado_entrega !== 'ENTREGADO' && (
                        <View>
                            {sale.estado_entrega === 'PENDIENTE' && (
                                <Button
                                    mode="contained"
                                    icon={() => <Truck size={18} color="white" />}
                                    onPress={() => confirmAction('dispatch', 'Despachar Pedido', '¿El pedido ya está en camino?')}
                                    style={[styles.actionBtn, { backgroundColor: '#3b82f6' }]}
                                    loading={actionLoading}
                                >
                                    Marcar como Enviado
                                </Button>
                            )}
                            {sale.estado_entrega === 'EN_CAMINO' && (
                                <Button
                                    mode="contained"
                                    icon={() => <Check size={18} color="white" />}
                                    onPress={() => confirmAction('deliver', 'Confirmar Entrega', '¿El cliente ya recibió su pedido?')}
                                    style={[styles.actionBtn, { backgroundColor: '#10b981' }]}
                                    loading={actionLoading}
                                >
                                    Confirmar Entrega
                                </Button>
                            )}
                        </View>
                    )}
                </Surface>

                {/* Customer & Delivery */}
                <Text style={styles.sectionTitle}>Cliente y Entrega</Text>
                <Surface style={styles.card} elevation={0}>
                    <View style={styles.row}>
                        <User size={20} color="#64748b" />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.rowTitle}>{sale.cliente?.nombre || 'Invitado'}</Text>
                            <Text style={styles.rowSub}>{sale.cliente?.email || 'Sin email'}</Text>
                        </View>
                    </View>
                    <Divider style={{ marginVertical: 12 }} />
                    <View style={styles.row}>
                        <MapPin size={20} color="#64748b" />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.rowTitle}>Dirección de Entrega</Text>
                            <Text style={styles.rowSub}>{sale.direccion_envio || 'No especificada'}</Text>
                        </View>
                        {(sale.ubicacion_maps || (sale.latitud && sale.longitud)) && (
                            <TouchableOpacity onPress={openMap} style={styles.mapBtn}>
                                <ExternalLink size={16} color="white" />
                            </TouchableOpacity>
                        )}
                    </View>
                </Surface>

                {/* Payment Proof */}
                {sale.comprobante_pago && (
                    <>
                        <Text style={styles.sectionTitle}>Comprobante de Pago</Text>
                        <TouchableOpacity onPress={() => { setPreviewImage(getApiImageUrl(sale.comprobante_pago!)); setShowImageModal(true); }}>
                            <Surface style={styles.proofCard} elevation={0}>
                                <Image
                                    source={{ uri: getApiImageUrl(sale.comprobante_pago) || undefined }}
                                    style={styles.proofThumb}
                                    resizeMode="cover"
                                />
                                <View style={styles.proofOverlay}>
                                    <Eye size={24} color="white" />
                                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Ver Comprobante</Text>
                                </View>
                            </Surface>
                        </TouchableOpacity>
                    </>
                )}

                {/* Order Items */}
                <Text style={styles.sectionTitle}>Detalles del Pedido</Text>
                <Surface style={styles.card} elevation={0}>
                    {sale.detalles.map((detalle, index) => (
                        <View key={index} style={[styles.itemRow, index !== sale.detalles.length - 1 && styles.borderBottom]}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.itemName}>{detalle.producto?.nombre}</Text>
                                <Text style={styles.itemQty}>{detalle.cantidad} x ${Number(detalle.precio_unitario || 0).toFixed(2)}</Text>
                            </View>
                            <Text style={styles.itemTotal}>
                                ${Number(detalle.subtotal || 0).toFixed(2)}
                            </Text>
                        </View>
                    ))}
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>TOTAL</Text>
                        <Text style={styles.totalValue}>${Number(sale.total).toLocaleString()}</Text>
                    </View>
                </Surface>

            </ScrollView>

            {/* Image Modal */}
            <Modal visible={showImageModal} transparent={true} animationType="fade">
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.closeModal} onPress={() => setShowImageModal(false)}>
                        <X size={24} color="white" />
                    </TouchableOpacity>
                    {previewImage && (
                        <Image source={{ uri: previewImage }} style={styles.fullImage} resizeMode="contain" />
                    )}
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { padding: 20, paddingBottom: 40 },
    card: { backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 8, borderWidth: 1, borderColor: '#f1f5f9' },
    statusRow: { flexDirection: 'row', justifyContent: 'space-between' },
    label: { fontSize: 11, color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
    badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
    dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    statusText: { fontSize: 12, fontWeight: '800' },
    logisticsText: { fontSize: 13, fontWeight: '600', color: '#334155' },
    actionsRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
    actionBtn: { flex: 1, borderRadius: 12 },
    sectionTitle: { fontSize: 13, fontWeight: '800', color: '#64748b', marginTop: 24, marginBottom: 12, marginLeft: 4, textTransform: 'uppercase' },
    row: { flexDirection: 'row', alignItems: 'center' },
    rowTitle: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
    rowSub: { fontSize: 13, color: '#64748b', marginTop: 2 },
    mapBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0ea5e9', justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
    proofCard: { height: 160, borderRadius: 20, overflow: 'hidden', backgroundColor: 'white' },
    proofThumb: { width: '100%', height: '100%' },
    proofOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', gap: 8 },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
    borderBottom: { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    itemName: { fontSize: 14, fontWeight: '600', color: '#334155' },
    itemQty: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
    itemTotal: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    totalLabel: { fontSize: 14, fontWeight: '900', color: '#1e293b' },
    totalValue: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
    modalOverlay: { flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' },
    closeModal: { position: 'absolute', top: 50, right: 20, padding: 10, zIndex: 10 },
    fullImage: { width: '100%', height: '80%' }
});
