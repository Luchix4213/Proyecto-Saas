import React, { useState, useEffect } from 'react';
import { View, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Text, TextInput, Button, useTheme, Surface, Checkbox, Portal, Modal, Divider, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Building2, User, Mail, Lock, ArrowLeft, ArrowRight, CheckCircle2, Phone, MapPin, ChevronDown, Rocket } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { authService, RegisterTenantRequest } from '../../api/authService';
import { rubrosService, Rubro } from '../../api/rubrosService';

export const RegisterScreen = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [rubros, setRubros] = useState<Rubro[]>([]);
  const [showRubrosModal, setShowRubrosModal] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<RegisterTenantRequest>({
    nombre_empresa: '',
    telefono_empresa: '',
    email_empresa: '',
    direccion_empresa: '',
    rubros: [],
    nombre: '',
    paterno: '',
    materno: '',
    email: '',
    password: '',
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const theme = useTheme();
  const navigation = useNavigation<any>();

  useEffect(() => {
    fetchRubros();
  }, []);

  const fetchRubros = async () => {
    try {
      const data = await rubrosService.getAll();
      setRubros(data.filter(r => r.estado === 'ACTIVO'));
    } catch (err) {
      console.error('Error fetching rubros', err);
    }
  };

  const handleRubroToggle = (id: number) => {
    setFormData(prev => {
      const exists = prev.rubros.includes(id);
      if (exists) {
        return { ...prev, rubros: prev.rubros.filter(rid => rid !== id) };
      }
      return { ...prev, rubros: [...prev.rubros, id] };
    });
  };

  const validateStep1 = () => {
    if (!formData.nombre_empresa || !formData.email_empresa || formData.rubros.length === 0) {
      setError('Por favor completa los campos obligatorios y selecciona al menos un rubro.');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (!formData.nombre || !formData.paterno || !formData.email || !formData.password) {
      setError('Por favor completa todos los campos obligatorios.');
      return false;
    }
    if (formData.password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setIsLoading(true);
    try {
      await authService.register(formData);
      setStep(3); // Success step
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar la empresa.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      <View style={[styles.stepLine, step >= 1 && styles.stepLineActive]} />
      <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
    </View>
  );

  if (step === 3) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <Surface style={styles.successIconBox} elevation={0}>
            <CheckCircle2 size={48} color="#16a34a" />
          </Surface>
          <Text style={styles.successTitle}>¡Solicitud Enviada!</Text>
          <Text style={styles.successText}>
            Tu empresa ha sido registrada correctamente. Un administrador revisará tu solicitud y te notificará por correo.
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Login')}
            style={styles.mainButton}
            labelStyle={styles.mainButtonLabel}
          >
            VOLVER AL INICIO
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.topNav}>
              <IconButton
                icon={() => <ArrowLeft size={20} color="#64748b" />}
                onPress={() => step === 1 ? navigation.goBack() : setStep(1)}
                style={styles.backIconButton}
              />
              <View style={styles.headerInfo}>
                <Text style={styles.stepText}>PASO {step} DE 2</Text>
                <Text style={styles.title}>
                  {step === 1 ? 'Datos del Negocio' : 'Datos del Dueño'}
                </Text>
              </View>
          </View>

          {renderStepIndicator()}

          {error ? (
              <Surface style={styles.errorBox} elevation={0}>
                  <Text style={styles.errorText}>{error}</Text>
              </Surface>
          ) : null}

          <Surface style={styles.card} elevation={0}>
            {step === 1 ? (
                <View style={styles.formSection}>
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>NOMBRE DEL NEGOCIO *</Text>
                    <TextInput
                        mode="outlined"
                        placeholder="Ej. Mi Ferretería"
                        value={formData.nombre_empresa}
                        onChangeText={text => setFormData({ ...formData, nombre_empresa: text })}
                        left={<TextInput.Icon icon={() => <Rocket size={18} color="#94a3b8" />} />}
                        style={styles.input}
                        outlineStyle={styles.inputOutline}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>CORREO CORPORATIVO *</Text>
                    <TextInput
                        mode="outlined"
                        placeholder="ventas@negocio.com"
                        value={formData.email_empresa}
                        onChangeText={text => setFormData({ ...formData, email_empresa: text })}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        left={<TextInput.Icon icon={() => <Mail size={18} color="#94a3b8" />} />}
                        style={styles.input}
                        outlineStyle={styles.inputOutline}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>TELÉFONO DE CONTACTO</Text>
                    <TextInput
                        mode="outlined"
                        placeholder="+591 ..."
                        value={formData.telefono_empresa}
                        onChangeText={text => setFormData({ ...formData, telefono_empresa: text })}
                        keyboardType="phone-pad"
                        left={<TextInput.Icon icon={() => <Phone size={18} color="#94a3b8" />} />}
                        style={styles.input}
                        outlineStyle={styles.inputOutline}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>CATEGORÍA / RUBRO *</Text>
                    <TouchableOpacity onPress={() => setShowRubrosModal(true)}>
                        <Surface style={styles.selector} elevation={0}>
                        <View style={styles.selectorContent}>
                            <Text style={[styles.selectorValue, formData.rubros.length === 0 && { color: '#cbd5e1' }]}>
                            {formData.rubros.length > 0
                                ? `${formData.rubros.length} seleccionados`
                                : 'Seleccionar rubros...'}
                            </Text>
                            <ChevronDown size={18} color="#94a3b8" />
                        </View>
                        </Surface>
                    </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>DIRECCIÓN FÍSICA</Text>
                    <TextInput
                        mode="outlined"
                        placeholder="Calle, Ciudad..."
                        value={formData.direccion_empresa}
                        onChangeText={text => setFormData({ ...formData, direccion_empresa: text })}
                        left={<TextInput.Icon icon={() => <MapPin size={18} color="#94a3b8" />} />}
                        style={styles.input}
                        outlineStyle={styles.inputOutline}
                    />
                </View>

                <Button
                    mode="contained"
                    onPress={() => validateStep1() && setStep(2)}
                    style={styles.mainButton}
                    labelStyle={styles.mainButtonLabel}
                >
                    CONTINUAR
                </Button>
                </View>
            ) : (
                <View style={styles.formSection}>
                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.inputLabel}>NOMBRE *</Text>
                        <TextInput
                            mode="outlined"
                            placeholder="Juan"
                            value={formData.nombre}
                            onChangeText={text => setFormData({ ...formData, nombre: text })}
                            style={styles.input}
                            outlineStyle={styles.inputOutline}
                        />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.inputLabel}>APELLIDO *</Text>
                        <TextInput
                            mode="outlined"
                            placeholder="Pérez"
                            value={formData.paterno}
                            onChangeText={text => setFormData({ ...formData, paterno: text })}
                            style={styles.input}
                            outlineStyle={styles.inputOutline}
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>EMAIL PERSONAL *</Text>
                    <TextInput
                        mode="outlined"
                        placeholder="juan@perez.com"
                        value={formData.email}
                        onChangeText={text => setFormData({ ...formData, email: text })}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        left={<TextInput.Icon icon={() => <User size={18} color="#94a3b8" />} />}
                        style={styles.input}
                        outlineStyle={styles.inputOutline}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>CONTRASEÑA MAESTRA *</Text>
                    <TextInput
                        mode="outlined"
                        placeholder="••••••••"
                        value={formData.password}
                        onChangeText={text => setFormData({ ...formData, password: text })}
                        secureTextEntry={!showPassword}
                        left={<TextInput.Icon icon={() => <Lock size={18} color="#94a3b8" />} />}
                        style={styles.input}
                        outlineStyle={styles.inputOutline}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>CONFIRMAR CONTRASEÑA *</Text>
                    <TextInput
                        mode="outlined"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showPassword}
                        left={<TextInput.Icon icon={() => <Lock size={18} color="#94a3b8" />} />}
                        style={styles.input}
                        outlineStyle={styles.inputOutline}
                    />
                </View>

                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    loading={isLoading}
                    disabled={isLoading}
                    style={[styles.mainButton, { backgroundColor: '#0f172a' }]}
                    labelStyle={styles.mainButtonLabel}
                >
                    REGISTRAR MI NEGOCIO
                </Button>
                </View>
            )}
          </Surface>

          <View style={styles.footer}>
                <Text style={styles.footerText}>¿Ya tienes una cuenta?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.loginLink}>Inicia Sesión</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Portal>
        <Modal visible={showRubrosModal} onDismiss={() => setShowRubrosModal(false)} contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>Seleccionar Rubros</Text>
          <Text style={styles.modalSubtitle}>Identifica el sector de tu negocio</Text>
          <ScrollView style={{ maxHeight: 400, marginTop: 16 }}>
            {rubros.map(rubro => (
              <TouchableOpacity key={rubro.rubro_id} onPress={() => handleRubroToggle(rubro.rubro_id)} style={styles.rubroItem}>
                  <View style={styles.rubroLeft}>
                    <Text style={[styles.rubroName, formData.rubros.includes(rubro.rubro_id) && { color: theme.colors.primary, fontWeight: '800' }]}>
                        {rubro.nombre}
                    </Text>
                  </View>
                  <Checkbox
                    status={formData.rubros.includes(rubro.rubro_id) ? 'checked' : 'unchecked'}
                    color={theme.colors.primary}
                  />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Button mode="contained" onPress={() => setShowRubrosModal(false)} style={styles.doneBtn} labelStyle={{ fontWeight: '800' }}>
            LISTO
          </Button>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 60, paddingTop: 20 },
  topNav: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backIconButton: { backgroundColor: 'white', borderWidth: 1, borderColor: '#f1f5f9', margin: 0, marginRight: 16, borderRadius: 12 },
  headerInfo: { flex: 1 },
  stepText: { fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 1 },
  title: { fontSize: 20, fontWeight: '900', color: '#0f172a', marginTop: 2 },
  stepIndicatorContainer: { flexDirection: 'row', gap: 8, marginBottom: 32 },
  stepLine: { height: 4, flex: 1, backgroundColor: '#e2e8f0', borderRadius: 2 },
  stepLineActive: { backgroundColor: '#3b82f6' },
  card: { backgroundColor: 'white', borderRadius: 28, padding: 24, borderWidth: 1, borderColor: '#f1f5f9' },
  formSection: { gap: 20 },
  inputGroup: { gap: 8 },
  inputLabel: { fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 1 },
  input: { backgroundColor: 'white', fontSize: 15 },
  inputOutline: { borderRadius: 16, borderColor: '#e2e8f0' },
  selector: { height: 50, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: 'white', paddingHorizontal: 16, justifyContent: 'center' },
  selectorContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectorValue: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
  mainButton: { borderRadius: 16, height: 56, justifyContent: 'center', marginTop: 12 },
  mainButtonLabel: { fontWeight: '900', fontSize: 16, letterSpacing: 1 },
  row: { flexDirection: 'row', gap: 12 },
  errorBox: { backgroundColor: '#fef2f2', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#fee2e2', marginBottom: 20 },
  errorText: { color: '#ef4444', fontSize: 13, textAlign: 'center', fontWeight: '700' },
  modalContent: { backgroundColor: 'white', padding: 28, margin: 20, borderRadius: 32 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  modalSubtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  rubroItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  rubroLeft: { flex: 1 },
  rubroName: { fontSize: 15, fontWeight: '600', color: '#334155' },
  doneBtn: { marginTop: 24, borderRadius: 16, height: 50, justifyContent: 'center' },
  successContainer: { flex: 1, justifyContent: 'center', padding: 32, alignItems: 'center' },
  successIconBox: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
  successTitle: { fontSize: 26, fontWeight: '900', color: '#0f172a', textAlign: 'center', marginBottom: 16 },
  successText: { textAlign: 'center', color: '#64748b', fontSize: 16, lineHeight: 24, marginBottom: 40, paddingHorizontal: 10 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40, gap: 8 },
  footerText: { color: '#64748b', fontSize: 14, fontWeight: '500' },
  loginLink: { color: '#0f172a', fontWeight: '800', fontSize: 14 }
});
