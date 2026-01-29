import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, useTheme, Surface, IconButton, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { tenantsService, Tenant, UpdateTenantDto } from '../..//api/tenantsService';
import { Save, X, Building2, MapPin, Phone, Mail, Clock, ShieldCheck, AlertTriangle } from 'lucide-react-native';

export const TenantFormScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const theme = useTheme();
  const editingTenant = route.params?.tenant as Tenant | undefined;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<UpdateTenantDto>>({
    nombre_empresa: editingTenant?.nombre_empresa || '',
    telefono: editingTenant?.telefono || '',
    direccion: editingTenant?.direccion || '',
    email: editingTenant?.email || '',
    horario_atencion: editingTenant?.horario_atencion || '',
  });

  const [status, setStatus] = useState<'ACTIVA' | 'SUSPENDIDO' | 'PENDIENTE' | 'INACTIVA'>(editingTenant?.estado || 'PENDIENTE');

  const isEditing = !!editingTenant;

  const handleSave = async () => {
    if (!isEditing) {
        Alert.alert(
            'Información',
            'La creación manual de empresas desde el panel administrativo requiere flujos complejos. Por favor registre la empresa desde la app o web pública.',
            [{ text: 'Entendido' }]
        );
        return;
    }

    setLoading(true);
    try {
      await tenantsService.updateTenant(editingTenant.tenant_id, formData);
      if (status !== editingTenant.estado) {
          await tenantsService.updateStatus(editingTenant.tenant_id, status);
      }
      Alert.alert('Éxito', 'Empresa actualizada correctamente');
      navigation.goBack();
    } catch (error: any) {
      console.error('Error saving tenant', error);
      Alert.alert('Error', 'No se pudo actualizar la empresa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Surface style={styles.header} elevation={0}>
        <IconButton icon={() => <X size={24} color="#64748b" />} onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>{isEditing ? 'Editar Empresa' : 'Nueva Empresa'}</Text>
        <IconButton
          icon={() => <Save size={24} color={theme.colors.primary} />}
          onPress={handleSave}
          disabled={loading}
        />
      </Surface>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>

            {/* Status Section */}
            <Surface style={[styles.section, styles.statusSection, { borderColor: status === 'ACTIVA' ? '#bbf7d0' : '#fecaca' }]}>
                <View style={styles.statusHeader}>
                    <View style={[styles.statusIcon, { backgroundColor: status === 'ACTIVA' ? '#dcfce7' : '#fee2e2' }]}>
                        {status === 'ACTIVA' ? <ShieldCheck size={20} color="#166534" /> : <AlertTriangle size={20} color="#991b1b" />}
                    </View>
                    <View>
                        <Text style={styles.statusLabel}>Estado Actual</Text>
                        <Text style={[styles.statusValue, { color: status === 'ACTIVA' ? '#166534' : '#991b1b' }]}>{status}</Text>
                    </View>
                </View>
                <View style={styles.statusActions}>
                    <Chip
                        selected={status === 'ACTIVA'}
                        onPress={() => setStatus('ACTIVA')}
                        style={{ backgroundColor: status === 'ACTIVA' ? '#dcfce7' : 'white', flex: 1 }}
                        textStyle={{ color: '#166534', fontWeight: '700' }}
                        showSelectedCheck
                    >Activar</Chip>
                    <Chip
                        selected={status === 'SUSPENDIDO'}
                        onPress={() => setStatus('SUSPENDIDO')}
                        style={{ backgroundColor: status === 'SUSPENDIDO' ? '#fee2e2' : 'white', borderColor: '#ef4444', flex: 1 }}
                        mode="outlined"
                        textStyle={{ color: '#991b1b', fontWeight: '700' }}
                        showSelectedCheck
                    >Suspender</Chip>
                </View>
            </Surface>

            {/* General Info */}
            <Surface style={styles.section} elevation={0}>
                <Text style={styles.sectionTitle}>INFORMACIÓN GENERAL</Text>
                <View style={styles.inputGroup}>
                    <TextInput
                        label="Nombre Empresa"
                        value={formData.nombre_empresa}
                        onChangeText={text => setFormData({...formData, nombre_empresa: text})}
                        mode="outlined"
                        style={styles.input}
                        outlineStyle={styles.inputOutline}
                        left={<TextInput.Icon icon={() => <Building2 size={20} color="#94a3b8" />} />}
                    />
                    <TextInput
                        label="Email Contacto"
                        value={formData.email}
                        onChangeText={text => setFormData({...formData, email: text})}
                        mode="outlined"
                        style={styles.input}
                        outlineStyle={styles.inputOutline}
                        keyboardType="email-address"
                        left={<TextInput.Icon icon={() => <Mail size={20} color="#94a3b8" />} />}
                    />
                    <TextInput
                        label="Teléfono"
                        value={formData.telefono}
                        onChangeText={text => setFormData({...formData, telefono: text})}
                        mode="outlined"
                        style={styles.input}
                        outlineStyle={styles.inputOutline}
                        keyboardType="phone-pad"
                        left={<TextInput.Icon icon={() => <Phone size={20} color="#94a3b8" />} />}
                    />
                </View>
            </Surface>

            {/* Location & Hours */}
            <Surface style={styles.section} elevation={0}>
                <Text style={styles.sectionTitle}>UBICACIÓN Y HORARIOS</Text>
                <View style={styles.inputGroup}>
                    <TextInput
                        label="Dirección Física"
                        value={formData.direccion}
                        onChangeText={text => setFormData({...formData, direccion: text})}
                        mode="outlined"
                        multiline
                        style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
                        outlineStyle={styles.inputOutline}
                        left={<TextInput.Icon icon={() => <MapPin size={20} color="#94a3b8" />} />}
                    />
                    <TextInput
                        label="Horario de Atención"
                        value={formData.horario_atencion}
                        onChangeText={text => setFormData({...formData, horario_atencion: text})}
                        mode="outlined"
                        style={styles.input}
                        outlineStyle={styles.inputOutline}
                        left={<TextInput.Icon icon={() => <Clock size={20} color="#94a3b8" />} />}
                    />
                </View>
            </Surface>

        </ScrollView>
      </KeyboardAvoidingView>
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
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#0f172a' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  section: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94a3b8',
    marginBottom: 16,
    letterSpacing: 0.5
  },
  inputGroup: { gap: 12 },
  input: {
    backgroundColor: 'white',
    fontSize: 15,
  },
  inputOutline: {
    borderRadius: 12,
    borderColor: '#e2e8f0'
  },

  // Status Section
  statusSection: {
    borderWidth: 1,
    backgroundColor: '#ffffff'
  },
  statusHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16
  },
  statusIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12
  },
  statusLabel: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  statusValue: { fontSize: 16, fontWeight: '800' },
  statusActions: { flexDirection: 'row', gap: 12 }
});
