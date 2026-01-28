import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, useTheme, Surface, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { categoriesService, Category } from '../../../api/categoriesService';
import { Layers, Save, X, FileText } from 'lucide-react-native';

export const CategoryFormScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const theme = useTheme();
  const editingCategory = route.params?.category as Category | undefined;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Category>>({
    nombre: editingCategory?.nombre || '',
    descripcion: editingCategory?.descripcion || '',
  });

  const handleSave = async () => {
    if (!formData.nombre) {
      Alert.alert('Error', 'El nombre es obligatorio.');
      return;
    }

    setLoading(true);
    try {
      if (editingCategory) {
        await categoriesService.update(editingCategory.categoria_id, formData);
      } else {
        await categoriesService.create(formData);
      }
      Alert.alert('Éxito', `Categoría ${editingCategory ? 'actualizada' : 'creada'} correctamente.`);
      navigation.goBack();
    } catch (error) {
      console.error('Error saving category', error);
      Alert.alert('Error', 'No se pudo guardar la categoría.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Surface style={styles.header} elevation={0}>
        <IconButton icon={() => <X size={24} color="#64748b" />} onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</Text>
        <IconButton
          icon={() => <Save size={24} color={theme.colors.primary} />}
          onPress={handleSave}
          disabled={loading}
        />
      </Surface>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.section} elevation={0}>
          <Text style={styles.sectionTitle}>Detalles de Categoría</Text>
          <TextInput
            label="Nombre de Categoría *"
            value={formData.nombre}
            onChangeText={text => setFormData({...formData, nombre: text})}
            mode="outlined"
            style={styles.input}
            outlineStyle={{ borderRadius: 12, borderColor: '#e2e8f0' }}
            left={<TextInput.Icon icon={() => <Layers size={20} color="#64748b" />} />}
          />

          <TextInput
            label="Descripción opcional"
            value={formData.descripcion}
            onChangeText={text => setFormData({...formData, descripcion: text})}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.textArea}
            outlineStyle={{ borderRadius: 12, borderColor: '#e2e8f0' }}
            left={<TextInput.Icon icon={() => <FileText size={20} color="#64748b" />} />}
          />
        </Surface>

        <Button
          mode="contained"
          onPress={handleSave}
          loading={loading}
          disabled={loading}
          style={[styles.submitBtn, { backgroundColor: theme.colors.primary }]}
          labelStyle={{ fontWeight: '800', fontSize: 16 }}
        >
          {editingCategory ? 'GUARDAR CAMBIOS' : 'REGISTRAR CATEGORÍA'}
        </Button>
      </ScrollView>
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
  scrollContent: { padding: 24 },
  section: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    gap: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  sectionTitle: { fontSize: 11, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  input: { backgroundColor: 'transparent' },
  textArea: { backgroundColor: 'transparent', minHeight: 120 },
  submitBtn: { borderRadius: 16, height: 54, justifyContent: 'center', marginBottom: 40 },
});
