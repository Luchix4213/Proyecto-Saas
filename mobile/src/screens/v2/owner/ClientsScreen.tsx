import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Text, Surface, useTheme, ActivityIndicator, FAB, Searchbar, IconButton, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AestheticHeader } from '../../../components/v2/AestheticHeader';
import { clientsService, Cliente } from '../../../api/clientsService';
import { Users, Phone, Mail, ChevronRight, Hash, Trash2, MapPin } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

export const ClientsScreen = () => {
  const [clients, setClients] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation<any>();
  const theme = useTheme();

  useFocusEffect(
    React.useCallback(() => {
      fetchClients();
    }, [])
  );

  const fetchClients = async () => {
    setLoading(true);
    try {
      const data = await clientsService.getAll();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Eliminar Cliente',
      '¿Estás seguro de que deseas eliminar este cliente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await clientsService.delete(id);
              fetchClients();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el cliente');
            }
          }
        }
      ]
    );
  };

  const filteredClients = clients.filter(c =>
    (c.nombre + ' ' + (c.paterno || '')).toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.nit_ci?.includes(searchQuery)
  );

  const getInitials = (name: string, surname?: string) => {
    return (name[0] + (surname?.[0] || '')).toUpperCase().substring(0, 2);
  };

  const renderClientItem = ({ item }: { item: Cliente }) => (
    <Surface style={styles.card} elevation={1}>
      <TouchableOpacity
        style={styles.touchable}
        onPress={() => {
            // Future: navigation.navigate('ClientForm', { client: item })
            Alert.alert('Info', 'Edición de cliente próximamente');
        }}
      >
        <View style={styles.contentRow}>
          <Avatar.Text
            size={48}
            label={getInitials(item.nombre, item.paterno)}
            style={{ backgroundColor: '#f1f5f9', marginRight: 16 }}
            labelStyle={{ color: '#64748b', fontWeight: '800' }}
          />
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>{item.nombre} {item.paterno}</Text>

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
              onPress={() => handleDelete(item.cliente_id)}
          />
          <ChevronRight size={20} color="#cbd5e1" />
        </View>
      </TouchableOpacity>
    </Surface>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AestheticHeader title="Clientes" subtitle="Cartera de Clientes" />

      <View style={styles.searchSection}>
        <Searchbar
          placeholder="Buscar cliente..."
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
          data={filteredClients}
          keyExtractor={item => item.cliente_id.toString()}
          renderItem={renderClientItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBox}>
                <Users size={48} color="#cbd5e1" />
              </View>
              <Text style={styles.emptyTitle}>Sin clientes</Text>
              <Text style={styles.emptySub}>Registra tu primer cliente</Text>
            </View>
          }
        />
      )}

      <FAB
        icon="plus"
        onPress={() => navigation.navigate('ClientForm')}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="white"
        label="NUEVO CLIENTE"
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
