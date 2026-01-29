import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Text, TextInput, Button, useTheme, Surface, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../../api/authService';

export const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const theme = useTheme();
  const navigation = useNavigation<any>();

  const handleSubmit = async () => {
    if (!email) return;
    setIsLoading(true);
    setStatus('idle');
    try {
      const response = await authService.forgotPassword(email);
      setMessage(response?.message || 'Se ha enviado un correo con instrucciones.');
      setStatus('success');
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Error al procesar la solicitud.');
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <Surface style={styles.successIconBox} elevation={0}>
            <CheckCircle2 size={48} color="#16a34a" />
          </Surface>
          <Text style={styles.successTitle}>¡Correo Enviado!</Text>
          <Text style={styles.successText}>
            {message}
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.goBack()}
            style={styles.mainButton}
            labelStyle={styles.mainButtonLabel}
          >
            VOLVER AL LOGIN
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <ArrowLeft size={24} color="#64748b" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Surface style={styles.iconBox} elevation={0}>
              <KeyRound size={40} color="#0f172a" />
            </Surface>

            <Text style={styles.title}>Recuperar Clave</Text>
            <Text style={styles.subtitle}>
              Ingresa tu correo para recibir las instrucciones de acceso
            </Text>
          </View>

          <Surface style={styles.card} elevation={0}>
            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CORREO ELECTRÓNICO</Text>
                <TextInput
                    mode="outlined"
                    placeholder="tu@ejemplo.com"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    left={<TextInput.Icon icon={() => <Mail size={18} color="#94a3b8" />} />}
                    style={styles.input}
                    outlineStyle={styles.inputOutline}
                    placeholderTextColor="#cbd5e1"
                    error={status === 'error'}
                />
            </View>

            {status === 'error' && (
                <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{message}</Text>
                </View>
            )}

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading || !email}
              style={styles.mainButton}
              labelStyle={styles.mainButtonLabel}
            >
              ENVIAR INSTRUCCIONES
            </Button>
          </Surface>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 20, left: 24, zIndex: 1, backgroundColor: 'white', padding: 8, borderRadius: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  header: { alignItems: 'center', marginBottom: 40 },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  title: { fontSize: 26, fontWeight: '900', color: '#0f172a', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 10, paddingHorizontal: 20, lineHeight: 20 },
  card: {
    backgroundColor: 'white',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 20,
  },
  inputGroup: { gap: 8 },
  inputLabel: { fontSize: 11, fontWeight: '900', color: '#94a3b8', letterSpacing: 1 },
  input: { backgroundColor: 'white', fontSize: 15 },
  inputOutline: { borderRadius: 16, borderColor: '#e2e8f0' },
  errorBox: { backgroundColor: '#fef2f2', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#fee2e2' },
  errorText: { color: '#ef4444', fontSize: 13, textAlign: 'center', fontWeight: '600' },
  mainButton: { borderRadius: 16, height: 56, justifyContent: 'center', marginTop: 8, backgroundColor: '#0f172a' },
  mainButtonLabel: { fontWeight: '900', fontSize: 16, letterSpacing: 1, color: 'white' },
  successContainer: { flex: 1, justifyContent: 'center', padding: 32, alignItems: 'center' },
  successIconBox: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
  successTitle: { fontSize: 28, fontWeight: '900', color: '#0f172a', textAlign: 'center', marginBottom: 16 },
  successText: { textAlign: 'center', color: '#64748b', fontSize: 16, lineHeight: 24, marginBottom: 40 },
});
