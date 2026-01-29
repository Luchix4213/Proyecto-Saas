import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, TextInput, Button, useTheme, Surface } from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Store } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

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
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#0f172a', '#134e4a', '#065f46']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Decorative Orbs */}
      <View style={styles.orbContainer}>
        <LinearGradient
            colors={['rgba(20, 184, 166, 0.15)', 'transparent']}
            style={[styles.orb, { top: -height * 0.1, left: -width * 0.1, width: width * 0.8, height: width * 0.8, borderRadius: width * 0.4 }]}
        />
        <LinearGradient
            colors={['rgba(16, 185, 129, 0.15)', 'transparent']}
            style={[styles.orb, { bottom: -height * 0.1, right: -width * 0.1, width: width * 0.8, height: width * 0.8, borderRadius: width * 0.4 }]}
        />
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <View style={styles.header}>
                  <LinearGradient
                    colors={['#14b8a6', '#10b981']}
                    style={styles.logoBox}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                      <Text style={styles.logoText}>K</Text>
                  </LinearGradient>
                  <Text style={styles.title}>Bienvenido a Kipu</Text>
                  <Text style={styles.subtitle}>Gestión inteligente para tu negocio</Text>
              </View>

              <Surface style={styles.card} elevation={0}>
                  <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>EMAIL CORPORATIVO</Text>
                      <TextInput
                          mode="outlined"
                          placeholder="tu@empresa.com"
                          value={email}
                          onChangeText={setEmail}
                          autoCapitalize="none"
                          keyboardType="email-address"
                          left={<TextInput.Icon icon={() => <Mail size={18} color="#94a3b8" />} />}
                          style={styles.input}
                          outlineStyle={styles.inputOutline}
                          placeholderTextColor="#cbd5e1"
                          activeOutlineColor="#14b8a6"
                      />
                  </View>

                  <View style={styles.inputGroup}>
                      <View style={styles.rowLabel}>
                          <Text style={styles.inputLabel}>CONTRASEÑA</Text>
                          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
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
                          activeOutlineColor="#14b8a6"
                      />
                  </View>

                  {error && (
                      <View style={styles.errorBox}>
                          <View style={styles.errorDot} />
                          <Text style={styles.errorText}>{error}</Text>
                      </View>
                  )}

                  <TouchableOpacity
                    onPress={handleLogin}
                    disabled={isLoading}
                    activeOpacity={0.8}
                  >
                      <LinearGradient
                        colors={['#0d9488', '#059669']}
                        style={[styles.loginBtnGradient, isLoading && { opacity: 0.5 }]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        {isLoading ? (
                            <View style={styles.loader} />
                        ) : (
                            <View style={styles.btnContent}>
                                <Text style={styles.loginBtnText}>INGRESAR</Text>
                                <ArrowRight size={20} color="white" />
                            </View>
                        )}
                      </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.guestBtn}
                    onPress={() => navigation.navigate('Consumer')}
                  >
                      <View style={styles.guestBtnInner}>
                          <Store size={18} color="#64748b" style={{ marginRight: 8 }} />
                          <Text style={styles.guestBtnLabel}>VER MERCADO COMO INVITADO</Text>
                      </View>
                  </TouchableOpacity>
              </Surface>

              <View style={styles.footer}>
                  <Text style={styles.footerText}>¿No tienes una cuenta?</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                      <Text style={styles.registerLink}>Registra tu empresa</Text>
                  </TouchableOpacity>
              </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  orbContainer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  orb: { position: 'absolute' },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 40 },
  logoBox: {
    width: 70,
    height: 70,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#14b8a6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  logoText: { fontSize: 32, fontVariant: ['tabular-nums'], fontWeight: 'bold', color: 'white' },
  title: { fontSize: 28, fontWeight: 'bold', color: 'white', textAlign: 'center', letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 8, fontWeight: '500' },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 28,
    padding: 24,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  inputGroup: { gap: 8 },
  rowLabel: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#334155', letterSpacing: 0.5 },
  input: { backgroundColor: '#f8fafc', fontSize: 15 },
  inputOutline: { borderRadius: 14, borderColor: '#e2e8f0', borderWidth: 1.5 },
  forgotText: { fontSize: 13, fontWeight: '600', color: '#0d9488' },
  errorBox: {
    backgroundColor: '#fff1f2',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#fecdd3',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  errorDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#e11d48' },
  errorText: { color: '#e11d48', fontSize: 13, fontWeight: '600' },
  loginBtnGradient: {
    borderRadius: 14,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#0d9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loginBtnText: { fontWeight: 'bold', fontSize: 16, color: 'white', letterSpacing: 0.5 },
  loader: { width: 24, height: 24, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: 'white', borderRadius: 12 },
  guestBtn: { marginTop: 8, paddingVertical: 12 },
  guestBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  guestBtnLabel: { fontSize: 13, fontWeight: '700', color: '#64748b' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40, gap: 8 },
  footerText: { color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: '500' },
  registerLink: { color: '#14b8a6', fontWeight: 'bold', fontSize: 15 }
});
