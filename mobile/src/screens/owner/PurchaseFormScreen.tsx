import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, TouchableOpacity, Image, FlatList } from 'react-native';
import { Text, TextInput, Button, useTheme, Surface, IconButton, ActivityIndicator, Divider, Portal, Modal, Searchbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { purchasesService } from '../..//api/purchasesService';
import { suppliersService, Proveedor } from '../..//api/suppliersService';
import { productsService, Product } from '../..//api/productsService';
import { ShoppingCart, Save, X, Building2, Package, Plus, Minus, Camera, DollarSign, ChevronDown, Check, Search } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

export const PurchaseFormScreen = () => {
  const navigation = useNavigation<any>();
  const theme = useTheme();

  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Proveedor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [file, setFile] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [supps, prods] = await Promise.all([
        suppliersService.getAll(),
        productsService.getAll()
      ]);
      setSuppliers(supps);
      setProducts(prods);
    } catch (error) {
      console.error('Error loading data for purchase', error);
    }
  };

  const addToCart = (product: Product) => {
    const existing = cartItems.find(item => item.producto_id === product.producto_id);
    if (existing) {
      setCartItems(cartItems.map(item =>
        item.producto_id === product.producto_id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, {
        producto_id: product.producto_id,
        nombre: product.nombre,
        cantidad: 1,
        precio_compra: product.precio * 0.7 // Default estimate
      }]);
    }
    setShowProductModal(false);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCartItems(cartItems.map(item => {
      if (item.producto_id === id) {
        const newQty = Math.max(0, item.cantidad + delta);
        return { ...item, cantidad: newQty };
      }
      return item;
    }).filter(item => item.cantidad > 0));
  };

  const updatePrice = (id: number, price: string) => {
    setCartItems(cartItems.map(item =>
      item.producto_id === id ? { ...item, precio_compra: parseFloat(price) || 0 } : item
    ));
  };

  const pickFile = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled) setFile(result.assets[0]);
  };

  const total = cartItems.reduce((acc, item) => acc + (item.cantidad * item.precio_compra), 0);

  const handleSave = async () => {
    if (!selectedSupplierId) {
      Alert.alert('Error', 'Selecciona un proveedor.');
      return;
    }
    if (cartItems.length === 0) {
      Alert.alert('Error', 'Añade al menos un producto.');
      return;
    }

    setLoading(true);
    try {
      if (file) {
        const formData = new FormData();
        // Append file
        formData.append('comprobante', {
          uri: file.uri,
          type: 'image/jpeg', // Default or extract from file type
          name: file.fileName || 'comprobante.jpg',
        } as any);

        // Append other fields
        formData.append('proveedor_id', selectedSupplierId.toString());
        formData.append('metodo_pago', 'EFECTIVO');

        // Append products as stringified JSON because FormData values must be strings
        // NOTE: Backend must be prepared to parse 'productos' from string if it receives multipart/form-data
        formData.append('productos', JSON.stringify(cartItems.map(item => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          costo_unitario: item.precio_compra
        }))));

        await purchasesService.create(formData);
      } else {
        // Send as JSON
        const data = {
            proveedor_id: selectedSupplierId,
            metodo_pago: 'EFECTIVO' as const,
            productos: cartItems.map(item => ({
            producto_id: item.producto_id,
            cantidad: item.cantidad,
            costo_unitario: item.precio_compra
            }))
        };
        await purchasesService.create(data);
      }
      Alert.alert('Éxito', 'Compra registrada y stock actualizado.');
      navigation.goBack();
    } catch (error) {
      console.error('Error registering purchase', error);
      Alert.alert('Error', 'No se pudo registrar la compra.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Surface style={styles.header} elevation={0}>
        <IconButton icon={() => <X size={24} color="#64748b" />} onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Registrar Compra</Text>
        <IconButton
          icon={() => <Save size={24} color={theme.colors.primary} />}
          onPress={handleSave}
          disabled={loading || cartItems.length === 0}
        />
      </Surface>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Surface style={styles.section} elevation={0}>
            <Text style={styles.sectionTitle}>Proveedor</Text>
            <TouchableOpacity onPress={() => setShowSupplierModal(true)} style={{ marginTop: 12 }}>
                <Surface style={styles.selector} elevation={0}>
                    <View style={styles.selectorContent}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <Building2 size={18} color="#64748b" />
                            <Text style={[styles.selectorValue, !selectedSupplierId && { color: '#cbd5e1' }]}>
                                {suppliers.find(s => s.proveedor_id === selectedSupplierId)?.nombre || 'Seleccionar Proveedor...'}
                            </Text>
                        </View>
                        <ChevronDown size={18} color="#94a3b8" />
                    </View>
                </Surface>
            </TouchableOpacity>
        </Surface>

        <Surface style={styles.section} elevation={0}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.sectionTitle}>Productos</Text>
                <TouchableOpacity onPress={() => setShowProductModal(true)} style={styles.addInlineBtn}>
                    <Plus size={16} color={theme.colors.primary} />
                    <Text style={{ color: theme.colors.primary, fontWeight: '800', fontSize: 13, marginLeft: 4 }}>AÑADIR</Text>
                </TouchableOpacity>
            </View>

            {cartItems.length === 0 ? (
                <View style={styles.emptyCart}>
                    <Package size={32} color="#cbd5e1" />
                    <Text style={styles.emptyText}>No has añadido productos aún</Text>
                </View>
            ) : (
                <View style={{ marginTop: 16 }}>
                    {cartItems.map(item => (
                        <Surface key={item.producto_id} style={styles.cartItem} elevation={0}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.itemName}>{item.nombre}</Text>
                                <View style={styles.priceRow}>
                                    <Text style={styles.priceLabel}>Compru/u:</Text>
                                    <View style={styles.priceInputWrapper}>
                                        <Text style={{ fontSize: 12, color: '#64748b', marginRight: 2 }}>$</Text>
                                        <TextInput
                                            value={item.precio_compra.toString()}
                                            onChangeText={(val) => updatePrice(item.producto_id, val)}
                                            keyboardType="numeric"
                                            style={styles.priceInput}
                                            dense
                                            mode="flat"
                                            underlineColor="transparent"
                                            activeUnderlineColor="transparent"
                                        />
                                    </View>
                                </View>
                            </View>
                            <View style={styles.qtyControls}>
                                <TouchableOpacity onPress={() => updateQuantity(item.producto_id, -1)} style={styles.qtyBtn}>
                                    <Minus size={14} color="#64748b" />
                                </TouchableOpacity>
                                <Text style={styles.qtyText}>{item.cantidad}</Text>
                                <TouchableOpacity onPress={() => updateQuantity(item.producto_id, 1)} style={styles.qtyBtn}>
                                    <Plus size={14} color="#64748b" />
                                </TouchableOpacity>
                            </View>
                        </Surface>
                    ))}
                </View>
            )}
        </Surface>

        <TouchableOpacity style={styles.fileUpload} onPress={pickFile}>
            {file ? (
                <View style={{ width: '100%', height: '100%' }}>
                    <Image source={{ uri: file.uri }} style={styles.preview} />
                    <View style={styles.changeFileOverlay}>
                        <Camera size={20} color="white" />
                        <Text style={{ color: 'white', fontWeight: '800', marginLeft: 8 }}>CAMBIAR</Text>
                    </View>
                </View>
            ) : (
                <>
                    <View style={{ backgroundColor: '#f1f5f9', padding: 12, borderRadius: 50 }}>
                        <Camera size={28} color="#94a3b8" />
                    </View>
                    <Text style={styles.fileText}>Adjuntar Comprobante</Text>
                    <Text style={{ fontSize: 11, color: '#cbd5e1', marginTop: 2 }}>Recibo, Factura o Nota</Text>
                </>
            )}
        </TouchableOpacity>

        <View style={styles.footer}>
            <Surface style={styles.totalBox} elevation={0}>
                <View>
                    <Text style={styles.totalLabel}>Inversión Total</Text>
                    <Text style={styles.totalValue}>${total.toLocaleString()}</Text>
                </View>
                <ShoppingCart size={32} color="white" opacity={0.2} />
            </Surface>
            <Button
                mode="contained"
                onPress={handleSave}
                loading={loading}
                disabled={loading || cartItems.length === 0}
                style={[styles.btn, { backgroundColor: '#0f172a' }]}
                labelStyle={{ fontWeight: '900', fontSize: 16, letterSpacing: 0.5 }}
            >
                FINALIZAR REGISTRO
            </Button>
        </View>
      </ScrollView>

      {/* Supplier Modal */}
      <Portal>
        <Modal
            visible={showSupplierModal}
            onDismiss={() => setShowSupplierModal(false)}
            contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>Seleccionar Proveedor</Text>
          <ScrollView style={{ maxHeight: 350, marginTop: 16 }}>
            {suppliers.map(s => (
              <TouchableOpacity
                key={s.proveedor_id}
                onPress={() => {
                    setSelectedSupplierId(s.proveedor_id);
                    setShowSupplierModal(false);
                }}
                style={styles.modalItem}
              >
                <View style={{ flex: 1 }}>
                    <Text style={[
                        styles.modalItemText,
                        selectedSupplierId === s.proveedor_id && { color: theme.colors.primary, fontWeight: '800' }
                    ]}>
                        {s.nombre}
                    </Text>
                </View>
                {selectedSupplierId === s.proveedor_id && <Check size={18} color={theme.colors.primary} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Button mode="outlined" onPress={() => setShowSupplierModal(false)} style={{ marginTop: 20, borderRadius: 12 }}>
            CERRAR
          </Button>
        </Modal>

        {/* Product Modal */}
        <Modal
            visible={showProductModal}
            onDismiss={() => setShowProductModal(false)}
            contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>Añadir al Carrito</Text>
          <Searchbar
            placeholder="Buscar producto..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.modalSearch}
            inputStyle={{ fontSize: 14 }}
            elevation={0}
          />
          <ScrollView style={{ maxHeight: 350, marginTop: 10 }}>
            {filteredProducts.map(p => (
              <TouchableOpacity
                key={p.producto_id}
                onPress={() => addToCart(p)}
                style={styles.modalItem}
              >
                <View style={{ flex: 1 }}>
                    <Text style={styles.modalItemText}>{p.nombre}</Text>
                    <Text style={{ fontSize: 12, color: '#94a3b8' }}>Stock actual: {p.stock_actual}</Text>
                </View>
                <Plus size={18} color={theme.colors.primary} />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Button mode="outlined" onPress={() => setShowProductModal(false)} style={{ marginTop: 20, borderRadius: 12 }}>
            CANCELAR
          </Button>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  scrollContent: { padding: 20 },
  section: {
    padding: 24,
    borderRadius: 28,
    backgroundColor: 'white',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  sectionTitle: { fontSize: 11, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 },
  selector: { height: 52, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#f8fafc', paddingHorizontal: 16, justifyContent: 'center' },
  selectorContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectorValue: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
  addInlineBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  emptyCart: { alignItems: 'center', paddingVertical: 30, gap: 12 },
  emptyText: { color: '#94a3b8', fontSize: 14, fontWeight: '600' },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  itemName: { fontWeight: '800', fontSize: 15, color: '#1e293b' },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  priceLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
  priceInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 8, borderRadius: 8, marginLeft: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  priceInput: { height: 32, fontSize: 13, backgroundColor: 'white', width: 60, fontWeight: '700' },
  qtyControls: { flexDirection: 'row', alignItems: 'center', marginLeft: 12, backgroundColor: 'white', borderRadius: 12, padding: 4, borderWidth: 1, borderColor: '#e2e8f0' },
  qtyBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
  qtyText: { marginHorizontal: 12, fontWeight: '900', fontSize: 15, color: '#1e293b' },
  fileUpload: {
    height: 160,
    borderRadius: 28,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    overflow: 'hidden',
    backgroundColor: 'white'
  },
  fileText: { fontSize: 14, color: '#64748b', marginTop: 10, fontWeight: '700' },
  preview: { width: '100%', height: '100%' },
  changeFileOverlay: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(15, 23, 42, 0.8)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, flexDirection: 'row', alignItems: 'center' },
  footer: { marginTop: 40, paddingBottom: 60 },
  totalBox: { backgroundColor: '#0f172a', padding: 24, borderRadius: 28, marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 13, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 },
  totalValue: { fontSize: 32, fontWeight: '900', color: 'white', marginTop: 2 },
  btn: { borderRadius: 16, height: 60, justifyContent: 'center' },
  modalContent: { backgroundColor: 'white', padding: 28, margin: 20, borderRadius: 32 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  modalSearch: { marginTop: 16, height: 44, borderRadius: 12, backgroundColor: '#f1f5f9' },
  modalItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  modalItemText: { fontSize: 15, fontWeight: '600', color: '#334155' },
});
