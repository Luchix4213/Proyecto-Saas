import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, TouchableOpacity, Image, Modal } from 'react-native';
import { Text, Surface, Button, TextInput, Divider, ActivityIndicator, useTheme, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AestheticHeader } from '../../../components/v2/AestheticHeader';
import { MapPin, Truck, Store, CreditCard, Banknote, CheckCircle, Navigation, User, Info, Camera, X, Image as ImageIcon } from 'lucide-react-native';
import { useCartStore } from '../../../store/cartStore';
import { consumerService, PublicProduct } from '../../../api/consumerService';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { storageUtils } from '../../../utils/storageUtils';
import { orderStorage } from '../../../utils/orderStorage';

export const CheckoutScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const theme = useTheme();
    const { items, total, clearCart } = useCartStore();
    const { tenantSlug } = route.params || {};

    const [loading, setLoading] = useState(false);
    const [fetchingTenant, setFetchingTenant] = useState(true);
    const [checkingNit, setCheckingNit] = useState(false);
    const [step, setStep] = useState<'identify' | 'details'>('identify');

    const [tenant, setTenant] = useState<any>(null);
    const [qrModalVisible, setQrModalVisible] = useState(false);

    // Form fields
    const [deliveryMethod, setDeliveryMethod] = useState('delivery');
    const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' or 'qr'

    const [nombreCliente, setNombreCliente] = useState('');
    const [nitCliente, setNitCliente] = useState('');
    const [celular, setCelular] = useState('');
    const [direccion, setDireccion] = useState('');
    const [referencia, setReferencia] = useState('');
    const [ubiMaps, setUbiMaps] = useState('');
    const [comprobante, setComprobante] = useState<string | null>(null);

    // Get base URL for images
    const getBaseUrl = () => process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000';
    const getImageUrl = (url: string) => url.startsWith('http') ? url : `${getBaseUrl()}${url}`;

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setFetchingTenant(true);
        try {
            // Fetch tenant info
            // Fetch tenant info
            const tenantData = await consumerService.getTenantBySlug(tenantSlug);
            setTenant(tenantData || null);

            const saved = await storageUtils.getClientData();
            if (saved) {
                setNombreCliente(saved.nombre_completo || '');
                setNitCliente(saved.nit_ci || '');
                setCelular(saved.celular || '');
                setDireccion(saved.direccion || '');
                setReferencia(saved.referencia || '');
            }
        } catch (error) {
            console.error('Error loading checkout data', error);
        } finally {
            setFetchingTenant(false);
        }
    };

    const handleCheckNit = async () => {
        if (!nitCliente) {
            setStep('details');
            return;
        }

        setCheckingNit(true);
        try {
            const client = await consumerService.checkClient(tenantSlug, nitCliente);
            if (client) {
                setNombreCliente(client.nombre_completo || client.nombre || '');
                setCelular(client.celular || client.telefono || '');
            }
            setStep('details');
        } catch (error) {
            setStep('details');
        } finally {
            setCheckingNit(false);
        }
    };

    const handleGetLocation = async () => {
        setLoading(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permiso denegado', 'Permite el acceso a la ubicación.');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const mapsLink = `https://www.google.com/maps?q=${location.coords.latitude},${location.coords.longitude}`;
            setUbiMaps(mapsLink);
        } catch (error) {
            Alert.alert('Error', 'No se pudo obtener la ubicación.');
        } finally {
            setLoading(false);
        }
    };

    const pickComprobante = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
        });

        if (!result.canceled) {
            setComprobante(result.assets[0].uri);
        }
    };

    const handleConfirm = async () => {
        if (!tenantSlug) return;
        if (deliveryMethod === 'delivery' && !direccion) {
            Alert.alert('Faltan datos', 'Ingresa la dirección de envío.');
            return;
        }
        if (!nombreCliente) {
             Alert.alert('Faltan datos', 'Ingresa tu nombre.');
             return;
        }
        if (paymentMethod === 'qr' && !comprobante) {
            Alert.alert('Falta comprobante', 'Sube la imagen de tu pago QR para continuar.');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('nombre', nombreCliente);
            formData.append('nit_ci', nitCliente || '0');
            formData.append('celular', celular || '');
            formData.append('tipo_entrega', deliveryMethod === 'delivery' ? 'DELIVERY' : 'RECOJO');
            formData.append('direccion_entrega', deliveryMethod === 'delivery' ? `${direccion} (${referencia})` : '');
            formData.append('ubi_maps_envio', ubiMaps || '');
            formData.append('metodo_pago', paymentMethod === 'qr' ? 'QR' : 'EFECTIVO');
            formData.append('productos', JSON.stringify(items.map(i => ({
                producto_id: i.producto_id,
                cantidad: i.cantidad
            }))));

            if (comprobante) {
                const filename = comprobante.split('/').pop();
                const match = /\.(\w+)$/.exec(filename || '');
                const type = match ? `image/${match[1]}` : `image/jpeg`;
                // @ts-ignore
                formData.append('comprobante', { uri: comprobante, name: filename || 'comprobante.jpg', type });
            }

            await consumerService.checkout(tenantSlug, formData);

            await storageUtils.saveClientData({
                nombre_completo: nombreCliente,
                nit_ci: nitCliente,
                celular: celular,
                direccion: direccion,
                referencia: referencia
            });

            // Save order locally for history
            await orderStorage.saveOrder({
                order_id: Date.now(), // Fallback if backend doesn't return one
                fecha: new Date().toISOString(),
                total: total,
                items_count: items.reduce((acc, current) => acc + current.cantidad, 0),
                estado: 'PENDIENTE',
                store_name: tenant?.nombre_empresa || tenantSlug,
                store_slug: tenantSlug
            });

            Alert.alert('¡Éxito!', 'Pedido realizado con éxito.', [
                { text: 'Ok', onPress: () => { clearCart(); navigation.navigate('StoreHome'); } }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Error al procesar el pedido');
        } finally {
            setLoading(false);
        }
    };

    if (fetchingTenant) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <AestheticHeader title="Checkout" subtitle={step === 'identify' ? "Paso 1: Identificación" : "Paso 2: Detalles"} showBack />

            {/* Step Indicator */}
            <View style={styles.stepIndicatorContainer}>
                <View style={styles.stepIndicatorLine} />
                <View style={[styles.stepDot, step === 'identify' || step === 'details' ? styles.stepDotActive : null]}>
                    {step === 'details' ? <CheckCircle size={16} color="white" /> : <Text style={styles.stepDotText}>1</Text>}
                </View>
                <View style={[styles.stepDot, step === 'details' ? styles.stepDotActive : null]}>
                    <Text style={[styles.stepDotText, step === 'details' && { color: 'white' }]}>2</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {step === 'identify' ? (
                    <Surface style={styles.stepContainer} elevation={0}>
                        <View style={styles.stepHeader}>
                            <User size={32} color={theme.colors.primary} />
                            <Text style={styles.stepTitle}>Identificación</Text>
                            <Text style={styles.stepSubtitle}>Ingresa tu NIT o CI para agilizar tu pedido.</Text>
                        </View>

                        <TextInput
                            mode="outlined"
                            label="NIT / CI"
                            placeholder="Número de documento"
                            value={nitCliente}
                            onChangeText={setNitCliente}
                            keyboardType="numeric"
                            style={styles.input}
                            outlineStyle={styles.inputOutline}
                        />

                        <Button
                            mode="contained"
                            style={styles.actionBtn}
                            contentStyle={{ height: 50 }}
                            onPress={handleCheckNit}
                            loading={checkingNit}
                            disabled={checkingNit}
                        >
                            Continuar
                        </Button>

                        <Button mode="text" onPress={() => setStep('details')} style={{ marginTop: 8 }}>
                            Llenar datos manualmente
                        </Button>
                    </Surface>
                ) : (
                    <View>
                        <View style={styles.sectionHeader}>
                             <Text style={styles.sectionTitle}>Tus Datos</Text>
                             <TouchableOpacity onPress={() => setStep('identify')}>
                                 <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: '700' }}>Cambiar NIT</Text>
                             </TouchableOpacity>
                        </View>
                        <View style={styles.formSection}>
                            <TextInput
                                mode="outlined"
                                label="Nombre Completo / Razón Social"
                                value={nombreCliente}
                                onChangeText={setNombreCliente}
                                style={styles.input}
                                outlineStyle={styles.inputOutline}
                            />
                            <TextInput
                                mode="outlined"
                                label="Celular (Opcional)"
                                value={celular}
                                onChangeText={setCelular}
                                style={styles.input}
                                outlineStyle={styles.inputOutline}
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.formSection}>
                            <Text style={styles.sectionTitle}>Método de Entrega</Text>
                            <View style={styles.cardSelectorRow}>
                                <TouchableOpacity
                                    style={[styles.selectorCard, deliveryMethod === 'delivery' && styles.selectorCardActive]}
                                    onPress={() => setDeliveryMethod('delivery')}
                                >
                                    <View style={[styles.selectorIconBox, deliveryMethod === 'delivery' && { backgroundColor: theme.colors.primary }]}>
                                        <Truck size={24} color={deliveryMethod === 'delivery' ? 'white' : '#64748b'} />
                                    </View>
                                    <Text style={[styles.selectorLabel, deliveryMethod === 'delivery' && styles.selectorLabelActive]}>Delivery</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.selectorCard, deliveryMethod === 'pickup' && styles.selectorCardActive]}
                                    onPress={() => setDeliveryMethod('pickup')}
                                >
                                    <View style={[styles.selectorIconBox, deliveryMethod === 'pickup' && { backgroundColor: theme.colors.primary }]}>
                                        <Store size={24} color={deliveryMethod === 'pickup' ? 'white' : '#64748b'} />
                                    </View>
                                    <Text style={[styles.selectorLabel, deliveryMethod === 'pickup' && styles.selectorLabelActive]}>Retiro</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {deliveryMethod === 'delivery' && (
                            <View style={styles.formSection}>
                                <Text style={styles.sectionTitle}>Dirección de Envío</Text>
                                <TextInput
                                    mode="outlined"
                                    label="Ciudad / Zona / Calle"
                                    value={direccion}
                                    onChangeText={setDireccion}
                                    style={styles.input}
                                    outlineStyle={styles.inputOutline}
                                />
                                <TextInput
                                    mode="outlined"
                                    label="Referencia (opcional)"
                                    value={referencia}
                                    onChangeText={setReferencia}
                                    style={styles.input}
                                    outlineStyle={styles.inputOutline}
                                />
                                <View style={styles.locationContainer}>
                                    <Button
                                        mode="contained-tonal"
                                        icon={() => <Navigation size={18} color={theme.colors.primary} />}
                                        onPress={handleGetLocation}
                                        style={styles.locationBtn}
                                        labelStyle={{ fontSize: 12 }}
                                    >
                                        {ubiMaps ? 'Ubicación Fijada' : 'Fijar con GPS'}
                                    </Button>
                                    {ubiMaps && <CheckCircle size={20} color="#10b981" />}
                                </View>
                            </View>
                        )}

                        <View style={styles.formSection}>
                            <Text style={styles.sectionTitle}>Forma de Pago</Text>
                            <View style={styles.cardSelectorRow}>
                                <TouchableOpacity
                                    style={[styles.selectorCard, paymentMethod === 'cash' && styles.selectorCardActive]}
                                    onPress={() => setPaymentMethod('cash')}
                                >
                                    <View style={[styles.selectorIconBox, paymentMethod === 'cash' && { backgroundColor: theme.colors.primary }]}>
                                        <Banknote size={24} color={paymentMethod === 'cash' ? 'white' : '#64748b'} />
                                    </View>
                                    <Text style={[styles.selectorLabel, paymentMethod === 'cash' && styles.selectorLabelActive]}>Efectivo</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.selectorCard, paymentMethod === 'qr' && styles.selectorCardActive]}
                                    onPress={() => setPaymentMethod('qr')}
                                >
                                    <View style={[styles.selectorIconBox, paymentMethod === 'qr' && { backgroundColor: theme.colors.primary }]}>
                                        <CreditCard size={24} color={paymentMethod === 'qr' ? 'white' : '#64748b'} />
                                    </View>
                                    <Text style={[styles.selectorLabel, paymentMethod === 'qr' && styles.selectorLabelActive]}>Pago QR</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {paymentMethod === 'qr' && (
                            <View style={{ marginTop: 12 }}>
                                <Surface style={styles.payInstructions} elevation={1}>
                                    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                                        <View style={styles.infoIcon}>
                                            <Info size={16} color="white" />
                                        </View>
                                        <Text style={{ fontWeight: 'bold' }}>Instrucciones de pago</Text>
                                    </View>
                                    <Text style={styles.instructionText}>
                                        1. Escanea el código QR de la tienda.
                                    </Text>
                                    <Text style={styles.instructionText}>
                                        2. Realiza el pago por el monto total.
                                    </Text>
                                    <Text style={styles.instructionText}>
                                        3. Sube una captura de pantalla del comprobante abajo.
                                    </Text>

                                    <Button
                                        mode="contained-tonal"
                                        onPress={() => setQrModalVisible(true)}
                                        style={{ marginTop: 12 }}
                                        icon="qrcode"
                                    >
                                        Ver QR de la Tienda
                                    </Button>
                                </Surface>

                                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Comprobante de Pago</Text>
                                <TouchableOpacity onPress={pickComprobante} style={styles.uploadArea}>
                                    {comprobante ? (
                                        <View style={{ width: '100%', height: '100%' }}>
                                            <Image source={{ uri: comprobante }} style={styles.previewImage} />
                                            <View style={styles.imageOverlay}>
                                                <Camera size={24} color="white" />
                                                <Text style={{ color: 'white', fontWeight: 'bold', marginTop: 4 }}>Cambiar imagen</Text>
                                            </View>
                                        </View>
                                    ) : (
                                        <View style={styles.placeholderArea}>
                                            <ImageIcon size={40} color="#cbd5e1" />
                                            <Text style={styles.placeholderText}>Toca para subir comprobante</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}

                        <Surface style={styles.summaryCard} elevation={0}>
                            <View style={styles.row}>
                                <Text style={styles.summaryText}>Total Productos</Text>
                                <Text style={styles.summaryValue}>Bs {total.toFixed(2)}</Text>
                            </View>
                        </Surface>
                    </View>
                )}
            </ScrollView>

            {step === 'details' && (
                <View style={styles.footer}>
                    <Button
                        mode="contained"
                        style={styles.confirmBtn}
                        contentStyle={{ height: 56 }}
                        onPress={handleConfirm}
                        disabled={loading}
                        loading={loading}
                    >
                        Confirmar Pedido • Bs {total.toFixed(2)}
                    </Button>
                </View>
            )}

            {/* QR Zoom Modal */}
            <Modal visible={qrModalVisible} transparent onRequestClose={() => setQrModalVisible(false)}>
                <View style={styles.modalBg}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>QR Pago - {tenant?.nombre_empresa}</Text>
                            <IconButton icon="close" onPress={() => setQrModalVisible(false)} />
                        </View>
                        <View style={styles.qrModalBody}>
                            {tenant?.qr_pago_url ? (
                                <Image
                                    source={{ uri: getImageUrl(tenant.qr_pago_url) }}
                                    style={styles.fullQr}
                                    resizeMode="contain"
                                />
                            ) : (
                                <View style={styles.noQr}>
                                    <Info size={40} color="#cbd5e1" />
                                    <Text style={{ color: '#94a3b8', marginTop: 12, textAlign: 'center' }}>
                                        La tienda no ha subido un QR. Por favor contacta al vendedor.
                                    </Text>
                                </View>
                            )}
                        </View>
                        <Button mode="contained" onPress={() => setQrModalVisible(false)} style={{ margin: 20 }}>
                            Cerrar
                        </Button>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    content: { padding: 20, paddingBottom: 40 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
    stepContainer: { backgroundColor: 'white', padding: 24, borderRadius: 24, borderWidth: 1, borderColor: '#f1f5f9', marginTop: 20 },
    stepHeader: { alignItems: 'center', marginBottom: 24 },
    stepTitle: { fontSize: 22, fontWeight: '900', color: '#1e293b', marginTop: 12 },
    stepSubtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 4 },
    actionBtn: { borderRadius: 12, marginTop: 16 },
    input: { backgroundColor: 'white', marginBottom: 12 },
    inputOutline: { borderRadius: 12, borderColor: '#e2e8f0' },
    formSection: { marginBottom: 12 },
    locationContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
    locationBtn: { flex: 1, borderRadius: 12 },
    summaryCard: { backgroundColor: '#0f172a', padding: 20, borderRadius: 20, marginTop: 24 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    summaryText: { fontSize: 14, color: '#94a3b8', fontWeight: 'bold' },
    summaryValue: { fontSize: 24, fontWeight: '900', color: '#10b981' },
    footer: { padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    confirmBtn: { borderRadius: 16 },
    payInstructions: { backgroundColor: 'white', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#f1f5f9' },
    infoIcon: { backgroundColor: '#6366f1', padding: 4, borderRadius: 8 },
    instructionText: { fontSize: 13, color: '#64748b', marginBottom: 4 },
    uploadArea: { height: 200, backgroundColor: '#f8fafc', borderRadius: 20, borderWidth: 2, borderColor: '#e2e8f0', borderStyle: 'dashed', marginTop: 12, overflow: 'hidden' },
    placeholderArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    placeholderText: { color: '#94a3b8', marginTop: 10, fontWeight: '600' },
    previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    imageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingBottom: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    modalTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
    qrModalBody: { padding: 20, alignItems: 'center', justifyContent: 'center', minHeight: 300 },
    fullQr: { width: '100%', height: 300 },
    noQr: { alignItems: 'center', padding: 40 },

    // Step Indicator Styles
    stepIndicatorContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, position: 'relative' },
    stepIndicatorLine: { position: 'absolute', height: 2, backgroundColor: '#e2e8f0', width: '40%', alignSelf: 'center', zIndex: 0 },
    stepDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'white', borderWidth: 2, borderColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center', marginHorizontal: 40, zIndex: 1 },
    stepDotActive: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
    stepDotText: { fontSize: 14, fontWeight: '800', color: '#64748b' },

    // Selector Card Styles
    cardSelectorRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
    selectorCard: { flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f1f5f9', alignItems: 'center', gap: 8 },
    selectorCardActive: { borderColor: '#6366f1', backgroundColor: '#f5f3ff' },
    selectorIconBox: { backgroundColor: '#f8fafc', padding: 10, borderRadius: 12 },
    selectorLabel: { fontSize: 14, fontWeight: '700', color: '#64748b' },
    selectorLabelActive: { color: '#6366f1' },
});
