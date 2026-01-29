import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, Button, Avatar, List, Divider, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, MapPin, Settings, LogOut, CreditCard, Bell } from 'lucide-react-native';
import { storageUtils } from '../../../utils/storageUtils';
import { useNavigation } from '@react-navigation/native';
import { AestheticHeader } from '../../../components/v2/AestheticHeader';

export const MyProfileScreen = () => {
    const navigation = useNavigation<any>();
    const theme = useTheme();
    const [clientData, setClientData] = React.useState<any>(null);

    React.useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        const data = await storageUtils.getClientData();
        setClientData(data);
    };

    const handleLogout = async () => {
        // Clear everything
        await storageUtils.clearAuth();
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <AestheticHeader title="Mi Perfil" subtitle="Gestiona tu cuenta" />

            <ScrollView contentContainerStyle={styles.content}>

                {/* ID Card */}
                <Surface style={styles.profileCard} elevation={2}>
                    <View style={styles.avatarSection}>
                        <Avatar.Text
                            size={60}
                            label={clientData?.nombre_completo?.charAt(0) || "I"}
                            style={{ backgroundColor: theme.colors.primary }}
                        />
                        <View style={{ marginLeft: 16 }}>
                            <Text style={styles.userName}>{clientData?.nombre_completo || "Invitado"}</Text>
                            <Text style={styles.userRole}>
                                {clientData ? `NIT/CI: ${clientData.nit_ci}` : "Compra para registrarte"}
                            </Text>
                        </View>
                    </View>
                </Surface>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Cuenta</Text>
                    <Surface style={styles.menuCard} elevation={1}>
                        <List.Item
                            title="Mis Direcciones"
                            description={clientData?.direccion || "No hay dirección guardada"}
                            left={() => <MapPin size={20} color="#64748b" />}
                            right={() => <List.Icon icon="chevron-right" />}
                            onPress={() => {}}
                        />
                        <Divider />
                        <List.Item
                            title="Métodos de Pago"
                            left={() => <CreditCard size={20} color="#64748b" />}
                            right={() => <List.Icon icon="chevron-right" />}
                            onPress={() => {}}
                        />
                         <Divider />
                        <List.Item
                            title="Notificaciones"
                            left={() => <Bell size={20} color="#64748b" />}
                            right={() => <List.Icon icon="chevron-right" />}
                            onPress={() => {}}
                        />
                    </Surface>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>General</Text>
                    <Surface style={styles.menuCard} elevation={1}>
                        <List.Item
                            title="Configuración"
                            left={() => <Settings size={20} color="#64748b" />}
                            right={() => <List.Icon icon="chevron-right" />}
                            onPress={() => {}}
                        />
                        <Divider />
                        <List.Item
                            title="Cerrar Sesión"
                            titleStyle={{ color: '#ef4444' }}
                            left={() => <LogOut size={20} color="#ef4444" />}
                            onPress={handleLogout}
                        />
                    </Surface>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    content: { padding: 20 },
    profileCard: { backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 24 },
    avatarSection: { flexDirection: 'row', alignItems: 'center' },
    userName: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
    userRole: { fontSize: 14, color: '#64748b' },

    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 12, marginLeft: 4 },
    menuCard: { backgroundColor: 'white', borderRadius: 16, overflow: 'hidden' }
});
