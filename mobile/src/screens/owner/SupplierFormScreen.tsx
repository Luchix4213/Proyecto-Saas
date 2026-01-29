import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, useTheme, Surface, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { suppliersService, Supplier } from '../..//api/suppliersService';
import { Building2, Save, X, Phone, Mail, MapPin, User, FileText } from 'lucide-react-native';

export const SupplierFormScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const theme = useTheme();
  const editingSupplier = route.params?.supplier as Supplier | undefined;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Supplier>>({
    nombre: editingSupplier?.nombre || '',
    nit_ci: editingSupplier?.nit_ci || '',
    telefono: editingSupplier?.telefono || '',
    email: editingSupplier?.email || '',
    direccion: editingSupplier?.direccion || '',
    contacto_nombre: editingSupplier?.contacto_nombre || '',
  });

  const handleSave = async () => {
    if (!formData.nombre) {
      Alert.alert('Error', 'El nombre es obligatorio.');
      return;
    }

    setLoading(true);
    try {
      // Sanitize payload to match CreateProveedorDto
      const payload: Partial<Supplier> = {
          nombre: formData.nombre,
          telefono: formData.telefono,
          email: formData.email,
          // Map other fields to datos_pago or ignore them if backend doesn't support
          datos_pago: `NIT: ${formData.nit_ci} - Dir: ${formData.direccion} - Contacto: ${formData.contacto_nombre}`
      };

      if (editingSupplier) {
        await suppliersService.update(editingSupplier.proveedor_id, payload);
      } else {
        await suppliersService.create(payload);
      }
      Alert.alert('Éxito', `Proveedor ${editingSupplier ? 'actualizado' : 'creado'} correctamente.`);
      navigation.goBack();
    } catch (error: any) {
      console.error('Error saving supplier', error);
      if (error.response) {
         console.error('Supplier Error Data:', error.response.data);
      }
      Alert.alert('Error', 'No se pudo guardar el proveedor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Surface style={styles.header} elevation={0}>
        <IconButton icon={() => <X size={24} color="#64748b" />} onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>{editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}</Text>
        <IconButton
          icon={() => <Save size={24} color={theme.colors.primary} />}
          onPress={handleSave}
          disabled={loading}
        />
      </Surface>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.section} elevation={0}>
          <TextInput
            label="Nombre / Razón Social *"
            value={formData.nombre}
            onChangeText={text => setFormData({...formData, nombre: text})}
            mode="outlined"
            style={styles.input}
            outlineStyle={{ borderRadius: 12, borderColor: '#e2e8f0' }}
            left={<TextInput.Icon icon={() => <Building2 size={20} color="#64748b" />} />}
          />

          <TextInput
            label="NIT / CI"
            value={formData.nit_ci}
            onChangeText={text => setFormData({...formData, nit_ci: text})}
            mode="outlined"
            style={styles.input}
            outlineStyle={{ borderRadius: 12, borderColor: '#e2e8f0' }}
            left={<TextInput.Icon icon={() => <FileText size={20} color="#64748b" />} />}
          />

          <View style={styles.row}>
            <TextInput
              label="Teléfono"
              value={formData.telefono}
              onChangeText={text => setFormData({...formData, telefono: text})}
              mode="outlined"
              style={[styles.input, { flex: 1 }]}
              outlineStyle={{ borderRadius: 12, borderColor: '#e2e8f0' }}
              keyboardType="phone-pad"
              left={<TextInput.Icon icon={() => <Phone size={20} color="#64748b" />} />}
            />
          </View>

          <TextInput
            label="Email"
            value={formData.email}
            onChangeText={text => setFormData({...formData, email: text})}
            mode="outlined"
            style={styles.input}
            outlineStyle={{ borderRadius: 12, borderColor: '#e2e8f0' }}
            keyboardType="email-address"
            autoCapitalize="none"
            left={<TextInput.Icon icon={() => <Mail size={20} color="#64748b" />} />}
          />

          <TextInput
            label="Nombre de Contacto"
            value={formData.contacto_nombre}
            onChangeText={text => setFormData({...formData, contacto_nombre: text})}
            mode="outlined"
            style={styles.input}
            outlineStyle={{ borderRadius: 12, borderColor: '#e2e8f0' }}
            left={<TextInput.Icon icon={() => <User size={20} color="#64748b" />} />}
          />

          <TextInput
            label="Dirección"
            value={formData.direccion}
            onChangeText={text => setFormData({...formData, direccion: text})}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.textArea}
            outlineStyle={{ borderRadius: 12, borderColor: '#e2e8f0' }}
            left={<TextInput.Icon icon={() => <MapPin size={20} color="#64748b" />} />}
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
          {editingSupplier ? 'GUARDAR CAMBIOS' : 'REGISTRAR PROVEEDOR'}
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
  input: { backgroundColor: 'transparent' },
  textArea: { backgroundColor: 'transparent', minHeight: 100 },
  row: { flexDirection: 'row', gap: 12 },
  submitBtn: { borderRadius: 16, height: 54, justifyContent: 'center', marginBottom: 40 },
});
