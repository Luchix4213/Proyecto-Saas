import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, Surface, useTheme, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AestheticHeader } from '../..//components/v2/AestheticHeader';
import { useAuthStore } from '../..//store/authStore';
import {
  LogOut,
  MapPin,
  Settings,
  ChevronRight,
  ShieldAlert
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export const AdminMoreScreen = () => {
  const navigation = useNavigation<any>();
  const theme = useTheme();
  const { user, logout } = useAuthStore();

  const menuItems = [
    {
      title: 'Configuracion',
      items: [
        { label: 'Ajustes de Plataforma', icon: Settings, screen: null, color: '#64748b' }, // Future placeholder
        { label: 'Logs del Sistema', icon: ShieldAlert, screen: 'Audit', color: '#f59e0b' }, // Shortcut to Audit
      ]
    }
  ];

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error', error);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AestheticHeader title="Admin Panel" subtitle="Configuración" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.profileCard} elevation={2}>
            <Avatar.Text
                size={60}
                label={user?.nombre_completo?.substring(0,2).toUpperCase() || 'AD'}
                style={{ backgroundColor: '#0f172a' }}
            />
            <View style={{ marginLeft: 16 }}>
                <Text style={styles.profileName}>{user?.nombre_completo || 'Super Administrador'}</Text>
                <View style={styles.locationTag}>
                    <MapPin size={12} color="#64748b" />
                    <Text style={styles.locationText}>Portal Administrativo</Text>
                </View>
            </View>
        </Surface>

        {menuItems.map((group, idx) => (
            <View key={idx} style={styles.group}>
                <Text style={styles.groupTitle}>{group.title}</Text>
                <View style={styles.groupContainer}>
                    {group.items.map((item, i) => (
                        <TouchableOpacity
                            key={i}
                            style={styles.menuItem}
                            onPress={() => item.screen && navigation.navigate(item.screen)}
                            disabled={!item.screen}
                        >
                            <View style={[styles.iconBox, { backgroundColor: item.color + '10' }]}>
                                <item.icon size={22} color={item.color} />
                            </View>
                            <Text style={[styles.menuLabel, !item.screen && { color: '#94a3b8' }]}>
                                {item.label}
                            </Text>
                            {!item.screen && <Text style={styles.comingSoon}>Próximamente</Text>}
                            <ChevronRight size={18} color="#cbd5e1" />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        ))}

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <LogOut size={20} color="#ef4444" />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    backgroundColor: 'white',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  profileName: { fontSize: 20, fontWeight: '900', color: '#1e293b' },
  locationTag: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  locationText: { fontSize: 13, color: '#64748b', marginLeft: 6, fontWeight: '500' },
  group: { marginBottom: 32 },
  groupTitle: { fontSize: 11, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 16, marginLeft: 8, letterSpacing: 1 },
  groupContainer: { backgroundColor: 'white', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#f1f5f9' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc'
  },
  iconBox: { padding: 10, borderRadius: 14, marginRight: 16 },
  menuLabel: { flex: 1, fontSize: 16, fontWeight: '700', color: '#334155' },
  comingSoon: { fontSize: 10, color: '#94a3b8', marginRight: 8, fontWeight: '700', textTransform: 'uppercase' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 8,
    gap: 10
  },
  logoutText: { color: '#ef4444', fontWeight: '800', fontSize: 16 }
});
