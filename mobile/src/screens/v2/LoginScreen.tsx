import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, useTheme, Surface } from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading, error } = useAuthStore();
  const { expoPushToken } = usePushNotifications();
  const theme = useTheme();

  const handleLogin = async () => {
    if (!email || !password) return;
    try {
      await login(email, password, expoPushToken);
    } catch (e) {
      // Error handled in store
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Surface style={styles.logoBox} elevation={0}>
                    <Text style={styles.logoText}>S</Text>
                </Surface>
                <Text style={styles.title}>Bienvenido a SaasFlow</Text>
                <Text style={styles.subtitle}>Gestiona tu negocio con la mejor tecnología</Text>
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
                    />
                </View>

                <View style={styles.inputGroup}>
                    <View style={styles.rowLabel}>
                        <Text style={styles.inputLabel}>CONTRASEÑA</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                            <Text style={styles.forgotText}>¿Olvidaste la clave?</Text>
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        mode="outlined"
                        placeholder="••••••••"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        right={
                            <TextInput.Icon
                                icon={() => showPassword ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
                                onPress={() => setShowPassword(!showPassword)}
                            />
                        }
                        left={<TextInput.Icon icon={() => <Lock size={18} color="#94a3b8" />} />}
                        style={styles.input}
                        outlineStyle={styles.inputOutline}
                        placeholderTextColor="#cbd5e1"
                    />
                </View>

                {error && (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                <Button
                    mode="contained"
                    onPress={handleLogin}
                    loading={isLoading}
                    disabled={isLoading}
                    style={styles.loginBtn}
                    labelStyle={styles.loginBtnLabel}
                >
                    INICIAR SESIÓN
                </Button>
            </Surface>

            <View style={styles.footer}>
                <Text style={styles.footerText}>¿Aún no tienes una cuenta?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.registerLink}>Regístrate gratis</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: 40 },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: { fontSize: 28, fontWeight: '900', color: 'white' },
  title: { fontSize: 24, fontWeight: '900', color: '#0f172a', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 8, paddingHorizontal: 20 },
  card: {
    backgroundColor: 'white',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 20,
  },
  inputGroup: { gap: 8 },
  rowLabel: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  inputLabel: { fontSize: 11, fontWeight: '900', color: '#94a3b8', letterSpacing: 1 },
  input: { backgroundColor: 'white', fontSize: 15 },
  inputOutline: { borderRadius: 16, borderColor: '#e2e8f0' },
  forgotText: { fontSize: 12, fontWeight: '800', color: '#3b82f6' },
  errorBox: { backgroundColor: '#fef2f2', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#fee2e2' },
  errorText: { color: '#ef4444', fontSize: 13, textAlign: 'center', fontWeight: '600' },
  loginBtn: { borderRadius: 16, height: 56, justifyContent: 'center', marginTop: 8, backgroundColor: '#0f172a' },
  loginBtnLabel: { fontWeight: '900', fontSize: 16, letterSpacing: 1, color: 'white' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40, gap: 8 },
  footerText: { color: '#64748b', fontSize: 14, fontWeight: '500' },
  registerLink: { color: '#0f172a', fontWeight: '800', fontSize: 14 }
});
