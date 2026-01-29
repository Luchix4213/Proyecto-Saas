import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Surface, useTheme, ActivityIndicator, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AestheticHeader } from '../../components/v2/AestheticHeader';
import { salesService, Venta } from '../../api/salesService';
import { Receipt, User, Wallet, Plus, Globe, Truck } from 'lucide-react-native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { TabView, TabBar } from 'react-native-tab-view';

const SalesList = ({
    type,
    filter,
    setFilter,
    navigation,
    refreshTrigger
}: {
    type: 'FISICA' | 'ONLINE',
    filter: string,
    setFilter: (f: string) => void,
    navigation: any,
    refreshTrigger: number
}) => {
    const [sales, setSales] = useState<Venta[]>([]);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();

    useFocusEffect(
        useCallback(() => {
            fetchSales();
        }, [type, refreshTrigger, filter]) // Added filter dependency
    );

    const fetchSales = async () => {
        setLoading(true);
        try {
            const data = await salesService.getAll({ tipo: type });
            setSales(data);
        } catch (error) {
            console.error('Error fetching sales', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSales = sales.filter(s => {
        if (type === 'FISICA') {
            if (filter === 'all') return true;
            if (filter === 'today') {
                const today = new Date().toISOString().split('T')[0];
                return s.fecha_venta.startsWith(today);
            }
            if (filter === 'week') {
                // Simplified week logic or remove
                return true;
            }
            return true;
        } else {
            // Online Filters
            if (filter === 'REGISTRADA') return s.estado === 'REGISTRADA'; // Por Verificar
            if (filter === 'EN_PROCESO') return s.estado === 'PAGADA' && s.estado_entrega !== 'ENTREGADO';
            if (filter === 'FINALIZADO') return s.estado === 'PAGADA' && s.estado_entrega === 'ENTREGADO';
            if (filter === 'CANCELADO') return s.estado === 'CANCELADA';
            return true;
        }
    });

    const renderSaleItem = ({ item }: { item: Venta }) => (
        <Surface style={styles.card} elevation={1}>
            <TouchableOpacity
                style={styles.touchable}
                onPress={() => {
                    if (type === 'ONLINE') {
                        navigation.navigate('OnlineOrderDetailScreen', { saleId: item.venta_id });
                    }
                }}
            >
                <View style={styles.headerRow}>
                    <View style={styles.idGroup}>
                        <View style={[styles.iconBox, type === 'ONLINE' && { backgroundColor: '#e0f2fe', borderColor: '#bae6fd' }]}>
                            {type === 'ONLINE' ? (
                                <Globe size={20} color="#0284c7" />
                            ) : (
                                <Receipt size={20} color={theme.colors.primary} />
                            )}
                        </View>
                        <View>
                            <Text style={styles.saleId}>
                                {type === 'ONLINE' ? 'Pedido' : 'Venta'} #{item.venta_id}
                            </Text>
                            <Text style={styles.dateText}>
                                {(() => {
                                    const date = new Date(item.fecha_venta);
                                    return isNaN(date.getTime())
                                        ? 'Fecha inválida'
                                        : format(date, "d MMM, HH:mm", { locale: es });
                                })()}
                            </Text>
                        </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.totalValue}>${item.total.toLocaleString()}</Text>
                        {type === 'ONLINE' && (
                             <Text style={[
                                styles.statusText,
                                item.estado === 'REGISTRADA' && { color: '#d97706' },
                                item.estado === 'PAGADA' && { color: '#16a34a' },
                                item.estado === 'CANCELADA' && { color: '#dc2626' }
                             ]}>
                                {item.estado.replace('_', ' ')}
                             </Text>
                        )}
                    </View>
                </View>

                <View style={styles.footerRow}>
                    <View style={styles.clientInfo}>
                        <User size={14} color="#64748b" />
                        <Text style={styles.clientName} numberOfLines={1}>
                            {item.cliente?.nombre || 'Consumidor Final'} {item.cliente?.paterno || ''}
                        </Text>
                    </View>
                    {type === 'ONLINE' && item.estado_entrega && (
                         <View style={[styles.paymentBadge, { backgroundColor: '#f0fdf4' }]}>
                            <Truck size={10} color="#16a34a" />
                            <Text style={[styles.paymentText, { color: '#16a34a' }]}>{item.estado_entrega}</Text>
                        </View>
                    )}
                    {(type === 'FISICA' || !item.estado_entrega) && (
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
                    )}
                </View>
            </TouchableOpacity>
        </Surface>
    );

    if (loading && sales.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            {type === 'FISICA' ? (
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
                 </ScrollView>
               </View>
            ) : (
                <View style={styles.filterSection}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                        {[
                            { id: 'REGISTRADA', label: 'Por Verificar' },
                            { id: 'EN_PROCESO', label: 'En Proceso' },
                            { id: 'FINALIZADO', label: 'Finalizados' },
                            { id: 'CANCELADO', label: 'Rechazados' }
                        ].map(chip => (
                            <Chip
                                key={chip.id}
                                selected={filter === chip.id}
                                onPress={() => setFilter(chip.id)}
                                style={[styles.chip, filter === chip.id && styles.activeChip]}
                                textStyle={[styles.chipText, filter === chip.id && styles.activeChipText]}
                                showSelectedOverlay
                            >
                                {chip.label}
                            </Chip>
                        ))}
                    </ScrollView>
                </View>
            )}

            <FlatList
                data={filteredSales}
                keyExtractor={item => item.venta_id.toString()}
                renderItem={renderSaleItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconBox}>
                            {type === 'ONLINE' ? <Globe size={48} color="#cbd5e1" /> : <Receipt size={48} color="#cbd5e1" />}
                        </View>
                        <Text style={styles.emptyTitle}>Sin ventas</Text>
                        <Text style={styles.emptySub}>
                            {type === 'ONLINE' ? 'No hay pedidos online' : 'No se han registrado ventas físicas'}
                        </Text>
                    </View>
                }
            />
        </View>
    );
};

export const SalesScreen = () => {
  const navigation = useNavigation<any>();
  const theme = useTheme();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'pos', title: 'Punto de Venta' },
    { key: 'online', title: 'Pedidos Online' },
  ]);

  const [onlineFilter, setOnlineFilter] = useState('REGISTRADA');
  const [posFilter, setPosFilter] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);

  const renderScene = ({ route }: any) => {
      switch (route.key) {
        case 'pos':
            return <SalesList type="FISICA" filter={posFilter} setFilter={setPosFilter} navigation={navigation} refreshTrigger={refreshKey} />;
        case 'online':
            return <SalesList type="ONLINE" filter={onlineFilter} setFilter={setOnlineFilter} navigation={navigation} refreshTrigger={refreshKey} />;
        default:
            return null;
      }
  };

  useFocusEffect(
    useCallback(() => {
        setRefreshKey(prev => prev + 1);
    }, [])
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AestheticHeader
        title="Ventas"
        subtitle="Gestión de Pedidos"
        rightAction={
            <TouchableOpacity
                style={styles.newSaleBtn}
                onPress={() => navigation.navigate('PosScreen')}
            >
                <Plus size={20} color="white" />
                <Text style={styles.newSaleText}>Nueva Venta</Text>
            </TouchableOpacity>
        }
      />

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get('window').width }}
        commonOptions={{
          label: ({ route, color }) => (
            <Text style={{
              color,
              fontWeight: '800',
              fontSize: 13,
              textTransform: 'capitalize',
              marginBottom: 2
            }}>
              {route.title}
            </Text>
          )
        }}
        renderTabBar={props => (
            <TabBar
                {...props}
                indicatorStyle={{ backgroundColor: theme.colors.primary, height: 3, borderRadius: 3 }}
                style={{ backgroundColor: 'white', elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}
                activeColor={theme.colors.primary}
                inactiveColor="#94a3b8"
            />
        )}
      />
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
  emptySub: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
  newSaleBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, gap: 8 },
  newSaleText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  statusText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }
});
