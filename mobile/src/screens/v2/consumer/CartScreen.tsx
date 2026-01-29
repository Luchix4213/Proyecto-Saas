import { View, FlatList, StyleSheet, Image, Alert, TouchableOpacity } from 'react-native';
import { Text, Surface, Button, IconButton, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AestheticHeader } from '../../../components/v2/AestheticHeader';
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag, XCircle } from 'lucide-react-native';
import { useCartStore } from '../../../store/cartStore';

export const CartScreen = () => {
    const navigation = useNavigation<any>();
    const { items, total, updateQuantity, removeItem, clearCart, currentTenantSlug } = useCartStore();

    const handleClearCart = () => {
        Alert.alert(
            'Vaciar Carrito',
            '¿Estás seguro de que quieres eliminar todos los productos?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Vaciar', style: 'destructive', onPress: clearCart }
            ]
        );
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.cartItem}>
            <Image source={{ uri: item.imagen_url || 'https://via.placeholder.com/150' }} style={styles.itemImage} />
            <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={1}>{item.nombre}</Text>
                <Text style={styles.itemPrice}>Bs {item.precio?.toFixed(2)}</Text>

                <View style={styles.actionRow}>
                    <View style={styles.qtyControl}>
                         <IconButton
                            icon={() => <Minus size={14} />}
                            size={14}
                            style={styles.qtyIcon}
                            onPress={() => updateQuantity(item.producto_id, -1)}
                        />
                         <Text style={styles.qtyText}>{item.cantidad}</Text>
                         <IconButton
                            icon={() => <Plus size={14} />}
                            size={14}
                            style={styles.qtyIcon}
                            onPress={() => updateQuantity(item.producto_id, 1)}
                        />
                    </View>
                    <IconButton
                        icon={() => <Trash2 size={18} color="#ef4444" />}
                        size={18}
                        onPress={() => removeItem(item.producto_id)}
                    />
                </View>
            </View>
        </View>
    );

    const handleCheckout = () => {
        if (items.length === 0) {
            Alert.alert('Carrito Vacío', 'Agrega productos antes de continuar.');
            return;
        }
        if (!currentTenantSlug) {
             Alert.alert('Error', 'No se ha identificado la tienda.');
             return;
        }
        navigation.navigate('Checkout', { tenantSlug: currentTenantSlug, total });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.headerRow}>
                <AestheticHeader title="Mi Carrito" subtitle={`${items.length} productos`} showBack />
                {items.length > 0 && (
                    <TouchableOpacity onPress={handleClearCart} style={styles.clearBtn}>
                        <XCircle size={20} color="#64748b" />
                        <Text style={styles.clearText}>Vaciar</Text>
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={item => item.producto_id.toString()}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <ShoppingBag size={80} color="#e2e8f0" />
                        <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
                        <Text style={styles.emptySubtitle}>¡Explora nuestros productos y llena tu carrito!</Text>
                        <Button
                            mode="contained"
                            style={{ marginTop: 24, borderRadius: 12 }}
                            onPress={() => navigation.navigate('StoreHome')}
                        >
                            Ver Tiendas
                        </Button>
                    </View>
                }
            />

            {items.length > 0 && (
                <Surface style={styles.footer} elevation={4}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>Bs {total.toFixed(2)}</Text>
                    </View>
                    <View style={[styles.summaryRow, { marginBottom: 16 }]}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>Bs {total.toFixed(2)}</Text>
                    </View>

                    <Button
                        mode="contained"
                        icon={() => <ArrowRight size={20} color="white" />}
                        contentStyle={{ flexDirection: 'row-reverse', height: 50 }}
                        style={styles.checkoutBtn}
                        labelStyle={{ fontSize: 16, fontWeight: '700' }}
                        onPress={handleCheckout}
                    >
                        Ir a Pagar
                    </Button>
                </Surface>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    list: { padding: 20 },

    cartItem: { flexDirection: 'row', backgroundColor: 'white', padding: 12, borderRadius: 16, marginBottom: 12, gap: 12 },
    itemImage: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#f1f5f9' },
    itemDetails: { flex: 1, justifyContent: 'space-between' },
    itemName: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
    itemPrice: { fontSize: 14, color: '#64748b' },

    actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    qtyControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 8 },
    qtyIcon: { margin: 0, width: 28, height: 28 },
    qtyText: { fontSize: 14, fontWeight: '700', marginHorizontal: 4 },

    footer: { backgroundColor: 'white', padding: 20, borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingBottom: 40, borderWidth: 1, borderColor: '#f1f5f9' },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    summaryLabel: { fontSize: 14, color: '#64748b' },
    summaryValue: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
    totalLabel: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
    totalValue: { fontSize: 24, fontWeight: '800', color: '#10b981' },
    checkoutBtn: { borderRadius: 12, height: 50, justifyContent: 'center' },

    headerRow: { position: 'relative' },
    clearBtn: { position: 'absolute', right: 20, top: 25, flexDirection: 'row', alignItems: 'center', gap: 4, zIndex: 1, backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    clearText: { fontSize: 12, fontWeight: '700', color: '#64748b' },

    emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b', marginTop: 24 },
    emptySubtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 8 }
});
