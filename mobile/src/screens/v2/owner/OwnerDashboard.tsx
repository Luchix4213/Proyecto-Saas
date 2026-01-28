import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme, ActivityIndicator, Surface, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AestheticHeader } from '../../../components/v2/AestheticHeader';
import { reportsService, DashboardStats } from '../../../api/reportsService';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Users,
  Plus,
  ChevronRight,
  AlertCircle,
  BarChart3,
  Store,
  Wallet
} from 'lucide-react-native';

export const OwnerDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const theme = useTheme();
  const navigation = useNavigation<any>();

  const fetchStats = async () => {
    try {
      const data = await reportsService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchStats();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
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
      <AestheticHeader subtitle="Buenos días," />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      >
        {/* Main Banner / Big Insight */}
        <Surface style={styles.mainBanner} elevation={0}>
            <View>
                <Text style={styles.bannerLabel}>Ventas de Hoy</Text>
                <Text style={styles.bannerValue}>${stats?.ventasHoy?.toLocaleString() || '0'}</Text>
                <View style={styles.trendBadge}>
                    <TrendingUp size={14} color="#16a34a" />
                    <Text style={styles.trendText}>+{stats?.porcentajeVariacion || '0'}% vs ayer</Text>
                </View>
            </View>
            <View style={styles.bannerIconBox}>
                <BarChart3 size={40} color="white" />
            </View>
        </Surface>

        {/* Bento Grid Stats */}
        <View style={styles.bentoGrid}>
            <Surface style={[styles.bentoBox, { flex: 1 }]} elevation={1}>
                <View style={[styles.bentoIcon, { backgroundColor: '#f0f9ff' }]}>
                    <ShoppingBag size={20} color="#0284c7" />
                </View>
                <Text style={styles.bentoValue}>{stats?.pedidosHoy || 0}</Text>
                <Text style={styles.bentoLabel}>Pedidos</Text>
            </Surface>

            <Surface style={[styles.bentoBox, { flex: 1.2 }]} elevation={1}>
                {stats?.productosBajoStock && stats.productosBajoStock > 0 ? (
                    <>
                        <View style={[styles.bentoIcon, { backgroundColor: '#fef2f2' }]}>
                           <AlertCircle size={20} color="#ef4444" />
                        </View>
                        <Text style={[styles.bentoValue, { color: '#ef4444' }]}>{stats.productosBajoStock}</Text>
                        <Text style={styles.bentoLabel}>Stock Crítico</Text>
                    </>
                ) : (
                    <>
                        <View style={[styles.bentoIcon, { backgroundColor: '#f0fdf4' }]}>
                           <Package size={20} color="#22c55e" />
                        </View>
                        <Text style={styles.bentoValue}>Óptimo</Text>
                        <Text style={styles.bentoLabel}>Estado de Stock</Text>
                    </>
                )}
            </Surface>
        </View>

        {/* Quick Actions - Modern Row */}
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <View style={styles.actionGrid}>
            {[
                { label: 'Producto', icon: Plus, screen: 'ProductForm', color: '#6366f1' },
                { label: 'Compra', icon: Store, screen: 'PurchaseForm', color: '#10b981' },
                { label: 'Reportes', icon: Wallet, screen: 'StaffPerformance', color: '#f59e0b' },
                { label: 'Clientes', icon: Users, screen: null, color: '#ec4899' },
            ].map((action, i) => (
                <TouchableOpacity
                    key={i}
                    style={styles.actionItem}
                    onPress={() => action.screen && navigation.navigate(action.screen)}
                >
                    <Surface style={styles.actionIconBox} elevation={1}>
                        <action.icon size={22} color={action.color} />
                    </Surface>
                    <Text style={styles.actionLabel}>{action.label}</Text>
                </TouchableOpacity>
            ))}
        </View>

        {/* Shortcuts / Navigation */}
        <View style={styles.shortcuts}>
            <TouchableOpacity
                style={styles.shortcutItem}
                onPress={() => navigation.navigate('Inventory')}
            >
                <View style={styles.shortcutContent}>
                    <View style={[styles.shortcutIcon, { backgroundColor: '#1e293b' }]}>
                        <Package size={18} color="white" />
                    </View>
                    <View>
                        <Text style={styles.shortcutTitle}>Inventario Completo</Text>
                        <Text style={styles.shortcutSub}>Gestionar precios y stock</Text>
                    </View>
                </View>
                <ChevronRight size={20} color="#cbd5e1" />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.shortcutItem}
                onPress={() => navigation.navigate('Sales')}
            >
                <View style={styles.shortcutContent}>
                    <View style={[styles.shortcutIcon, { backgroundColor: '#334155' }]}>
                        <ShoppingBag size={18} color="white" />
                    </View>
                    <View>
                        <Text style={styles.shortcutTitle}>Historial de Ventas</Text>
                        <Text style={styles.shortcutSub}>Ver tickets y devoluciones</Text>
                    </View>
                </View>
                <ChevronRight size={20} color="#cbd5e1" />
            </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  scrollContent: { padding: 20 },
  mainBanner: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  bannerLabel: { color: '#94a3b8', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  bannerValue: { color: 'white', fontSize: 32, fontWeight: '900' },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14532d',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'flex-start'
  },
  trendText: { color: '#4ade80', fontSize: 11, fontWeight: 'bold', marginLeft: 4 },
  bannerIconBox: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 16 },
  bentoGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  bentoBox: { backgroundColor: 'white', borderRadius: 20, padding: 16, minHeight: 120, justifyContent: 'space-between' },
  bentoIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  bentoValue: { fontSize: 22, fontWeight: '800', color: '#1e293b', marginTop: 8 },
  bentoLabel: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginBottom: 16 },
  actionGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  actionItem: { alignItems: 'center', width: '22%' },
  actionIconBox: { width: 52, height: 52, borderRadius: 16, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionLabel: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  shortcuts: { gap: 12 },
  shortcutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  shortcutContent: { flexDirection: 'row', alignItems: 'center' },
  shortcutIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  shortcutTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  shortcutSub: { fontSize: 12, color: '#94a3b8' }
});

