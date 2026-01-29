import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, TextInput as NativeTextInput, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Text, Surface, Button, useTheme, Divider, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AestheticHeader } from '../../../components/v2/AestheticHeader';
import { useCartStore } from '../../../store/cartStore';
import { useAuthStore } from '../../../store/authStore';
import { salesService } from '../../../api/salesService';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Banknote, QrCode, CheckCircle, Calculator, User } from 'lucide-react-native';

export const POSCheckoutScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const theme = useTheme();

    // Params
    const { client } = route.params || {};

    // Store
    const { items, total, clearCart } = useCartStore();

    // State
    const [paymentMethod, setPaymentMethod] = useState<'EFECTIVO' | 'QR'>('EFECTIVO');
    const [cashReceived, setCashReceived] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const change = Math.max(0, (Number(cashReceived) || 0) - total);

    const handleProcessSale = async () => {
        if (items.length === 0) return;
        if (paymentMethod === 'EFECTIVO' && Number(cashReceived) < total) {
            Alert.alert('Error', 'El monto recibido es menor al total.');
            return;
        }

        setLoading(true);
        try {
            const saleData = {
                cliente_id: client?.cliente_id || null,
                productos: items.map(i => ({
                    producto_id: i.producto_id,
                    cantidad: i.cantidad
                })),
                metodo_pago: paymentMethod,
                tipo_venta: 'FISICA',
                monto_recibido: Number(cashReceived) || total,
            };

            // Call API
            // @ts-ignore - Ignoring type mismatch for quick fix, assume backend handles it or update type later
            await salesService.create(saleData);

            setSuccess(true);
            clearCart();
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', 'No se pudo registrar la venta. ' + (error.response?.data?.message || ''));
        } finally {
            setLoading(false);
        }
    };

    const { user } = useAuthStore();

    if (success) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <View style={styles.successBox}>
                    <CheckCircle size={80} color="#22c55e" />
                    <Text style={styles.successTitle}>¡Venta Exitosa!</Text>
                    <Text style={styles.successSub}>La transacción se ha registrado correctamente.</Text>
                    <Text style={styles.successChange}>Cambio: Bs {change.toFixed(2)}</Text>

                    <Button
                        mode="contained"
                        style={styles.successBtn}
                        labelStyle={{ fontSize: 16, fontWeight: '800' }}
                        onPress={() => navigation.navigate('POSCatalog')} // Reset to new sale
                    >
                        NUEVA VENTA
                    </Button>

                    <Button mode="text" onPress={() => {
                        if (user?.rol === 'OWNER') {
                             // @ts-ignore
                            navigation.navigate('OwnerMain', { screen: 'Sales' });
                        } else {
                            navigation.navigate('Sales');
                        }
                    }}>
                        Ver Historial
                    </Button>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <AestheticHeader title="Checkout" subtitle="Finalizar Venta" showBack />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content}>

                    {/* Summary Card */}
                    <Surface style={styles.summaryCard} elevation={2}>
                        <View style={styles.clientRow}>
                            <User size={16} color="#64748b" />
                            <Text style={styles.clientName}>
                                {client ? `${client.nombre} ${client.paterno}` : 'Consumidor Final'}
                            </Text>
                        </View>
                        <Divider style={styles.divider} />
                        <View style={styles.totalBlock}>
                            <Text style={styles.totalLabel}>Total a Pagar</Text>
                            <Text style={styles.totalBig}>Bs {total.toFixed(2)}</Text>
                        </View>
                        <Text style={styles.itemCount}>{items.reduce((acc, i) => acc + i.cantidad, 0)} items</Text>
                    </Surface>

                    {/* Payment Method */}
                    <Text style={styles.sectionTitle}>Método de Pago</Text>
                    <View style={styles.methodsRow}>
                        <TouchableOpacity
                            style={[styles.methodCard, paymentMethod === 'EFECTIVO' && styles.methodActive]}
                            onPress={() => setPaymentMethod('EFECTIVO')}
                        >
                            <Banknote size={32} color={paymentMethod === 'EFECTIVO' ? 'white' : '#64748b'} />
                            <Text style={[styles.methodText, paymentMethod === 'EFECTIVO' && styles.methodTextActive]}>Efectivo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.methodCard, paymentMethod === 'QR' && styles.methodActive]}
                            onPress={() => setPaymentMethod('QR')}
                        >
                            <QrCode size={32} color={paymentMethod === 'QR' ? 'white' : '#64748b'} />
                            <Text style={[styles.methodText, paymentMethod === 'QR' && styles.methodTextActive]}>QR Simple</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Cash Calculation */}
                    {paymentMethod === 'EFECTIVO' && (
                        <Surface style={styles.cashSection} elevation={1}>
                            <View style={styles.cashHeader}>
                                <Calculator size={20} color={theme.colors.primary} />
                                <Text style={styles.cashTitle}>Calculadora de Cambio</Text>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Monto Recibido</Text>
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.currencyPrefix}>Bs</Text>
                                    <NativeTextInput
                                        style={styles.cashInput}
                                        value={cashReceived}
                                        onChangeText={setCashReceived}
                                        keyboardType="numeric"
                                        placeholder="0.00"
                                        placeholderTextColor="#cbd5e1"
                                    />
                                </View>
                            </View>

                            <View style={[styles.changeRow, { backgroundColor: change < 0 ? '#fef2f2' : '#f0fdf4' }]}>
                                <Text style={styles.changeLabel}>Cambio a devolver</Text>
                                <Text style={[styles.changeValue, { color: change < 0 ? '#ef4444' : '#16a34a' }]}>
                                    Bs {change.toFixed(2)}
                                </Text>
                            </View>
                        </Surface>
                    )}

                </ScrollView>

                <View style={styles.footer}>
                     <Button
                        mode="contained"
                        style={styles.payBtn}
                        contentStyle={{ height: 60 }}
                        labelStyle={{ fontSize: 18, fontWeight: '900', letterSpacing: 1 }}
                        onPress={handleProcessSale}
                        loading={loading}
                        disabled={loading}
                     >
                        Confirmar Cobro
                     </Button>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    content: { padding: 20 },

    summaryCard: { backgroundColor: 'white', borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 32 },
    clientRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    clientName: { fontSize: 16, fontWeight: '600', color: '#64748b' },
    divider: { width: '100%', marginBottom: 16 },
    totalBlock: { alignItems: 'center' },
    totalLabel: { fontSize: 14, color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' },
    totalBig: { fontSize: 48, fontWeight: '900', color: '#0f172a' },
    itemCount: { marginTop: 8, fontSize: 14, color: '#64748b', fontWeight: '500' },

    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginBottom: 12 },
    methodsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    methodCard: { flex: 1, backgroundColor: 'white', padding: 20, borderRadius: 16, alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#f1f5f9' },
    methodActive: { backgroundColor: '#1e293b', borderColor: '#1e293b' },
    methodText: { fontWeight: '700', color: '#64748b' },
    methodTextActive: { color: 'white' },

    cashSection: { backgroundColor: 'white', padding: 20, borderRadius: 20 },
    cashHeader: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 20 },
    cashTitle: { fontSize: 16, fontWeight: '700', color: '#334155' },
    inputGroup: { marginBottom: 20 },
    inputLabel: { fontSize: 12, fontWeight: '700', color: '#94a3b8', marginBottom: 8 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 16, height: 56 },
    currencyPrefix: { fontSize: 18, fontWeight: '700', color: '#64748b', marginRight: 8 },
    cashInput: { flex: 1, fontSize: 24, fontWeight: '700', color: '#0f172a' },

    changeRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderRadius: 12, alignItems: 'center' },
    changeLabel: { fontSize: 14, fontWeight: '700', color: '#64748b' },
    changeValue: { fontSize: 20, fontWeight: '900' },

    footer: { padding: 20, backgroundColor: 'white' },
    payBtn: { borderRadius: 16, backgroundColor: '#16a34a' },

    // Success
    successBox: { alignItems: 'center', padding: 40, width: '100%' },
    successTitle: { fontSize: 28, fontWeight: '900', color: '#10b981', marginTop: 24 },
    successSub: { fontSize: 16, color: '#64748b', textAlign: 'center', marginTop: 8 },
    successChange: { fontSize: 20, fontWeight: '700', color: '#334155', marginTop: 32, marginBottom: 40 },
    successBtn: { width: '100%', borderRadius: 16, height: 56, justifyContent: 'center', marginBottom: 16 }
});
