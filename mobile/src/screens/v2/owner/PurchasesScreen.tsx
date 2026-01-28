import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, Surface, useTheme, ActivityIndicator, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AestheticHeader } from '../../../components/v2/AestheticHeader';
import { purchasesService, Purchase } from '../../../api/purchasesService';
import { ShoppingCart, Calendar, Building2, FileText, Hash } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const PurchasesScreen = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();
  const theme = useTheme();

  useFocusEffect(
    React.useCallback(() => {
      fetchPurchases();
    }, [])
  );

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const data = await purchasesService.getAll();
      setPurchases(data);
    } catch (error) {
      console.error('Error fetching purchases', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPurchaseItem = ({ item }: { item: Purchase }) => (
    <Surface style={styles.card} elevation={1}>
      <TouchableOpacity
        style={styles.touchable}
        onPress={() => {}}
      >
        <View style={styles.headerRow}>
          <View style={styles.idGroup}>
            <View style={styles.iconBox}>
              <ShoppingCart size={20} color={theme.colors.primary} />
            </View>
            <View>
              <Text style={styles.purchaseId}>Compra #{item.compra_id}</Text>
              <View style={styles.dateRow}>
                <Calendar size={12} color="#94a3b8" />
                <Text style={styles.dateText}>
                  {format(new Date(item.fecha_compra), "d 'de' MMMM", { locale: es })}
                </Text>
              </View>
            </View>
          </View>
          <Text style={styles.totalValue}>${item.total.toLocaleString()}</Text>
        </View>

        <View style={styles.supplierFooter}>
          <Building2 size={14} color="#64748b" />
          <Text style={styles.supplierName} numberOfLines={1}>
            {item.proveedor?.nombre}
          </Text>
          {item.comprobante_url && (
             <FileText size={14} color={theme.colors.primary} />
          )}
        </View>
      </TouchableOpacity>
    </Surface>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AestheticHeader title="Compras" subtitle="Ingresos de Stock" />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={purchases}
          keyExtractor={item => item.compra_id.toString()}
          renderItem={renderPurchaseItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBox}>
                <ShoppingCart size={48} color="#cbd5e1" />
              </View>
              <Text style={styles.emptyTitle}>Sin compras</Text>
              <Text style={styles.emptySub}>No hay registros de stock aún</Text>
            </View>
          }
        />
      )}

      <FAB
        icon="plus"
        label="REGISTRAR COMPRA"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="white"
        onPress={() => navigation.navigate('PurchaseForm')}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  loadingContainer: { flex: 1, justifyContent: 'center' },
  listContent: { paddingHorizontal: 20, paddingBottom: 100, paddingTop: 12 },
  card: { borderRadius: 24, backgroundColor: 'white', marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9', overflow: 'hidden' },
  touchable: { padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  idGroup: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
  purchaseId: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  dateText: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
  totalValue: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  supplierFooter: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, gap: 8 },
  supplierName: { flex: 1, fontSize: 13, color: '#334155', fontWeight: '600' },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyIconBox: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  emptySub: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
  fab: { position: 'absolute', margin: 20, right: 0, bottom: 0, borderRadius: 16, elevation: 4 }
});
