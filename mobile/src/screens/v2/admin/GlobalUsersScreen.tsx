import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Text, Surface, useTheme, ActivityIndicator, Searchbar, IconButton, Avatar, Chip, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AestheticHeader } from '../../../components/v2/AestheticHeader';
import { adminService, GlobalUser } from '../../../api/adminService';
import { User, Phone, Mail, Building2, MoreVertical, Shield, Search } from 'lucide-react-native';

export const GlobalUsersScreen = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useTheme();

  const handleSearch = async () => {
    // if (!searchQuery) return;
    setLoading(true);
    try {
      const data = await adminService.getGlobalUsers(searchQuery);
      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <Surface style={styles.card} elevation={1}>
        <View style={styles.cardContent}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                 <Avatar.Text
                    size={50}
                    label={item.nombre?.[0] || 'U'}
                    style={{ backgroundColor: item.rol === 'PROPIETARIO' ? '#e0e7ff' : '#f1f5f9' }}
                    labelStyle={{ color: item.rol === 'PROPIETARIO' ? '#4f46e5' : '#64748b', fontWeight: '800' }}
                />
            </View>

            <View style={styles.info}>
                <View style={styles.headerRow}>
                    <Text style={styles.name}>{item.nombre} {item.paterno || ''}</Text>
                     <View style={[styles.roleBadge, { backgroundColor: item.rol === 'PROPIETARIO' ? '#f5f3ff' : '#f8fafc', borderColor: item.rol === 'PROPIETARIO' ? '#c4b5fd' : '#e2e8f0' }]}>
                        <Text style={[styles.roleText, { color: item.rol === 'PROPIETARIO' ? '#7c3aed' : '#64748b' }]}>
                            {item.rol}
                        </Text>
                     </View>
                </View>

                {item.nombre_empresa && (
                    <View style={styles.detailRow}>
                        <Building2 size={13} color="#94a3b8" />
                        <Text style={styles.detailText}>{item.nombre_empresa}</Text>
                    </View>
                )}
                 <View style={styles.detailRow}>
                    <Mail size={13} color="#94a3b8" />
                    <Text style={styles.detailText}>{item.email}</Text>
                </View>
            </View>
            <IconButton icon={() => <MoreVertical size={20} color="#cbd5e1" />} onPress={() => {}} />
        </View>
    </Surface>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AestheticHeader title="Usuarios Globales" subtitle="Búsqueda en todos los tenants" />

      <View style={styles.searchSection}>
        <Searchbar
          placeholder="Buscar usuarios..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={handleSearch}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          icon={() => <Search size={20} color="#94a3b8" />}
          placeholderTextColor="#94a3b8"
        />
      </View>

      {loading ? (
        <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item: GlobalUser) => item.usuario_id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.centerEmpty}>
                <Shield size={60} color="#cbd5e1" />
                <Text style={styles.emptyText}>Busca usuarios por nombre, email o empresa</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  searchSection: { paddingHorizontal: 20, paddingBottom: 10 },
  searchBar: {
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 0,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    height: 48
  },
  searchInput: {
    fontSize: 14,
    alignSelf: 'center',
    minHeight: 0
  },
  center: { flex: 1, justifyContent: 'center' },
  list: { padding: 20 },
  card: { backgroundColor: 'white', borderRadius: 20, marginBottom: 12, overflow: 'hidden' },
  cardContent: { padding: 16, flexDirection: 'row', alignItems: 'center' },
  info: { flex: 1, marginLeft: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  name: { fontSize: 15, fontWeight: '800', color: '#1e293b', flex: 1, marginRight: 8 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
  roleText: { fontSize: 9, fontWeight: '700' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  detailText: { fontSize: 13, color: '#64748b' },
  centerEmpty: { alignItems: 'center', marginTop: 60, gap: 16 },
  emptyText: { color: '#94a3b8', fontSize: 15, fontWeight: '500', textAlign: 'center', maxWidth: 250 }
});
