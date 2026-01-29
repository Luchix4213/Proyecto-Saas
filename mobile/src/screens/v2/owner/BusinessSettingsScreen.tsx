import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Alert, StyleSheet } from 'react-native';
import { Text, TextInput, Button, Surface, useTheme, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Camera, Save, MapPin, Phone, Mail, Store } from 'lucide-react-native';
import { tenantsService, Tenant } from '../../../api/tenantsService';
import * as ImagePicker from 'expo-image-picker';
import { getApiImageUrl } from '../../../utils/imageUtils';
import { AestheticHeader } from '../../../components/v2/AestheticHeader';

export const BusinessSettingsScreen = () => {
    const theme = useTheme();

    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [businessName, setBusinessName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState('');
    const [logo, setLogo] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useFocusEffect(
        React.useCallback(() => {
            fetchSettings();
        }, [])
    );

    const fetchSettings = async () => {
        try {
            const data = await tenantsService.getMyTenant();
            setTenant(data);
            setBusinessName(data.nombre_empresa || '');
            setPhone(data.telefono || '');
            setAddress(data.direccion || '');
            setEmail(data.email || '');

            if (data.logo_url) {
                setLogo(getApiImageUrl(data.logo_url));
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'No se pudo cargar la configuración');
        } finally {
            setFetching(false);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.5,
        });

        if (!result.canceled) {
          setLogo(result.assets[0].uri);
        }
    };

    const [qrPago, setQrPago] = useState<string | null>(null);

    const pickQrImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.5,
        });

        if (!result.canceled) {
          setQrPago(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!tenant) return;
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('nombre_empresa', businessName);
            formData.append('telefono', phone);
            formData.append('direccion', address);

            if (logo && !logo.startsWith('http')) {
                 const filename = logo.split('/').pop();
                 const match = /\.(\w+)$/.exec(filename || '');
                 const type = match ? `image/${match[1]}` : `image/jpeg`;
                 // @ts-ignore
                 formData.append('logo', { uri: logo, name: filename || 'logo.jpg', type });
            }

            if (qrPago && !qrPago.startsWith('http')) {
                const filename = qrPago.split('/').pop();
                const match = /\.(\w+)$/.exec(filename || '');
                const type = match ? `image/${match[1]}` : `image/jpeg`;
                // @ts-ignore
                formData.append('qr_pago', { uri: qrPago, name: filename || 'qr.jpg', type });
            }

            await tenantsService.updateTenant(tenant.tenant_id, formData);
            Alert.alert('✓ Guardado', 'Configuración actualizada correctamente');
            fetchSettings();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'No se pudo guardar la configuración');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <AestheticHeader
                title="Mi Negocio"
                subtitle="Configuración"
            />

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Logo & Business Name */}
                <Surface style={styles.mainCard} elevation={1}>
                    <View style={styles.logoSection}>
                        <TouchableOpacity
                            onPress={pickImage}
                            style={styles.logoContainer}
                        >
                            {logo ? (
                                <Image source={{ uri: logo }} style={styles.logoImage} />
                            ) : (
                                <View style={styles.logoPlaceholder}>
                                    <Camera size={32} color="#cbd5e1" />
                                </View>
                            )}
                        </TouchableOpacity>
                        <Text style={styles.logoHint}>Logo del Negocio</Text>
                    </View>

                    <View style={styles.inputContainer}>
                        <View style={styles.inputIconWrapper}>
                            <Store size={18} color="#64748b" />
                        </View>
                        <TextInput
                            label="Nombre del Negocio"
                            mode="outlined"
                            value={businessName}
                            onChangeText={setBusinessName}
                            style={styles.input}
                            outlineStyle={styles.inputOutline}
                            textColor='#0f172a'
                        />
                    </View>
                </Surface>

                {/* QR Pago Section */}
                <Text style={styles.sectionTitle}>Cobro QR</Text>
                <Surface style={styles.card} elevation={1}>
                    <View style={{ alignItems: 'center' }}>
                        <TouchableOpacity
                            onPress={pickQrImage}
                            style={styles.qrContainer}
                        >
                            {qrPago ? (
                                <Image source={{ uri: qrPago }} style={styles.qrImage} />
                            ) : (
                                <View style={styles.qrPlaceholder}>
                                    <Camera size={32} color="#cbd5e1" />
                                    <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>Subir QR de Pago</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        <Text style={styles.logoHint}>Toca para subir tu QR</Text>
                    </View>
                </Surface>

                {/* Contact Info */}
                <Text style={styles.sectionTitle}>Información de Contacto</Text>

                <Surface style={styles.card} elevation={1}>
                    <View style={styles.inputGroup}>
                        <View style={styles.inputIconWrapper}>
                            <MapPin size={18} color="#64748b" />
                        </View>
                        <TextInput
                            label="Dirección"
                            mode="outlined"
                            value={address}
                            onChangeText={setAddress}
                            placeholder="Ej. Av. Principal #123"
                            style={styles.input}
                            outlineStyle={styles.inputOutline}
                            textColor='#0f172a'
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <View style={styles.inputIconWrapper}>
                            <Phone size={18} color="#64748b" />
                        </View>
                        <TextInput
                            label="Teléfono"
                            mode="outlined"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            style={styles.input}
                            outlineStyle={styles.inputOutline}
                            textColor='#0f172a'
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <View style={styles.inputIconWrapper}>
                            <Mail size={18} color="#94a3b8" />
                        </View>
                        <TextInput
                            label="Email"
                            mode="outlined"
                            value={email}
                            disabled
                            style={[styles.input, styles.disabledInput]}
                            outlineStyle={{ borderRadius: 12, borderColor: 'transparent' }}
                            textColor='#94a3b8'
                        />
                    </View>
                    <Text style={styles.helperText}>El email no se puede modificar</Text>
                </Surface>

                {/* Save Button */}
                <Button
                    mode="contained"
                    onPress={handleSave}
                    loading={loading}
                    style={styles.saveButton}
                    labelStyle={styles.saveButtonLabel}
                    buttonColor={theme.colors.primary}
                    icon={({size, color}) => <Save size={size} color={color} />}
                >
                    Guardar Cambios
                </Button>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc'
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40
    },
    mainCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 24,
        marginBottom: 24
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 24
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        overflow: 'hidden',
        backgroundColor: '#f8fafc',
        borderWidth: 3,
        borderColor: '#e2e8f0',
        justifyContent: 'center',
        alignItems: 'center'
    },
    logoImage: {
        width: '100%',
        height: '100%'
    },
    logoPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    logoHint: {
        marginTop: 12,
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '600'
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#0f172a',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 20,
        marginBottom: 24
    },
    inputContainer: {
        marginBottom: 0
    },
    inputGroup: {
        marginBottom: 16
    },
    inputIconWrapper: {
        position: 'absolute',
        left: 12,
        top: 24,
        zIndex: 1
    },
    input: {
        backgroundColor: 'white',
        paddingLeft: 32
    },
    inputOutline: {
        borderRadius: 12,
        borderColor: '#e2e8f0'
    },
    disabledInput: {
        backgroundColor: '#f8fafc'
    },
    helperText: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: -8,
        marginLeft: 12
    },
    saveButton: {
        borderRadius: 16,
        paddingVertical: 6
    },
    saveButtonLabel: {
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.5
    },
    qrContainer: {
        width: '100%',
        height: 200,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#f8fafc',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center'
    },
    qrImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain'
    },
    qrPlaceholder: {
        alignItems: 'center'
    }
});
