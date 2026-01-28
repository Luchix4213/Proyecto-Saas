import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, useTheme, Surface, ActivityIndicator, IconButton, Portal, Modal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { productsService, Product } from '../../../api/productsService';
import { categoriesService, Category } from '../../../api/categoriesService';
import { Package, Camera, Save, X, Tag, DollarSign, Layers, ChevronDown } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

export const ProductFormScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const theme = useTheme();
  const editingProduct = route.params?.product as Product | undefined;

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    nombre: editingProduct?.nombre || '',
    descripcion: editingProduct?.descripcion || '',
    precio: editingProduct?.precio || 0,
    stock: editingProduct?.stock || 0,
    stock_minimo: editingProduct?.stock_minimo || 5,
    categoria_id: editingProduct?.categoria_id,
  });
  const [images, setImages] = useState<any[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoriesService.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories', error);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0]]);
    }
  };

  const handleSave = async () => {
    if (!formData.nombre || !formData.precio) {
      Alert.alert('Error', 'Por favor completa el nombre y el precio.');
      return;
    }

    if (!formData.categoria_id) {
        Alert.alert('Error', 'Por favor selecciona una categoría.');
        return;
    }

    setLoading(true);
    try {
      // Construct payload to match CreateProductoDto exactly
      const payload: any = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: formData.precio,
        categoria_id: formData.categoria_id,
        stock_minimo: formData.stock_minimo,
        stock_actual: formData.stock, // Map frontend stock to backend stock_actual
      };

      // Remove undefined/null values if necessary, though optional fields are fine if undefined
      if (formData.imagen_url) payload.imagen_url = formData.imagen_url;

      console.log('Sending payload:', payload);

      let product;
      if (editingProduct) {
        product = await productsService.update(editingProduct.producto_id, payload);
      } else {
        product = await productsService.create(payload);
      }

      if (images.length > 0) {
        await productsService.uploadImages(product.producto_id, images);
      }

      Alert.alert('Éxito', `Producto ${editingProduct ? 'actualizado' : 'creado'} correctamente.`);
      navigation.goBack();
    } catch (error: any) {
      console.error('Error saving product', error);
      if (error.response) {
        console.error('Error Response Data:', error.response.data);
        console.error('Error Response Status:', error.response.status);
      }
      Alert.alert('Error', 'No se pudo guardar el producto. Verifica los datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Surface style={styles.header} elevation={0}>
        <IconButton icon={() => <X size={24} color="#64748b" />} onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</Text>
        <IconButton
          icon={() => <Save size={24} color={theme.colors.primary} />}
          onPress={handleSave}
          disabled={loading}
        />
      </Surface>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.imageSection}>
          <Text style={styles.sectionTitle}>Galería de Imágenes</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageScroll}>
            <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
              <View style={{ backgroundColor: '#f1f5f9', padding: 12, borderRadius: 50 }}>
                <Camera size={24} color="#94a3b8" />
              </View>
              <Text style={styles.addImageText}>Añadir</Text>
            </TouchableOpacity>

            {images.map((img, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: img.uri }} style={styles.image} />
                <TouchableOpacity style={styles.removeImageBtn} onPress={() => setImages(images.filter((_, i) => i !== index))}>
                  <X size={12} color="white" />
                </TouchableOpacity>
              </View>
            ))}

            {editingProduct?.imagen_url && images.length === 0 && (
                 <View style={styles.imageWrapper}>
                    <Image source={{ uri: editingProduct.imagen_url }} style={styles.image} />
                 </View>
            )}
          </ScrollView>
        </View>

        <Surface style={styles.formSection} elevation={0}>
          <Text style={styles.sectionTitle}>Información Básica</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>NOMBRE DEL PRODUCTO *</Text>
            <TextInput
                mode="outlined"
                placeholder="Ej. Martillo de Carpintero"
                value={formData.nombre}
                onChangeText={text => setFormData({...formData, nombre: text})}
                style={styles.input}
                outlineStyle={styles.inputOutline}
                left={<TextInput.Icon icon={() => <Package size={18} color="#64748b" />} />}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>PRECIO DE VENTA *</Text>
                <TextInput
                    mode="outlined"
                    placeholder="0.00"
                    value={formData.precio?.toString()}
                    onChangeText={text => setFormData({...formData, precio: parseFloat(text) || 0})}
                    style={styles.input}
                    outlineStyle={styles.inputOutline}
                    keyboardType="numeric"
                    left={<TextInput.Icon icon={() => <DollarSign size={18} color="#64748b" />} />}
                />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>CATEGORÍA</Text>
            <TouchableOpacity onPress={() => setShowCategoryModal(true)}>
                <Surface style={styles.selector} elevation={0}>
                <View style={styles.selectorContent}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <Layers size={18} color="#64748b" />
                        <Text style={[styles.selectorValue, !formData.categoria_id && { color: '#cbd5e1' }]}>
                        {categories.find(c => c.categoria_id === formData.categoria_id)?.nombre || 'Seleccionar categoría...'}
                        </Text>
                    </View>
                    <ChevronDown size={18} color="#94a3b8" />
                </View>
                </Surface>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Control de Inventario</Text>
          <View style={styles.row}>
             <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>STOCK INICIAL</Text>
                <TextInput
                    mode="outlined"
                    placeholder="0"
                    value={formData.stock?.toString()}
                    onChangeText={text => setFormData({...formData, stock: parseInt(text) || 0})}
                    style={styles.input}
                    outlineStyle={styles.inputOutline}
                    keyboardType="numeric"
                />
             </View>
             <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>ALERTA MÍNIMA</Text>
                <TextInput
                    mode="outlined"
                    placeholder="5"
                    value={formData.stock_minimo?.toString()}
                    onChangeText={text => setFormData({...formData, stock_minimo: parseInt(text) || 0})}
                    style={styles.input}
                    outlineStyle={styles.inputOutline}
                    keyboardType="numeric"
                />
             </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>DESCRIPCIÓN</Text>
            <TextInput
                mode="outlined"
                placeholder="Hable brevemente del producto..."
                value={formData.descripcion}
                onChangeText={text => setFormData({...formData, descripcion: text})}
                multiline
                numberOfLines={4}
                style={styles.textArea}
                outlineStyle={styles.inputOutline}
            />
          </View>
        </Surface>

        <Button
          mode="contained"
          onPress={handleSave}
          loading={loading}
          disabled={loading}
          style={[styles.submitBtn, { backgroundColor: '#0f172a' }]}
          labelStyle={{ fontWeight: '800', fontSize: 16 }}
        >
          {editingProduct ? 'GUARDAR CAMBIOS' : 'CREAR PRODUCTO'}
        </Button>
      </ScrollView>

      <Portal>
        <Modal
            visible={showCategoryModal}
            onDismiss={() => setShowCategoryModal(false)}
            contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>Seleccionar Categoría</Text>
          <ScrollView style={{ maxHeight: 350, marginTop: 16 }}>
            {categories.map(category => (
              <TouchableOpacity
                key={category.categoria_id}
                onPress={() => {
                    setFormData({...formData, categoria_id: category.categoria_id});
                    setShowCategoryModal(false);
                }}
                style={styles.modalItem}
              >
                <View style={{ flex: 1 }}>
                    <Text style={[
                        styles.modalItemText,
                        formData.categoria_id === category.categoria_id && { color: theme.colors.primary, fontWeight: '800' }
                    ]}>
                        {category.nombre}
                    </Text>
                </View>
                {formData.categoria_id === category.categoria_id && <Tag size={18} color={theme.colors.primary} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Button mode="outlined" onPress={() => setShowCategoryModal(false)} style={{ marginTop: 20, borderRadius: 12 }}>
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
  imageSection: { marginBottom: 32 },
  sectionTitle: { fontSize: 11, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16, marginLeft: 4 },
  imageScroll: { gap: 14, paddingLeft: 4 },
  addImageBtn: {
    width: 100,
    height: 100,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white'
  },
  addImageText: { fontSize: 12, color: '#94a3b8', marginTop: 8, fontWeight: '700' },
  imageWrapper: { width: 100, height: 100, borderRadius: 24, overflow: 'hidden', position: 'relative', borderWidth: 1, borderColor: '#f1f5f9' },
  image: { width: '100%', height: '100%' },
  removeImageBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    padding: 4
  },
  formSection: {
    backgroundColor: 'white',
    borderRadius: 28,
    padding: 24,
    gap: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  inputGroup: { gap: 8 },
  inputLabel: { fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 1 },
  input: { backgroundColor: 'white', fontSize: 15 },
  inputOutline: { borderRadius: 16, borderColor: '#e2e8f0' },
  textArea: { backgroundColor: 'white', minHeight: 100 },
  row: { flexDirection: 'row', gap: 12 },
  selector: { height: 52, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: 'white', paddingHorizontal: 16, justifyContent: 'center' },
  selectorContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectorValue: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
  submitBtn: { borderRadius: 16, height: 56, justifyContent: 'center', marginBottom: 40 },
  modalContent: { backgroundColor: 'white', padding: 28, margin: 20, borderRadius: 32 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  modalItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  modalItemText: { fontSize: 16, fontWeight: '600', color: '#334155' },
});
