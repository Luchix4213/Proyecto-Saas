import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Text, Surface, ProgressBar, useTheme, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Crown, Check, Zap, AlertCircle } from 'lucide-react-native';
import { AestheticHeader } from '../..//components/v2/AestheticHeader';
import { suscripcionesService, Suscripcion } from '../..//api/suscripcionesService';
import { planesService, Plan } from '../..//api/planesService';
import { useAuthStore } from '../..//store/authStore';

export const SubscriptionScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const { user } = useAuthStore();

    const [currentSubscription, setCurrentSubscription] = useState<Suscripcion | null>(null);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const [subsData, plansData] = await Promise.all([
                suscripcionesService.getMySubscriptions(),
                planesService.getPlanes()
            ]);

            // Find an active subscription effectively
            // Depending on backend, we could check for 'ACTIVA' or sort by date
            const activeSub = subsData.find(s => s.estado === 'ACTIVA' || s.estado === 'PENDIENTE') || null;
            setCurrentSubscription(activeSub);

            // Sort plans by price
            const sortedPlans = plansData.sort((a, b) => a.precio_mensual - b.precio_mensual);
            setPlans(sortedPlans);
        } catch (error) {
            console.error(error);
            // Silent error on refresh, but log
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchData();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleUpgrade = (plan: Plan) => {
        Alert.alert(
            'Mejorar mi Plan',
            `¿Confirmas la solicitud de cambio al plan ${plan.nombre_plan}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    style: 'default',
                    onPress: async () => {
                        try {
                            if (!user?.tenant_id) return;
                            await suscripcionesService.requestUpgrade(plan.plan_id, user.tenant_id);
                            Alert.alert('¡Solicitud Enviada!', 'Estamos procesando tu solicitud.');
                            fetchData();
                        } catch(error) {
                            Alert.alert('Error', 'No se pudo procesar la solicitud');
                        }
                    }
                }
            ]
        );
    };

    if (loading && !refreshing) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#64748b' }}>Cargando planes...</Text>
            </SafeAreaView>
        );
    }

    const currentPlanId = currentSubscription?.plan_id;
    // Fallback for usage if backend doesn't provide it directly in "suscripcion" object yet
    // Typically backend should return "current_usage" in the subscription response
    const usage = {
        products: { current: 0, max: currentSubscription?.plan?.max_productos || 100 },
        users: { current: 1, max: currentSubscription?.plan?.max_usuarios || 1 }
    };

    // Calculate progress color
    const getProgressColor = (current: number, max: number) => {
        const ratio = max > 0 ? current / max : 0;
        if (ratio > 0.9) return '#ef4444'; // Red
        if (ratio > 0.7) return '#f59e0b'; // Amber
        return '#22c55e'; // Green
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }} edges={['top']}>
            {/* Reusing AestheticHeader for consistency but customizing subtitle */}
            <AestheticHeader
                title="Suscripción"
                subtitle="Gestionar Plan"
                onNotificationsPress={() => Alert.alert('Info', 'Sin notificaciones de facturación')}
            />

            <ScrollView
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
            >

                {/* Current Plan Card - Premium Dark Style */}
                {currentSubscription ? (
                    <Surface style={{ borderRadius: 24, padding: 24, backgroundColor: '#0f172a', marginBottom: 32 }} elevation={4}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                            <View>
                                <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                                    Plan Actual {currentSubscription.estado === 'PENDIENTE' && '(Pendiente)'}
                                </Text>
                                <Text style={{ color: 'white', fontSize: 32, fontWeight: '900' }}>{currentSubscription.plan?.nombre_plan || 'Desconocido'}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: currentSubscription.estado === 'ACTIVA' ? '#4ade80' : '#f59e0b', marginRight: 6 }} />
                                    <Text style={{ color: '#cbd5e1', fontSize: 13, fontWeight: '600' }}>
                                        {currentSubscription.estado === 'ACTIVA' ? 'Suscripción Activa' : 'Solicitud en revisión'}
                                    </Text>
                                </View>
                            </View>
                            <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 16 }}>
                                <Crown size={32} color="#fbbf24" />
                            </View>
                        </View>

                        {/* Usage Bars - Only show if active to avoid confusion */}
                        {currentSubscription.estado === 'ACTIVA' && (
                            <View style={{ gap: 20 }}>
                                <View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <Text style={{ color: 'white', fontWeight: '600' }}>Límite de Productos</Text>
                                        <Text style={{ color: '#cbd5e1', fontWeight: '700' }}>{usage.products.max}</Text>
                                    </View>
                                    <ProgressBar
                                        progress={Math.min(usage.products.current / usage.products.max, 1)}
                                        color={getProgressColor(usage.products.current, usage.products.max)}
                                        style={{ borderRadius: 4, height: 8, backgroundColor: '#1e293b' }}
                                    />
                                </View>

                                <View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <Text style={{ color: 'white', fontWeight: '600' }}>Límite de Usuarios</Text>
                                        <Text style={{ color: '#cbd5e1', fontWeight: '700' }}>{usage.users.max}</Text>
                                    </View>
                                    <ProgressBar
                                        progress={Math.min(usage.users.current / usage.users.max, 1)}
                                        color={getProgressColor(usage.users.current, usage.users.max)}
                                        style={{ borderRadius: 4, height: 8, backgroundColor: '#1e293b' }}
                                    />
                                </View>
                            </View>
                        )}
                    </Surface>
                ) : (
                    <Surface style={{ borderRadius: 24, padding: 24, backgroundColor: '#fff7ed', marginBottom: 32 }} elevation={0}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <AlertCircle size={24} color="#ea580c" />
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 16, fontWeight: '800', color: '#9a3412' }}>Sin Suscripción Activa</Text>
                                <Text style={{ fontSize: 13, color: '#c2410c' }}>Tu negocio necesita un plan para operar.</Text>
                            </View>
                        </View>
                    </Surface>
                )}

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                    <Zap size={20} color="#f59e0b" style={{ marginRight: 8 }} />
                    <Text style={{ fontSize: 18, fontWeight: '800', color: '#1e293b' }}>Planes Disponibles</Text>
                </View>

                {/* Plan Options */}
                <View style={{ gap: 16 }}>
                    {plans.map((plan) => {
                        const isCurrent = plan.plan_id === currentPlanId;
                        return (
                            <Surface
                                key={plan.plan_id}
                                elevation={isCurrent ? 4 : 1}
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: 24,
                                    padding: 6,
                                    borderWidth: isCurrent ? 2 : 0,
                                    borderColor: theme.colors.primary
                                }}
                            >
                                <View style={{ padding: 18 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                        <View>
                                            <Text style={{ fontSize: 18, fontWeight: '900', color: '#0f172a' }}>{plan.nombre_plan}</Text>
                                            <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Licencia SaaS</Text>
                                        </View>
                                        <View style={{ alignItems: 'flex-end' }}>
                                            <Text style={{ fontSize: 24, fontWeight: '900', color: theme.colors.primary }}>${plan.precio_mensual}</Text>
                                            <Text style={{ fontSize: 11, color: '#94a3b8', fontWeight: '600' }}>/mes</Text>
                                        </View>
                                    </View>

                                    <View style={{ height: 1, backgroundColor: '#f1f5f9', marginBottom: 16 }} />

                                    <View style={{ gap: 10, marginBottom: 16 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                            <Check size={16} color="#10b981" />
                                            <Text style={{ fontSize: 14, color: '#334155', fontWeight: '500' }}>Hasta {(plan.max_productos || 0).toLocaleString()} productos</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                            <Check size={16} color="#10b981" />
                                            <Text style={{ fontSize: 14, color: '#334155', fontWeight: '500' }}>Hasta {plan.max_usuarios || 0} usuarios</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                            <Check size={16} color="#10b981" />
                                            <Text style={{ fontSize: 14, color: '#334155', fontWeight: '500' }}>{plan.ventas_online ? 'Ventas Online Incluidas' : 'Solo Ventas Físicas'}</Text>
                                        </View>
                                    </View>

                                    {!isCurrent && (
                                        <Button
                                            mode="contained"
                                            onPress={() => handleUpgrade(plan)}
                                            style={{ borderRadius: 12, backgroundColor: '#f8fafc' }}
                                            labelStyle={{ color: '#0f172a', fontWeight: '800', fontSize: 13 }}
                                            contentStyle={{ height: 44 }}
                                        >
                                            Solicitar Cambio
                                        </Button>
                                    )}
                                     {isCurrent && (
                                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 10, backgroundColor: '#f0fdf4', borderRadius: 12 }}>
                                             <Check size={16} color="#16a34a" style={{ marginRight: 6 }} />
                                             <Text style={{ color: '#166534', fontWeight: '800', fontSize: 13 }}>Tu Plan Actual</Text>
                                        </View>
                                    )}
                                </View>
                            </Surface>
                        );
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};
