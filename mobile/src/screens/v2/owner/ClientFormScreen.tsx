import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, useTheme, Surface, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { clientsService, Cliente, CreateClienteData } from '../../../api/clientsService';
import { User, Save, X, Phone, Mail, Hash, FileText } from 'lucide-react-native';

export const ClientFormScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const theme = useTheme();
  const editingClient = route.params?.client as Cliente | undefined;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateClienteData>>({
    nombre: editingClient?.nombre || '',
    paterno: editingClient?.paterno || '',
    materno: editingClient?.materno || '',
    email: editingClient?.email || '',
    telefono: editingClient?.telefono || '',
    nit_ci: editingClient?.nit_ci || '',
  });

  const handleSave = async () => {
    if (!formData.nombre) {
      Alert.alert('Error', 'El nombre es obligatorio.');
      return;
    }

    setLoading(true);
    try {
      const payload: CreateClienteData = {
          nombre: formData.nombre,
          paterno: formData.paterno,
          materno: formData.materno,
          email: formData.email,
          telefono: formData.telefono,
          nit_ci: formData.nit_ci,
      };

      if (editingClient) {
        await clientsService.update(editingClient.cliente_id, payload);
      } else {
        await clientsService.create(payload);
      }
      Alert.alert('Éxito', `Cliente ${editingClient ? 'actualizado' : 'registrado'} correctamente.`);
      navigation.goBack();
    } catch (error: any) {
      console.error('Error saving client', error);
      Alert.alert('Error', 'No se pudo guardar el cliente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Surface style={styles.header} elevation={0}>
        <IconButton icon={() => <X size={24} color="#64748b" />} onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>{editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}</Text>
        <IconButton
          icon={() => <Save size={24} color={theme.colors.primary} />}
          onPress={handleSave}
          disabled={loading}
        />
      </Surface>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.section} elevation={0}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          <TextInput
            label="Nombre *"
            value={formData.nombre}
            onChangeText={text => setFormData({...formData, nombre: text})}
            mode="outlined"
            style={styles.input}
            outlineStyle={{ borderRadius: 12, borderColor: '#e2e8f0' }}
            left={<TextInput.Icon icon={() => <User size={20} color="#64748b" />} />}
          />

          <View style={styles.row}>
            <TextInput
                label="Apellido Paterno"
                value={formData.paterno}
                onChangeText={text => setFormData({...formData, paterno: text})}
                mode="outlined"
                style={[styles.input, { flex: 1 }]}
                outlineStyle={{ borderRadius: 12, borderColor: '#e2e8f0' }}
            />
            <TextInput
                label="Apellido Materno"
                value={formData.materno}
                onChangeText={text => setFormData({...formData, materno: text})}
                mode="outlined"
                style={[styles.input, { flex: 1 }]}
                outlineStyle={{ borderRadius: 12, borderColor: '#e2e8f0' }}
            />
          </View>

          <TextInput
            label="NIT / CI"
            value={formData.nit_ci}
            onChangeText={text => setFormData({...formData, nit_ci: text})}
            mode="outlined"
            style={styles.input}
            outlineStyle={{ borderRadius: 12, borderColor: '#e2e8f0' }}
            left={<TextInput.Icon icon={() => <Hash size={20} color="#64748b" />} />}
          />

          <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Contacto</Text>

          <TextInput
            label="Teléfono"
            value={formData.telefono}
            onChangeText={text => setFormData({...formData, telefono: text})}
            mode="outlined"
            style={styles.input}
            outlineStyle={{ borderRadius: 12, borderColor: '#e2e8f0' }}
            keyboardType="phone-pad"
            left={<TextInput.Icon icon={() => <Phone size={20} color="#64748b" />} />}
          />

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
        </Surface>

        <Button
          mode="contained"
          onPress={handleSave}
          loading={loading}
          disabled={loading}
          style={[styles.submitBtn, { backgroundColor: theme.colors.primary }]}
          labelStyle={{ fontWeight: '800', fontSize: 16 }}
        >
          {editingClient ? 'GUARDAR CAMBIOS' : 'REGISTRAR CLIENTE'}
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
    gap: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  sectionTitle: { fontSize: 11, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  input: { backgroundColor: 'transparent' },
  row: { flexDirection: 'row', gap: 12 },
  submitBtn: { borderRadius: 16, height: 54, justifyContent: 'center', marginBottom: 40 },
});
