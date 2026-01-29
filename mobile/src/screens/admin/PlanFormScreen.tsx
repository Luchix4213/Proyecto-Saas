import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, useTheme, Surface, IconButton, Switch } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { planesService, Plan } from '../..//api/planesService';
import { Save, X, DollarSign, Users, Package, FileText, CheckCircle2 } from 'lucide-react-native';

export const PlanFormScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const theme = useTheme();
  const editingPlan = route.params?.plan as Plan | undefined;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre_plan: editingPlan?.nombre_plan || '',
    descripcion: editingPlan?.descripcion || '',
    precio_mensual: editingPlan?.precio_mensual?.toString() || '',
    precio_anual: editingPlan?.precio_anual?.toString() || '',
    max_usuarios: editingPlan?.max_usuarios?.toString() || '',
    max_productos: editingPlan?.max_productos?.toString() || '',
    ventas_online: editingPlan?.ventas_online || false,
    reportes_avanzados: editingPlan?.reportes_avanzados || false,
    estado: editingPlan ? editingPlan.estado === 'ACTIVO' : true,
  });

  const handleSave = async () => {
    if (!formData.nombre_plan || !formData.precio_mensual) {
      Alert.alert('Error', 'Nombre y Precio Mensual son obligatorios');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
          ...formData,
          precio_mensual: parseFloat(formData.precio_mensual),
          precio_anual: parseFloat(formData.precio_anual) || 0,
          max_usuarios: parseInt(formData.max_usuarios) || 0,
          max_productos: parseInt(formData.max_productos) || 0,
          estado: formData.estado ? 'ACTIVO' : 'INACTIVO'
      };

      if (editingPlan) {
        await planesService.updatePlan(editingPlan.plan_id, payload);
        Alert.alert('Éxito', 'Plan actualizado correctamente');
      } else {
        await planesService.createPlan(payload);
        Alert.alert('Éxito', 'Plan creado correctamente');
      }
      navigation.goBack();
    } catch (error: any) {
      console.error('Error saving plan', error);
      Alert.alert('Error', 'No se pudo guardar el plan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Surface style={styles.header} elevation={0}>
        <IconButton icon={() => <X size={24} color="#64748b" />} onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>{editingPlan ? 'Editar Plan' : 'Nuevo Plan'}</Text>
        <IconButton
          icon={() => <Save size={24} color={theme.colors.primary} />}
          onPress={handleSave}
          disabled={loading}
        />
      </Surface>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>

            {/* General Info */}
            <Surface style={styles.section} elevation={0}>
                <Text style={styles.sectionTitle}>DETALLES DEL PLAN</Text>
                <View style={styles.inputGroup}>
                    <TextInput
                        label="Nombre del Plan"
                        value={formData.nombre_plan}
                        onChangeText={text => setFormData({...formData, nombre_plan: text})}
                        mode="outlined"
                        style={styles.input}
                        outlineStyle={styles.inputOutline}
                        left={<TextInput.Icon icon={() => <FileText size={20} color="#94a3b8" />} />}
                    />
                     <TextInput
                        label="Descripción (Opcional)"
                        value={formData.descripcion}
                        onChangeText={text => setFormData({...formData, descripcion: text})}
                        mode="outlined"
                        multiline
                        style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
                        outlineStyle={styles.inputOutline}
                    />
                </View>
            </Surface>

            {/* Pricing */}
            <Surface style={styles.section} elevation={0}>
                <Text style={styles.sectionTitle}>PRECIOS Y FACTURACIÓN</Text>
                <View style={styles.row}>
                     <TextInput
                        label="Mensual (USD)"
                        value={formData.precio_mensual}
                        onChangeText={text => setFormData({...formData, precio_mensual: text})}
                        mode="outlined"
                        keyboardType="numeric"
                        style={[styles.input, { flex: 1 }]}
                        outlineStyle={styles.inputOutline}
                        left={<TextInput.Icon icon={() => <DollarSign size={20} color="#94a3b8" />} />}
                    />
                    <TextInput
                        label="Anual (USD)"
                        value={formData.precio_anual}
                        onChangeText={text => setFormData({...formData, precio_anual: text})}
                        mode="outlined"
                        keyboardType="numeric"
                        style={[styles.input, { flex: 1 }]}
                        outlineStyle={styles.inputOutline}
                        left={<TextInput.Icon icon={() => <DollarSign size={20} color="#94a3b8" />} />}
                    />
                </View>
            </Surface>

            {/* Limits & Features */}
            <Surface style={styles.section} elevation={0}>
                <Text style={styles.sectionTitle}>LÍMITES Y FUNCIONALIDADES</Text>
                <View style={styles.row}>
                    <TextInput
                        label="Max Usuarios"
                        value={formData.max_usuarios}
                        onChangeText={text => setFormData({...formData, max_usuarios: text})}
                        mode="outlined"
                        keyboardType="numeric"
                        style={[styles.input, { flex: 1 }]}
                        outlineStyle={styles.inputOutline}
                        left={<TextInput.Icon icon={() => <Users size={20} color="#94a3b8" />} />}
                    />
                    <TextInput
                        label="Max Productos"
                        value={formData.max_productos}
                        onChangeText={text => setFormData({...formData, max_productos: text})}
                        mode="outlined"
                        keyboardType="numeric"
                        style={[styles.input, { flex: 1 }]}
                        outlineStyle={styles.inputOutline}
                        left={<TextInput.Icon icon={() => <Package size={20} color="#94a3b8" />} />}
                    />
                </View>

                <View style={styles.togglesContainer}>
                     <View style={styles.toggleRow}>
                         <View style={{ flex: 1 }}>
                            <Text style={styles.toggleLabel}>Ventas Online</Text>
                            <Text style={styles.toggleSub}>Habilitar módulo e-commerce</Text>
                         </View>
                         <Switch value={formData.ventas_online} onValueChange={v => setFormData({...formData, ventas_online: v})} color={theme.colors.primary} />
                     </View>
                     <View style={styles.divider} />
                     <View style={styles.toggleRow}>
                         <View style={{ flex: 1 }}>
                            <Text style={styles.toggleLabel}>Reportes Avanzados</Text>
                            <Text style={styles.toggleSub}>Analytics y exportación de datos</Text>
                         </View>
                         <Switch value={formData.reportes_avanzados} onValueChange={v => setFormData({...formData, reportes_avanzados: v})} color={theme.colors.primary} />
                     </View>
                </View>
            </Surface>

             {/* Status Toggle */}
             <Surface style={[styles.section, { borderColor: formData.estado ? '#bbf7d0' : '#e2e8f0' }]} elevation={0}>
                 <View style={styles.toggleRow}>
                     <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View style={[styles.statusIcon, { backgroundColor: formData.estado ? '#dcfce7' : '#f1f5f9' }]}>
                             <CheckCircle2 size={20} color={formData.estado ? '#166534' : '#94a3b8'} />
                        </View>
                         <View>
                            <Text style={styles.toggleLabel}>Estado del Plan</Text>
                            <Text style={[styles.toggleSub, { color: formData.estado ? '#166534' : '#64748b', fontWeight: '600' }]}>
                                {formData.estado ? 'ACTIVO (Visible)' : 'INACTIVO (Oculto)'}
                            </Text>
                         </View>
                     </View>
                     <Switch value={formData.estado} onValueChange={v => setFormData({...formData, estado: v})} color="#166534" />
                 </View>
            </Surface>

            <Button
                mode="contained"
                onPress={handleSave}
                loading={loading}
                disabled={loading}
                style={styles.submitBtn}
                contentStyle={{ height: 50 }}
                labelStyle={{ fontSize: 16, fontWeight: '700' }}
            >
                GUARDAR CAMBIOS
            </Button>

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
    borderWidth: 1,
    borderColor: '#f1f5f9'
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
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  togglesContainer: { marginTop: 8 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  toggleLabel: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
  toggleSub: { fontSize: 13, color: '#64748b' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 12 },
  statusIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  submitBtn: { borderRadius: 12, marginTop: 8, backgroundColor: '#0f172a' }
});
