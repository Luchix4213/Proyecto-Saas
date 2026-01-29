import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface, Button, Switch, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Edit2, CheckCircle2, Crown, Star, Plus } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AestheticHeader } from '../..//components/v2/AestheticHeader';
import { planesService, Plan } from '../..//api/planesService';

export const PlansScreen = () => {
    const navigation = useNavigation<any>();
    const theme = useTheme();

    const [plans, setPlans] = React.useState<Plan[]>([]);
    const [loading, setLoading] = React.useState(true);

    const loadPlans = async () => {
        try {
            setLoading(true);
            const data = await planesService.getPlanes();
            setPlans(data);
        } catch (error) {
            console.error('Error fetching planes', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            loadPlans();
        }, [])
    );

    const toggleStatus = async (plan: Plan) => {
        try {
            const newStatus = plan.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
            setPlans(prev => prev.map(p => p.plan_id === plan.plan_id ? { ...p, estado: newStatus } : p)); // Optimistic
            await planesService.updatePlan(plan.plan_id, { estado: newStatus });
        } catch (error) {
            console.error('Error updating plan status', error);
            loadPlans(); // Revert
        }
    };

    const PlanCard = ({ plan }: { plan: Plan }) => {
        const isPro = plan.nombre_plan.toLowerCase().includes('pro') || plan.precio_mensual > 0;
        const mainColor = isPro ? '#4f46e5' : '#64748b';
        const bgHeader = isPro ? '#e0e7ff' : '#f1f5f9';

        return (
            <Surface elevation={1} style={styles.card}>
                <View style={[styles.cardHeader, { backgroundColor: bgHeader }]}>
                    <View>
                         <Text style={[styles.planName, { color: mainColor }]}>{plan.nombre_plan}</Text>
                         <Text style={styles.planStatus}>{plan.estado}</Text>
                    </View>
                    <Switch
                        value={plan.estado === 'ACTIVO'}
                        onValueChange={() => toggleStatus(plan)}
                        color={mainColor}
                        trackColor={{ false: '#e2e8f0', true: isPro ? '#c7d2fe' : '#cbd5e1' }}
                    />
                </View>

                <View style={styles.cardContent}>
                    <View style={styles.priceContainer}>
                        <Text style={styles.currency}>$</Text>
                        <Text style={styles.price}>{plan.precio_mensual}</Text>
                        <Text style={styles.period}>/mes</Text>
                    </View>

                    <View style={styles.features}>
                        <View style={styles.featureItem}>
                            <CheckCircle2 size={16} color={mainColor} />
                            <Text style={styles.featureText}>{plan.max_usuarios} Usuarios</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <CheckCircle2 size={16} color={mainColor} />
                            <Text style={styles.featureText}>{plan.max_productos} Productos</Text>
                        </View>
                        {plan.ventas_online && (
                             <View style={styles.featureItem}>
                                <Star size={16} color="#eab308" fill="#eab308" />
                                <Text style={[styles.featureText, { color: '#ca8a04', fontWeight: '600' }]}>Ventas Online</Text>
                            </View>
                        )}
                        {plan.reportes_avanzados && (
                             <View style={styles.featureItem}>
                                <Crown size={16} color="#7c3aed" />
                                <Text style={[styles.featureText, { color: '#7c3aed', fontWeight: '600' }]}>Reportes Avanzados</Text>
                            </View>
                        )}
                    </View>

                    <Button
                        mode="outlined"
                        onPress={() => navigation.navigate('PlanForm', { plan })}
                        style={[styles.editBtn, { borderColor: mainColor }]}
                        labelStyle={{ color: mainColor, fontWeight: '700' }}
                        icon={() => <Edit2 size={16} color={mainColor} />}
                    >
                        Editar Límites
                    </Button>
                </View>
            </Surface>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
             <AestheticHeader title="Planes SaaS" subtitle="Gestión de Suscripciones" />

             <View style={styles.actionRow}>
                <Button
                    mode="contained"
                    icon={() => <Plus size={20} color="white" />}
                    onPress={() => navigation.navigate('PlanForm')}
                    style={styles.newBtn}
                    labelStyle={styles.newBtnLabel}
                >
                    Nuevo Plan
                </Button>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {plans.map((plan) => (
                    <PlanCard key={plan.plan_id} plan={plan} />
                ))}
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    actionRow: { paddingHorizontal: 20, paddingBottom: 10, alignItems: 'flex-end' },
    newBtn: { borderRadius: 12, backgroundColor: '#0f172a' },
    newBtnLabel: { fontWeight: '700', fontSize: 13 },
    scrollContent: { padding: 20, paddingTop: 0 },
    card: {
        backgroundColor: 'white',
        borderRadius: 20,
        marginBottom: 20,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    planName: { fontSize: 18, fontWeight: '900' },
    planStatus: { fontSize: 10, color: '#64748b', fontWeight: '600', marginTop: 2 },
    cardContent: { padding: 20 },
    priceContainer: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
    currency: { fontSize: 16, fontWeight: '600', color: '#0f172a', marginTop: 4 },
    price: { fontSize: 36, fontWeight: '900', color: '#0f172a', lineHeight: 40 },
    period: { fontSize: 13, color: '#64748b', marginTop: 18, marginLeft: 4, fontWeight: '500' },
    features: { gap: 10, marginBottom: 24 },
    featureItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    featureText: { fontSize: 14, color: '#334155', fontWeight: '500' },
    editBtn: { borderRadius: 12, borderWidth: 1 }
});
