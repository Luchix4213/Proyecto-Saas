import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { Text, useTheme, Surface, Avatar, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../../store/authStore';
import { adminService } from '../../../api/adminService';
import { AestheticHeader } from '../../../components/v2/AestheticHeader';
import {
  Users,
  Building2,
  CreditCard,
  ShieldAlert,
  LogOut,
  TrendingUp,
  DollarSign,
  Activity,
  ChevronRight,
  Server
} from 'lucide-react-native';

export const AdminDashboard = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const loadStats = async () => {
    try {
        const data = await adminService.getDashboardStats();
        setStats(data);
    } catch (error) {
        console.error('Error loading admin stats:', error);
    } finally {
        setLoading(false);
        setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadStats();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AestheticHeader subtitle={`Bienvenido, ${user?.nombre_completo?.split(' ')[0] || 'Admin'}`} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
      >
        {/* Main Banner - MRR */}
        <Surface style={styles.mainBanner} elevation={0}>
            <View>
                <Text style={styles.bannerLabel}>MRR Estimado</Text>
                <Text style={styles.bannerValue}>${stats?.mrr_estimated?.toLocaleString() || '0'}</Text>
                <View style={styles.trendBadge}>
                    <TrendingUp size={14} color="#16a34a" />
                    <Text style={styles.trendText}>+12.5% vs mes anterior</Text>
                </View>
            </View>
            <View style={styles.bannerIconBox}>
                <DollarSign size={40} color="white" />
            </View>
        </Surface>

        {/* Bento Grid Stats */}
        <View style={styles.bentoGrid}>
            <Surface style={[styles.bentoBox, { flex: 1.2 }]} elevation={1}>
                 <View style={[styles.bentoIcon, { backgroundColor: '#eff6ff' }]}>
                    <Building2 size={24} color="#3b82f6" />
                </View>
                <Text style={styles.bentoValue}>{stats?.total_tenants || 0}</Text>
                <Text style={styles.bentoLabel}>Empresas Activas</Text>
            </Surface>

            <Surface style={[styles.bentoBox, { flex: 1 }]} elevation={1}>
                <View style={[styles.bentoIcon, { backgroundColor: '#f0fdf4' }]}>
                    <Users size={24} color="#16a34a" />
                </View>
                <Text style={styles.bentoValue}>{stats?.total_users || 0}</Text>
                <Text style={styles.bentoLabel}>Usuarios Totales</Text>
            </Surface>
        </View>

        <Surface style={styles.wideBentoBox} elevation={1}>
             <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[styles.bentoIcon, { backgroundColor: '#f5f3ff' }]}>
                    <ShieldAlert size={24} color="#8b5cf6" />
                </View>
                <View>
                    <Text style={styles.bentoValue}>{stats?.active_alerts || 0}</Text>
                    <Text style={styles.bentoLabel}>Alertas del Sistema</Text>
                </View>
             </View>
             <ChevronRight size={20} color="#94a3b8" />
        </Surface>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Gestión Global</Text>
        <View style={styles.actionGrid}>
             {[
                { label: 'Empresas', icon: Building2, screen: 'Tenants', color: '#3b82f6' },
                { label: 'Usuarios', icon: Users, screen: 'GlobalUsers', color: '#10b981' },
                { label: 'Planes', icon: CreditCard, screen: 'Plans', color: '#8b5cf6' },
                { label: 'Logs', icon: Activity, screen: 'Audit', color: '#f59e0b' },
            ].map((action, i) => (
                <TouchableOpacity
                    key={i}
                    style={styles.actionItem}
                    onPress={() => navigation.navigate(action.screen)}
                >
                    <Surface style={styles.actionIconBox} elevation={1}>
                        <action.icon size={24} color={action.color} />
                    </Surface>
                    <Text style={styles.actionLabel}>{action.label}</Text>
                </TouchableOpacity>
            ))}
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Actividad Reciente</Text>
        <Surface style={styles.activityCard} elevation={1}>
             {stats?.activity_log?.length > 0 ? (
                 stats.activity_log.map((log: any, i: number) => (
                    <View key={i} style={styles.activityItem}>
                        <View style={styles.timelineContainer}>
                            <View style={styles.timelineDot} />
                            {i !== stats.activity_log.length - 1 && <View style={styles.timelineLine} />}
                        </View>
                        <View style={styles.activityContent}>
                           <Text style={styles.activityText}>
                                <Text style={{ fontWeight: '700' }}>{log.action}</Text>: {log.target}
                           </Text>
                           <Text style={styles.activityTime}>{new Date(log.created_at).toLocaleString()}</Text>
                        </View>
                    </View>
                 ))
             ) : (
                 <View style={{ padding: 30, alignItems: 'center', gap: 10 }}>
                     <Server size={40} color="#cbd5e1" />
                     <Text style={{ textAlign: 'center', color: '#94a3b8' }}>No hay actividad reciente registrada</Text>
                 </View>
             )}
        </Surface>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  scrollContent: { padding: 20, paddingTop: 10 },

  // Banner
  mainBanner: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  bannerLabel: { color: '#94a3b8', fontSize: 13, fontWeight: '600', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  bannerValue: { color: 'white', fontSize: 32, fontWeight: '900' },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 163, 74, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'flex-start'
  },
  trendText: { color: '#4ade80', fontSize: 11, fontWeight: 'bold', marginLeft: 4 },
  bannerIconBox: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 16 },

  // Bento Grid
  bentoGrid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  bentoBox: { backgroundColor: 'white', borderRadius: 20, padding: 16, minHeight: 110, justifyContent: 'space-between' },
  wideBentoBox: { backgroundColor: 'white', borderRadius: 20, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  bentoIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  bentoValue: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  bentoLabel: { fontSize: 12, color: '#64748b', fontWeight: '600' },

  // Actions
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginBottom: 16 },
  actionGrid: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
  actionItem: { width: '22%', alignItems: 'center', gap: 8 },
  actionIconBox: { width: 56, height: 56, borderRadius: 20, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  actionLabel: { fontSize: 12, fontWeight: '600', color: '#475569', textAlign: 'center' },

  // Activity
  activityCard: { backgroundColor: 'white', borderRadius: 24, padding: 20, paddingBottom: 8 },
  activityItem: { flexDirection: 'row', gap: 12, marginBottom: 0 },
  timelineContainer: { alignItems: 'center', width: 20 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#3b82f6', marginTop: 6, borderWidth: 2, borderColor: '#dbeafe' },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#f1f5f9', marginVertical: 4 },
  activityContent: { flex: 1, paddingBottom: 24 },
  activityText: { fontSize: 14, color: '#334155', lineHeight: 20 },
  activityTime: { fontSize: 11, color: '#94a3b8', marginTop: 4 }
});
