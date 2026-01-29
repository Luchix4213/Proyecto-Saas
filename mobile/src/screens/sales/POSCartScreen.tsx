import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, Alert, TextInput as NativeTextInput } from 'react-native';
import { Text, Surface, Button, IconButton, useTheme, Divider, Searchbar, Modal, Portal, RadioButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AestheticHeader } from '../..//components/v2/AestheticHeader';
import { useCartStore } from '../..//store/cartStore';
import { clientsService, Cliente } from '../..//api/clientsService';
import { Trash2, Plus, Minus, User, ChevronRight, X, Search } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export const POSCartScreen = () => {
    const navigation = useNavigation<any>();
    const theme = useTheme();
    const { items, removeItem, updateQuantity, clearCart, total } = useCartStore();

    // Client selection state
    const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
    const [clientModalVisible, setClientModalVisible] = useState(false);

    // Client Search
    const [clients, setClients] = useState<Cliente[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingClients, setLoadingClients] = useState(false);

    useEffect(() => {
        if (clientModalVisible) {
            fetchClients();
        }
    }, [clientModalVisible]);

    const fetchClients = async () => {
        setLoadingClients(true);
        try {
            const data = await clientsService.getAll();
            setClients(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingClients(false);
        }
    };

    const filteredClients = clients.filter(c =>
        (c.nombre + ' ' + (c.paterno || '')).toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.nit_ci?.includes(searchQuery)
    );

    const handleCheckout = () => {
        if (items.length === 0) return;
        navigation.navigate('POSCheckout', {
            client: selectedClient
        });
    };

    const renderItem = ({ item }: { item: any }) => (
        <Surface style={styles.itemCard} elevation={0}>
            <View style={styles.imageBox}>
                 {/* Placeholder if no image */}
                 <Text style={{ fontSize: 20 }}>📦</Text>
            </View>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>{item.nombre}</Text>
                <Text style={styles.itemPrice}>Bs {item.precio}</Text>
            </View>

            <View style={styles.qtyControls}>
                <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => {
                        if (item.cantidad > 1) updateQuantity(item.producto_id, item.cantidad - 1);
                        else removeItem(item.producto_id);
                    }}
                >
                    <Minus size={16} color="#64748b" />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.cantidad}</Text>
                <TouchableOpacity
                    style={[
                        styles.qtyBtn,
                        { backgroundColor: item.cantidad < item.stock_actual ? theme.colors.primary : '#cbd5e1' }
                    ]}
                    onPress={() => {
                        if (item.cantidad < item.stock_actual) {
                            updateQuantity(item.producto_id, 1);
                        } else {
                            Alert.alert('Stock insuficiente', `Solo quedan ${item.stock_actual} unidades de este producto.`);
                        }
                    }}
                    disabled={item.cantidad >= item.stock_actual}
                >
                    <Plus size={16} color="white" />
                </TouchableOpacity>
            </View>
        </Surface>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <AestheticHeader title="Carrito" subtitle={`${items.length} items`} showBack />

            <View style={styles.clientSection}>
                <TouchableOpacity
                    style={styles.clientSelector}
                    onPress={() => setClientModalVisible(true)}
                >
                    <View style={styles.clientIcon}>
                        <User size={20} color="white" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.clientLabel}>Cliente</Text>
                        <Text style={styles.clientName}>
                            {selectedClient ? `${selectedClient.nombre} ${selectedClient.paterno || ''}` : 'Consumidor Final'}
                        </Text>
                    </View>
                    <ChevronRight size={20} color="#cbd5e1" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={items}
                keyExtractor={item => item.producto_id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>El carrito está vacío</Text>
                        <Button mode="text" onPress={() => navigation.goBack()}>Volver al catálogo</Button>
                    </View>
                }
            />

            <Surface style={styles.footer} elevation={4}>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total a cobrar:</Text>
                    <Text style={styles.totalValue}>Bs {Number(total || 0).toFixed(2)}</Text>
                </View>

                <Button
                    mode="contained"
                    style={styles.checkoutBtn}
                    contentStyle={{ height: 56 }}
                    labelStyle={{ fontSize: 18, fontWeight: '800' }}
                    onPress={handleCheckout}
                    disabled={items.length === 0}
                >
                    CONTINUAR
                </Button>
            </Surface>

            {/* Client Selection Modal */}
            <Portal>
                <Modal visible={clientModalVisible} onDismiss={() => setClientModalVisible(false)} contentContainerStyle={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Seleccionar Cliente</Text>
                        <IconButton icon="close" onPress={() => setClientModalVisible(false)} />
                    </View>

                    <Searchbar
                        placeholder="Buscar por nombre o NIT"
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                        style={styles.modalSearch}
                        elevation={0}
                    />

                    <TouchableOpacity
                        style={styles.defaultClient}
                        onPress={() => {
                            setSelectedClient(null);
                            setClientModalVisible(false);
                        }}
                    >
                        <View style={[styles.radioCircle, !selectedClient && styles.radioActive]} />
                        <Text style={{ fontWeight: '700', color: '#1e293b' }}>Consumidor Final</Text>
                    </TouchableOpacity>

                    <FlatList
                        data={filteredClients}
                        keyExtractor={item => item.cliente_id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.clientItem}
                                onPress={() => {
                                    setSelectedClient(item);
                                    setClientModalVisible(false);
                                }}
                            >
                                <View style={[styles.radioCircle, selectedClient?.cliente_id === item.cliente_id && styles.radioActive]} />
                                <View>
                                    <Text style={styles.clientItemName}>{item.nombre} {item.paterno}</Text>
                                    {item.nit_ci ? <Text style={styles.clientItemNit}>{item.nit_ci}</Text> : null}
                                </View>
                            </TouchableOpacity>
                        )}
                        style={{ maxHeight: 300 }}
                    />

                    <Button
                        mode="contained-tonal"
                        icon="plus"
                        onPress={() => {
                            setClientModalVisible(false);
                            // navigation.navigate('ClientForm'); // Loop back issue if stack not configured
                            Alert.alert('Info', 'Ve a la sección de Clientes para registrar uno nuevo.');
                        }}
                        style={{ marginTop: 12 }}
                    >
                        Nuevo Cliente
                    </Button>
                </Modal>
            </Portal>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    clientSection: { padding: 20, paddingBottom: 0 },
    clientSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    clientIcon: { backgroundColor: '#3b82f6', padding: 10, borderRadius: 12 },
    clientLabel: { fontSize: 11, color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' },
    clientName: { fontSize: 16, fontWeight: '700', color: '#1e293b' },

    list: { padding: 20 },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 16,
        marginBottom: 12
    },
    imageBox: { width: 48, height: 48, backgroundColor: '#f1f5f9', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    itemInfo: { flex: 1, marginLeft: 12 },
    itemName: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
    itemPrice: { fontSize: 13, color: '#64748b' },
    qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#f8fafc', padding: 6, borderRadius: 12 },
    qtyBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', elevation: 1 },
    qtyText: { fontSize: 14, fontWeight: '700', minWidth: 16, textAlign:     'center' },

    empty: { alignItems: 'center', marginTop: 100 },
    emptyText: { fontSize: 18, color: '#94a3b8', marginBottom: 20 },

    footer: {
        padding: 24,
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 40
    },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    totalLabel: { fontSize: 16, color: '#64748b' },
    totalValue: { fontSize: 32, fontWeight: '900', color: '#1e293b' },
    checkoutBtn: { borderRadius: 16 },

    // Modal
    modalContent: { backgroundColor: 'white', margin: 20, borderRadius: 24, padding: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    modalTitle: { fontSize: 18, fontWeight: '800' },
    modalSearch: { backgroundColor: '#f8fafc', marginBottom: 12, height: 46 },
    defaultClient: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#cbd5e1' },
    radioActive: { borderColor: '#3b82f6', backgroundColor: '#3b82f6' },
    clientItem: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
    clientItemName: { fontWeight: '600', color: '#334155' },
    clientItemNit: { fontSize: 12, color: '#94a3b8' }
});
