import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Text, Surface, useTheme, ActivityIndicator, FAB, Searchbar, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AestheticHeader } from '../../../components/v2/AestheticHeader';
import { suppliersService, Supplier } from '../../../api/suppliersService';
import { Building2, Phone, Mail, ChevronRight, Search, MapPin, Hash, Trash2 } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

export const SuppliersScreen = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation<any>();
  const theme = useTheme();

  useFocusEffect(
    React.useCallback(() => {
      fetchSuppliers();
    }, [])
  );

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const data = await suppliersService.getAll();
      setSuppliers(data);
    } catch (error) {
      console.error('Error fetching suppliers', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Eliminar Proveedor',
      '¿Estás seguro de que deseas eliminar este proveedor?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await suppliersService.delete(id);
              fetchSuppliers();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el proveedor');
            }
          }
        }
      ]
    );
  };

  const filteredSuppliers = suppliers.filter(s =>
    s.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.nit_ci?.includes(searchQuery)
  );

  const renderSupplierItem = ({ item }: { item: Supplier }) => (
    <Surface style={styles.card} elevation={1}>
      <TouchableOpacity
        style={styles.touchable}
        onPress={() => navigation.navigate('SupplierForm', { supplier: item })}
      >
        <View style={styles.contentRow}>
          <View style={styles.iconContainer}>
            <Building2 size={24} color={theme.colors.primary} />
          </View>
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>{item.nombre}</Text>

            <View style={styles.nitRow}>
                <Hash size={12} color="#94a3b8" />
                <Text style={styles.nitText}>{item.nit_ci || 'S/N'}</Text>
            </View>

            <View style={styles.contactDetails}>
                <View style={styles.detailItem}>
                    <Phone size={12} color="#64748b" />
                    <Text style={styles.detailText}>{item.telefono || '---'}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Mail size={12} color="#64748b" />
                    <Text style={styles.detailText} numberOfLines={1}>{item.email || '---'}</Text>
                </View>
            </View>
          </View>
          <IconButton
              icon={() => <Trash2 size={18} color="#ef4444" />}
              onPress={() => handleDelete(item.proveedor_id)}
          />
          <ChevronRight size={20} color="#cbd5e1" />
        </View>
      </TouchableOpacity>
    </Surface>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AestheticHeader title="Proveedores" subtitle="Directorio de Negocio" />

      <View style={styles.searchSection}>
        <Searchbar
          placeholder="Buscar proveedor..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={theme.colors.primary}
          placeholderTextColor="#94a3b8"
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredSuppliers}
          keyExtractor={item => item.proveedor_id.toString()}
          renderItem={renderSupplierItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBox}>
                <Building2 size={48} color="#cbd5e1" />
              </View>
              <Text style={styles.emptyTitle}>Sin proveedores</Text>
              <Text style={styles.emptySub}>Registra tu primer proveedor</Text>
            </View>
          }
        />
      )}

      <FAB
        icon="plus"
        onPress={() => navigation.navigate('SupplierForm')}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="white"
        label="NUEVO PROVEEDOR"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  searchSection: { paddingHorizontal: 20, paddingVertical: 12 },
  searchBar: { backgroundColor: 'white', borderRadius: 16, elevation: 0, borderWidth: 1, borderColor: '#f1f5f9' },
  searchInput: { fontSize: 15, fontWeight: '500' },
  loadingContainer: { flex: 1, justifyContent: 'center' },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  card: { borderRadius: 24, backgroundColor: 'white', marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9', overflow: 'hidden' },
  touchable: { padding: 16 },
  contentRow: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', marginRight: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
  nitRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  nitText: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
  contactDetails: { flexDirection: 'row', marginTop: 12, gap: 16 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyIconBox: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  emptySub: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
  fab: { position: 'absolute', margin: 20, right: 0, bottom: 0, borderRadius: 16, elevation: 4 }
});
