import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Modal, FlatList, Alert } from 'react-native';
import { Text, Searchbar, Surface, Button, IconButton, useTheme, ActivityIndicator, Portal, TextInput, Divider, Badge } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AestheticHeader } from '../../components/v2/AestheticHeader';
import { productsService, Product } from '../../api/productsService';
import { salesService } from '../../api/salesService';
import { clientsService, Cliente } from '../../api/clientsService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    Grid, ShoppingCart, Plus, Minus, Trash2, User, CreditCard,
    Banknote, X, Check, Search, AlertCircle, Printer
} from 'lucide-react-native';
import { getApiImageUrl } from '../../utils/imageUtils';
import { Image } from 'react-native';

export const PosScreen = ({ navigation }: { navigation: any }) => {
    const theme = useTheme();

    // Data State
    const [products, setProducts] = useState<Product[]>([]);
    const [clients, setClients] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Cart State
    const [cart, setCart] = useState<any[]>([]); // { ...product, cartQuantity, descuento }
    const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);

    // Filtered Products
    const filteredProducts = products.filter(p =>
        p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) &&
        p.estado === 'ACTIVO'
    );

    // Modals State
    const [showCart, setShowCart] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const [showClientModal, setShowClientModal] = useState(false);
    const [successData, setSuccessData] = useState<any>(null);

    // Checkout Form
    const [paymentMethod, setPaymentMethod] = useState<'EFECTIVO' | 'QR' | 'TRANSFERENCIA'>('EFECTIVO');
    const [montoRecibido, setMontoRecibido] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [prods, clis] = await Promise.all([
                productsService.getAll(),
                clientsService.getAll()
            ]);
            setProducts(prods);
            setClients(clis);
        } catch (error) {
            console.error('Error loading POS data', error);
            Alert.alert('Error', 'No se pudieron cargar los datos del POS');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product: Product) => {
        // Check stock
        if (product.stock_actual <= 0) {
            Alert.alert('Sin Stock', 'Este producto no tiene stock disponible.');
            return;
        }

        const existing = cart.find(item => item.producto_id === product.producto_id);
        if (existing) {
            if (existing.cartQuantity >= product.stock_actual) {
                Alert.alert('Stock Máximo', 'No puedes añadir más unidades de las disponibles.');
                return;
            }
            setCart(cart.map(item =>
                item.producto_id === product.producto_id
                    ? { ...item, cartQuantity: item.cartQuantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, { ...product, cartQuantity: 1, descuento: 0 }]);
        }
    };

    const updateQuantity = (id: number, delta: number) => {
        setCart(cart.map(item => {
            if (item.producto_id === id) {
                const newQty = item.cartQuantity + delta;
                if (newQty > item.stock_actual) {
                    Alert.alert('Límite de Stock', `Solo hay ${item.stock_actual} unidades.`);
                    return item;
                }
                return { ...item, cartQuantity: Math.max(1, newQty) };
            }
            return item;
        }));
    };

    const removeFromCart = (id: number) => {
        setCart(cart.filter(item => item.producto_id !== id));
    };

    const cartTotal = cart.reduce((acc, item) => acc + (item.precio * item.cartQuantity) - (item.descuento || 0), 0);

    const handleCheckout = async () => {
        setLoading(true);
        try {
            const saleData = {
                tipo_venta: 'FISICA',
                metodo_pago: paymentMethod,
                cliente_id: selectedClient?.cliente_id || null,
                monto_recibido: montoRecibido ? parseFloat(montoRecibido) : undefined,
                productos: cart.map(item => ({
                    producto_id: item.producto_id,
                    cantidad: item.cartQuantity,
                    descuento: item.descuento
                }))
            };

            const response = await salesService.create(saleData as any);
            setSuccessData(response);
            setShowCheckout(false);
            setCart([]);
            loadData(); // Refresh stock
        } catch (error: any) {
            console.error('Checkout error', error);
            Alert.alert('Error', error.response?.data?.message || 'No se pudo procesar la venta');
        } finally {
            setLoading(false);
        }
    };

    const handleNewSale = () => {
        setSuccessData(null);
        setCart([]);
        setSelectedClient(null);
        setPaymentMethod('EFECTIVO');
        setMontoRecibido('');
    };

    if (loading && products.length === 0) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <AestheticHeader title="Nueva Venta" subtitle="Punto de Venta" showBack />
                <TouchableOpacity onPress={() => setShowCart(true)} style={styles.cartIconContainer}>
                    <Surface style={styles.cartBtn} elevation={2}>
                        <ShoppingCart size={24} color={theme.colors.primary} />
                        {cart.length > 0 && (
                            <Badge style={styles.badge}>{cart.reduce((a, b) => a + b.cartQuantity, 0)}</Badge>
                        )}
                    </Surface>
                </TouchableOpacity>
            </View>

            {/* Product Grid */}
            <View style={styles.searchContainer}>
                <Searchbar
                    placeholder="Buscar productos..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                    inputStyle={{ fontSize: 14 }}
                    elevation={0}
                />
            </View>

            <FlatList
                data={filteredProducts}
                keyExtractor={item => item.producto_id.toString()}
                numColumns={2}
                contentContainerStyle={styles.gridContent}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.gridItem}
                        onPress={() => addToCart(item)}
                        disabled={item.stock_actual <= 0}
                    >
                        <Surface style={[styles.productCard, item.stock_actual <= 0 && { opacity: 0.6 }]} elevation={1}>
                            <View style={styles.imageContainer}>
                                {item.imagenes && item.imagenes.length > 0 ? (
                                    <Image
                                        source={{ uri: getApiImageUrl(item.imagenes[0].url) || undefined }}
                                        style={styles.productImage}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View style={styles.placeholderImage}>
                                        <Grid size={30} color="#cbd5e1" />
                                    </View>
                                )}
                                {item.stock_actual <= 0 && (
                                    <View style={styles.outOfStockBadge}>
                                        <Text style={styles.outOfStockText}>AGOTADO</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.productInfo}>
                                <Text style={styles.productName} numberOfLines={2}>{item.nombre}</Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                                    <Text style={styles.productPrice}>${Number(item.precio).toFixed(2)}</Text>
                                    <Text style={[styles.stockText, item.stock_actual < 5 && { color: theme.colors.error }]}>
                                        Stock: {item.stock_actual}
                                    </Text>
                                </View>
                            </View>
                        </Surface>
                    </TouchableOpacity>
                )}
            />

            {/* Cart Modal / Sidebar */}
            <Modal visible={showCart} animationType="slide" onRequestClose={() => setShowCart(false)}>
                <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Carrito de Venta</Text>
                        <IconButton icon="close" onPress={() => setShowCart(false)} />
                    </View>

                    <ScrollView contentContainerStyle={styles.cartList}>
                        {cart.length === 0 ? (
                            <View style={styles.emptyState}>
                                <ShoppingCart size={48} color="#cbd5e1" />
                                <Text style={{ color: '#94a3b8', marginTop: 12 }}>El carrito está vacío</Text>
                            </View>
                        ) : (
                            cart.map(item => (
                                <View key={item.producto_id} style={styles.cartRow}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.cartItemName}>{item.nombre}</Text>
                                        <Text style={{ fontSize: 13, color: theme.colors.primary, fontWeight: '700' }}>
                                            ${Number(item.precio).toFixed(2)} c/u
                                        </Text>
                                    </View>
                                    <View style={styles.qtyContainer}>
                                        <TouchableOpacity onPress={() => updateQuantity(item.producto_id, -1)} style={styles.miniBtn}>
                                            <Minus size={16} color="#475569" />
                                        </TouchableOpacity>
                                        <Text style={styles.qtyText}>{item.cartQuantity}</Text>
                                        <TouchableOpacity onPress={() => updateQuantity(item.producto_id, 1)} style={styles.miniBtn}>
                                            <Plus size={16} color="#475569" />
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableOpacity onPress={() => removeFromCart(item.producto_id)} style={{ padding: 8 }}>
                                        <Trash2 size={18} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                    </ScrollView>

                    <Surface style={styles.cartFooter} elevation={4}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                            <Text style={styles.totalLabel}>Total a Pagar</Text>
                            <Text style={styles.totalAmount}>${cartTotal.toFixed(2)}</Text>
                        </View>
                        <Button
                            mode="contained"
                            style={styles.checkoutBtn}
                            contentStyle={{ height: 50 }}
                            onPress={() => {
                                setShowCart(false);
                                setShowCheckout(true);
                            }}
                            disabled={cart.length === 0}
                        >
                            Proceder al Cobro
                        </Button>
                    </Surface>
                </SafeAreaView>
            </Modal>

            {/* Checkout Modal */}
            <Modal visible={showCheckout} animationType="slide" onRequestClose={() => setShowCheckout(false)}>
                <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Finalizar Venta</Text>
                        <IconButton icon="close" onPress={() => setShowCheckout(false)} />
                    </View>

                    <ScrollView contentContainerStyle={{ padding: 20 }}>
                        {/* Client Selection */}
                        <Surface style={styles.sectionCard} elevation={0}>
                            <Text style={styles.sectionTitle}>Cliente</Text>
                            <TouchableOpacity onPress={() => setShowClientModal(true)} style={styles.clientSelector}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <View style={styles.iconCircle}>
                                        <User size={20} color="white" />
                                    </View>
                                    <View>
                                        <Text style={styles.clientName}>{selectedClient?.nombre || 'Consumidor Final'}</Text>
                                        <Text style={styles.clientSub}>{selectedClient?.nit_ci ? `NIT/CI: ${selectedClient.nit_ci}` : 'Sin datos fiscales'}</Text>
                                    </View>
                                </View>
                                <Button mode="text">Cambiar</Button>
                            </TouchableOpacity>
                        </Surface>

                        {/* Payment Method */}
                        <Surface style={styles.sectionCard} elevation={0}>
                            <Text style={styles.sectionTitle}>Método de Pago</Text>
                            <View style={styles.paymentMethods}>
                                {[
                                    { id: 'EFECTIVO', icon: Banknote, label: 'Efectivo' },
                                    { id: 'QR', icon: Grid, label: 'QR Simple' },
                                    { id: 'TRANSFERENCIA', icon: CreditCard, label: 'Transfer.' },
                                ].map((method) => (
                                    <TouchableOpacity
                                        key={method.id}
                                        style={[styles.payMethodCard, paymentMethod === method.id && styles.payMethodActive]}
                                        onPress={() => setPaymentMethod(method.id as any)}
                                    >
                                        <method.icon size={24} color={paymentMethod === method.id ? theme.colors.primary : '#94a3b8'} />
                                        <Text style={[styles.payMethodText, paymentMethod === method.id && { color: theme.colors.primary, fontWeight: '700' }]}>
                                            {method.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </Surface>

                        {/* Totals */}
                         <Surface style={styles.sectionCard} elevation={0}>
                            <View style={styles.row}>
                                <Text style={styles.rowLabel}>Subtotal</Text>
                                <Text style={styles.rowValue}>${cartTotal.toFixed(2)}</Text>
                            </View>
                            <Divider style={{ marginVertical: 12 }} />
                            <View style={styles.row}>
                                <Text style={[styles.rowLabel, { fontSize: 18, color: '#0f172a' }]}>Total</Text>
                                <Text style={[styles.rowValue, { fontSize: 24, color: theme.colors.primary }]}>${cartTotal.toFixed(2)}</Text>
                            </View>
                        </Surface>

                        {/* Submit */}
                        <Button
                            mode="contained"
                            style={styles.confirmBtn}
                            contentStyle={{ height: 56 }}
                            onPress={handleCheckout}
                            loading={loading}
                        >
                            Confirmar Cobro
                        </Button>
                    </ScrollView>
                </SafeAreaView>
            </Modal>

            {/* Clients Modal */}
            <Modal visible={showClientModal} animationType="slide">
                 <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Seleccionar Cliente</Text>
                        <IconButton icon="close" onPress={() => setShowClientModal(false)} />
                    </View>
                    <TouchableOpacity
                        style={styles.clientItem}
                        onPress={() => { setSelectedClient(null); setShowClientModal(false); }}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: '#94a3b8' }]}>
                            <User size={20} color="white" />
                        </View>
                        <Text style={styles.clientItemName}>Consumidor Final</Text>
                    </TouchableOpacity>
                    <FlatList
                        data={clients}
                        keyExtractor={c => c.cliente_id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.clientItem}
                                onPress={() => { setSelectedClient(item); setShowClientModal(false); }}
                            >
                                <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary }]}>
                                    <Text style={{ color: 'white', fontWeight: 'bold' }}>{item.nombre.charAt(0)}</Text>
                                </View>
                                <View>
                                    <Text style={styles.clientItemName}>{item.nombre}</Text>
                                    <Text style={{ fontSize: 12, color: '#64748b' }}>NIT: {item.nit_ci || 'S/N'}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                </SafeAreaView>
            </Modal>

            {/* Success Modal */}
            <Modal visible={!!successData} transparent animationType="fade">
                <View style={styles.successOverlay}>
                    <Surface style={styles.successCard} elevation={4}>
                        <View style={styles.successIcon}>
                            <Check size={40} color="white" />
                        </View>
                        <Text style={styles.successTitle}>¡Venta Exitosa!</Text>
                        <Text style={styles.successSub}>
                            La venta #{successData?.venta_id} ha sido registrada correctamente.
                        </Text>

                        <Button
                            mode="outlined"
                            style={{ marginVertical: 8, borderColor: '#e2e8f0' }}
                            icon={() => <Printer size={18} color="#64748b"/>}
                        >
                            Imprimir Recibo
                        </Button>

                        <Button
                            mode="contained"
                            style={{ marginTop: 12, borderRadius: 12 }}
                            onPress={handleNewSale}
                        >
                            Nueva Venta
                        </Button>
                    </Surface>
                </View>
            </Modal>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { position: 'relative', zIndex: 1 },
    cartIconContainer: { position: 'absolute', right: 20, top: 20, zIndex: 10 },
    cartBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' },
    badge: { position: 'absolute', top: -4, right: -4 },
    searchContainer: { paddingHorizontal: 20, marginBottom: 10 },
    searchBar: { borderRadius: 12, backgroundColor: 'white', height: 46 },
    gridContent: { padding: 12 },
    gridItem: { flex: 1, padding: 6, maxWidth: '50%' },
    productCard: { backgroundColor: 'white', borderRadius: 16, overflow: 'hidden' },
    imageContainer: { height: 120, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
    productImage: { width: '100%', height: '100%' },
    placeholderImage: { opacity: 0.5 },
    outOfStockBadge: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    outOfStockText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
    productInfo: { padding: 12 },
    productName: { fontSize: 13, fontWeight: '600', color: '#1e293b', lineHeight: 18, height: 36 },
    productPrice: { fontSize: 15, fontWeight: 'bold', color: '#0f172a' },
    stockText: { fontSize: 10, color: '#64748b' },

    // Cart Modal
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
    cartList: { padding: 20 },
    emptyState: { alignItems: 'center', marginTop: 100 },
    cartRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    cartItemName: { fontSize: 14, fontWeight: '600', color: '#334155' },
    qtyContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 8, padding: 4, marginHorizontal: 12 },
    miniBtn: { width: 28, height: 28, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', borderRadius: 6, borderWidth: 1, borderColor: '#e2e8f0' },
    qtyText: { marginHorizontal: 12, fontWeight: 'bold', minWidth: 20, textAlign: 'center' },
    cartFooter: { padding: 20, backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
    totalLabel: { fontSize: 16, color: '#64748b' },
    totalAmount: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
    checkoutBtn: { borderRadius: 12 },

    // Checkout
    sectionCard: { backgroundColor: 'white', padding: 20, borderRadius: 20, marginBottom: 16 },
    sectionTitle: { fontSize: 14, fontWeight: '700', color: '#64748b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
    clientSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
    iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center' },
    clientName: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
    clientSub: { fontSize: 12, color: '#64748b' },
    paymentMethods: { flexDirection: 'row', gap: 10 },
    payMethodCard: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#f8fafc', gap: 8 },
    payMethodActive: { borderColor: '#6366f1', backgroundColor: '#eff6ff' },
    payMethodText: { fontSize: 11, fontWeight: '600', color: '#64748b' },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    rowLabel: { fontSize: 15, color: '#64748b' },
    rowValue: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
    confirmBtn: { borderRadius: 16, backgroundColor: '#0f172a', marginVertical: 20 },

    // Clients Modal
    clientItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', gap: 16 },
    clientItemName: { fontSize: 16, fontWeight: '600', color: '#1e293b' },

    // Success Modal
    successOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
    successCard: { backgroundColor: 'white', borderRadius: 32, padding: 32, alignItems: 'center' },
    successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    successTitle: { fontSize: 24, fontWeight: '900', color: '#0f172a', marginBottom: 8 },
    successSub: { textAlign: 'center', color: '#64748b', marginBottom: 24, fontSize: 15 },
});
