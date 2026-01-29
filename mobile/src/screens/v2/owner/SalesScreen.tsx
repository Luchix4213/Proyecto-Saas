import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, useTheme, ActivityIndicator, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AestheticHeader } from '../../../components/v2/AestheticHeader';
import { salesService, Venta } from '../../../api/salesService';
import { Receipt, Calendar, User, ChevronRight, DollarSign, Wallet } from 'lucide-react-native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const SalesScreen = () => {
  const [sales, setSales] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'week'>('all');

  const theme = useTheme();

  useEffect(() => {
    fetchSales();
  }, [filter]);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const data = await salesService.getAll();
      setSales(data);
    } catch (error) {
      console.error('Error fetching sales', error);
    } finally {
      setLoading(false);
    }
  };

  const renderSaleItem = ({ item }: { item: Venta }) => (
    <Surface style={styles.card} elevation={1}>
      <TouchableOpacity style={styles.touchable}>
        <View style={styles.headerRow}>
          <View style={styles.idGroup}>
            <View style={styles.iconBox}>
              <Receipt size={20} color={theme.colors.primary} />
            </View>
            <View>
              <Text style={styles.saleId}>Venta #{item.venta_id}</Text>
              <Text style={styles.dateText}>
                {(() => {
                  const date = new Date(item.fecha_venta);
                  return isNaN(date.getTime())
                    ? 'Fecha inválida'
                    : format(date, "HH:mm ' - ' d MMM", { locale: es });
                })()}
              </Text>
            </View>
          </View>
          <Text style={styles.totalValue}>${item.total.toLocaleString()}</Text>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.clientInfo}>
            <User size={14} color="#64748b" />
            <Text style={styles.clientName} numberOfLines={1}>
              {item.cliente?.nombre || 'Consumidor Final'}
            </Text>
          </View>
          <View style={[styles.paymentBadge, {
            backgroundColor: item.metodo_pago === 'EFECTIVO' ? '#f0fdf4' : '#eff6ff'
          }]}>
            <Wallet size={10} color={item.metodo_pago === 'EFECTIVO' ? '#16a34a' : '#2563eb'} />
            <Text style={[styles.paymentText, {
              color: item.metodo_pago === 'EFECTIVO' ? '#16a34a' : '#2563eb'
            }]}>
              {item.metodo_pago}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Surface>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AestheticHeader title="Ventas" subtitle="Historial Transaccional" />

      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <Chip
            selected={filter === 'all'}
            onPress={() => setFilter('all')}
            style={[styles.chip, filter === 'all' && styles.activeChip]}
            textStyle={[styles.chipText, filter === 'all' && styles.activeChipText]}
            showSelectedOverlay
          >
            Todas
          </Chip>
          <Chip
            selected={filter === 'today'}
            onPress={() => setFilter('today')}
            style={[styles.chip, filter === 'today' && styles.activeChip]}
            textStyle={[styles.chipText, filter === 'today' && styles.activeChipText]}
            showSelectedOverlay
          >
            Hoy
          </Chip>
          <Chip
            selected={filter === 'week'}
            onPress={() => setFilter('week')}
            style={[styles.chip, filter === 'week' && styles.activeChip]}
            textStyle={[styles.chipText, filter === 'week' && styles.activeChipText]}
            showSelectedOverlay
          >
            Esta Semana
          </Chip>
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={sales}
          keyExtractor={item => item.venta_id.toString()}
          renderItem={renderSaleItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBox}>
                <Receipt size={48} color="#cbd5e1" />
              </View>
              <Text style={styles.emptyTitle}>Sin ventas</Text>
              <Text style={styles.emptySub}>Aún no se han registrado ventas</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  filterSection: { height: 60, paddingVertical: 10 },
  filterScroll: { paddingHorizontal: 20 },
  chip: { marginRight: 8, backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  activeChip: { backgroundColor: '#1e293b' },
  chipText: { color: '#64748b', fontSize: 13, fontWeight: '600' },
  activeChipText: { color: 'white' },
  loadingContainer: { flex: 1, justifyContent: 'center' },
  listContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 8 },
  card: { borderRadius: 24, backgroundColor: 'white', marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9', overflow: 'hidden' },
  touchable: { padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  idGroup: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
  saleId: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
  dateText: { fontSize: 12, color: '#94a3b8', fontWeight: '600', marginTop: 2 },
  totalValue: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: 12, borderRadius: 12 },
  clientInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  clientName: { fontSize: 13, color: '#334155', fontWeight: '600' },
  paymentBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  paymentText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyIconBox: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  emptySub: { fontSize: 14, color: '#94a3b8', marginTop: 4 }
});
