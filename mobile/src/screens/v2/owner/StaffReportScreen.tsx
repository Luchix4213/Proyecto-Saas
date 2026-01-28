import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Surface, useTheme, ActivityIndicator, Avatar, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AestheticHeader } from '../../../components/v2/AestheticHeader';
import { reportsService } from '../../../api/reportsService';
import { User, TrendingUp, DollarSign, Award } from 'lucide-react-native';

export const StaffReportScreen = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const stats = await reportsService.getStaffPerformance();
      setData(stats);
    } catch (error) {
      console.error('Error fetching staff stats', error);
    } finally {
      setLoading(false);
    }
  };

  const maxSales = Math.max(...data.map(d => d.total_ventas || 0), 1);

  const renderStaffItem = ({ item, index }: { item: any, index: number }) => (
    <Surface style={styles.card} elevation={2}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
           <Avatar.Text
             size={48}
             label={item.nombre_completo?.split(' ').map((n: any) => n[0]).join('') || 'U'}
             style={{ backgroundColor: index === 0 ? '#fef3c7' : '#f1f5f9' }}
             labelStyle={{ color: index === 0 ? '#b45309' : '#475569' }}
           />
           <View style={{ marginLeft: 16 }}>
             <Text style={styles.userName}>{item.nombre_completo}</Text>
             <Text style={styles.userEmail}>{item.email}</Text>
           </View>
        </View>
        {index === 0 && <Award size={24} color="#f59e0b" />}
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
            <Text style={styles.statLabel}>Ventas</Text>
            <Text style={styles.statValue}>{item.cantidad_ventas}</Text>
        </View>
        <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total</Text>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                ${parseFloat(item.total_ventas || 0).toLocaleString()}
            </Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <ProgressBar
          progress={(item.total_ventas || 0) / maxSales}
          color={index === 0 ? '#f59e0b' : theme.colors.primary}
          style={styles.progressBar}
        />
        <Text style={styles.progressText}>
            {Math.round(((item.total_ventas || 0) / maxSales) * 100)}% del líder
        </Text>
      </View>
    </Surface>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AestheticHeader title="Rendimiento de Equipo" />

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderStaffItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          ListHeaderComponent={
            <View style={styles.summaryBox}>
                <TrendingUp size={30} color="white" />
                <View style={{ marginLeft: 16 }}>
                    <Text style={styles.summaryTitle}>Ventas por Usuario</Text>
                    <Text style={styles.summarySub}>Resumen acumulado del mes</Text>
                </View>
            </View>
          }
          ListEmptyComponent={
            <View style={{ flex: 1, alignItems: 'center', marginTop: 100 }}>
              <User size={60} color="#cbd5e1" />
              <Text style={{ color: '#94a3b8', marginTop: 16, fontSize: 16 }}>No hay datos de vendedores</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  summaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 24,
    borderRadius: 24,
    marginBottom: 24
  },
  summaryTitle: { color: 'white', fontSize: 20, fontWeight: '900' },
  summarySub: { color: '#94a3b8', fontSize: 13, fontWeight: '500' },
  card: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: 'white',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  userName: { fontSize: 17, fontWeight: '800', color: '#1e293b' },
  userEmail: { fontSize: 13, color: '#64748b', fontWeight: '500', marginTop: 2 },
  statsGrid: { flexDirection: 'row', marginTop: 20, backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, gap: 12 },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', fontWeight: '800', letterSpacing: 0.5 },
  statValue: { fontSize: 18, fontWeight: '900', color: '#1e293b', marginTop: 4 },
  progressContainer: { marginTop: 16 },
  progressBar: { height: 8, borderRadius: 4, backgroundColor: '#f1f5f9' },
  progressText: { fontSize: 11, color: '#64748b', textAlign: 'right', marginTop: 6, fontWeight: '700' }
});
