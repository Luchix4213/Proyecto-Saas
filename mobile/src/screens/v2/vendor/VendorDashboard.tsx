import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Button, useTheme, Surface, IconButton } from 'react-native-paper';
import { useAuthStore } from '../../../store/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AestheticHeader } from '../../../components/v2/AestheticHeader';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { tenantsService } from '../../../api/tenantsService';
import { SquareTerminal, History, LogOut } from 'lucide-react-native';

export const VendorDashboard = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const { logout, user } = useAuthStore();
  const [companyName, setCompanyName] = useState<string>('');

  const sections = [
    {
      title: "Nueva Venta",
      description: "Abrir Catálogo",
      icon: SquareTerminal,
      color: theme.colors.primary,
      screen: "POSCatalog",
      isBig: true
    },
    {
      title: "Historial",
      description: "Ver transacciones pasadas",
      icon: History,
      color: "#334155",
      screen: "Sales",
      isBig: false
    }
  ];

  useFocusEffect(
    React.useCallback(() => {
      fetchTenantInfo();
    }, [])
  );

  const fetchTenantInfo = async () => {
    if (user?.tenant_id) {
        try {
            const data = await tenantsService.getById(user.tenant_id);
            setCompanyName(data.nombre_empresa);
        } catch (error) {
            console.error('Error loading tenant', error);
        }
    }
  };

  const handleLogout = async () => {
    await logout();
    // Navigation reset typically handled by AppNavigator listening to auth state
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
        <AestheticHeader
            title={user?.nombre_completo || "Vendedor"}
            subtitle={companyName || "Punto de Venta"}
            showBack={false}
            rightAction={
                <IconButton icon={() => <LogOut size={20} color="#64748b" />} onPress={handleLogout} />
            }
        />

        <ScrollView contentContainerStyle={styles.content}>
            <Surface style={styles.userCard} elevation={0}>
                <View style={styles.avatar}>
                    {/* User icon removed as per instruction, keeping placeholder for now or could be replaced with initials */}
                    <Text style={{color: 'white', fontSize: 24, fontWeight: 'bold'}}>{user?.nombre_completo?.charAt(0).toUpperCase()}</Text>
                </View>
                <View>
                    <Text style={styles.greeting}>Hola, {user?.nombre_completo?.split(' ')[0]}</Text>
                    <Text style={styles.role}>Vendedor de Mostrador</Text>
                </View>
            </Surface>

            <View style={styles.grid}>
                {sections.map((section, index) => (
                    <TouchableOpacity
                        key={index}
                        style={section.isBig ?
                            [styles.bigButton, { backgroundColor: section.color }] :
                            [styles.smallButton]}
                        onPress={() => navigation.navigate(section.screen)}
                    >
                        <section.icon size={section.isBig ? 48 : 32} color={section.isBig ? "white" : section.color} />
                        <Text style={section.isBig ? styles.bigButtonText : styles.smallButtonText}>{section.title}</Text>
                        {section.isBig && <Text style={styles.bigButtonSub}>{section.description}</Text>}
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    content: { padding: 24, flexGrow: 1 },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 24,
        gap: 16,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    avatar: { width: 56, height: 56, borderRadius: 18, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' },
    greeting: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
    role: { fontSize: 13, color: '#64748b' },

    grid: { gap: 20, flex: 1 },
    bigButton: {
        flex: 2,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#3b82f6',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 }
    },
    bigButtonText: { color: 'white', fontSize: 28, fontWeight: '900', marginTop: 16 },
    bigButtonSub: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: '600', marginTop: 4 },

    smallButton: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        gap: 8
    },
    smallButtonText: { fontSize: 18, fontWeight: '700', color: '#334155' }
});
