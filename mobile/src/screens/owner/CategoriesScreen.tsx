import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, Surface, useTheme, ActivityIndicator, Searchbar, FAB, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { categoriesService, Category } from '../..//api/categoriesService';
import { Layers, ChevronRight, Plus, Search, Trash2 } from 'lucide-react-native';

export const CategoriesScreen = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation<any>();
  const theme = useTheme();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoriesService.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories', error);
      Alert.alert('Error', 'No se pudieron cargar las categorías');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCategories();
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Eliminar Categoría',
      '¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await categoriesService.delete(id);
              fetchCategories();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la categoría');
            }
          }
        }
      ]
    );
  };

  const filteredCategories = categories.filter(c =>
    c.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <Surface style={styles.card} elevation={1}>
      <TouchableOpacity
        style={styles.touchable}
        onPress={() => navigation.navigate('CategoryForm', { category: item })}
      >
        <View style={styles.cardContent}>
            <View style={styles.iconBox}>
                <Layers size={22} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={styles.categoryName}>{item.nombre}</Text>
                {item.descripcion ? (
                    <Text style={styles.categoryDesc} numberOfLines={1}>{item.descripcion}</Text>
                ) : (
                    <Text style={styles.noDesc}>Sin descripción</Text>
                )}
            </View>
            <IconButton
                icon={() => <Trash2 size={18} color="#ef4444" />}
                onPress={() => handleDelete(item.categoria_id)}
            />
            <ChevronRight size={20} color="#cbd5e1" />
        </View>
      </TouchableOpacity>
    </Surface>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
            <Text style={styles.headerSubtitle}>Gestión de Catálogo</Text>
            <Text style={styles.headerTitle}>Categorías</Text>
        </View>
        <IconButton
            icon="close"
            onPress={() => navigation.goBack()}
            style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#f1f5f9' }}
        />
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar categorías..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor="#94a3b8"
          placeholderTextColor="#94a3b8"
          elevation={0}
        />
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredCategories}
          keyExtractor={item => item.categoria_id.toString()}
          renderItem={renderCategoryItem}
          contentContainerStyle={styles.listContent}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <View style={styles.emptyIconBox}>
                    <Layers size={48} color="#cbd5e1" />
                </View>
              <Text style={styles.emptyTitle}>Sin categorías</Text>
              <Text style={styles.emptySub}>Añade categorías para organizar tus productos</Text>
            </View>
          }
        />
      )}

      <FAB
        icon="plus"
        label="NUEVA CATEGORÍA"
        uppercase
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="white"
        onPress={() => navigation.navigate('CategoryForm')}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#f8fafc'
  },
  headerSubtitle: { fontSize: 12, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#0f172a' },
  searchContainer: { paddingHorizontal: 20, marginBottom: 16 },
  searchBar: { borderRadius: 16, backgroundColor: 'white', borderWidth: 1, borderColor: '#f1f5f9', height: 50 },
  searchInput: { fontSize: 15, color: '#1e293b' },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  card: { borderRadius: 24, backgroundColor: 'white', marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9', overflow: 'hidden' },
  touchable: { padding: 16 },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
  categoryName: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
  categoryDesc: { fontSize: 13, color: '#64748b', marginTop: 2 },
  noDesc: { fontSize: 13, color: '#94a3b8', marginTop: 2, fontStyle: 'italic' },
  loadingContainer: { flex: 1, justifyContent: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyIconBox: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  emptySub: { fontSize: 14, color: '#94a3b8', marginTop: 4, textAlign: 'center', paddingHorizontal: 40 },
  fab: { position: 'absolute', bottom: 30, right: 20, borderRadius: 16 },
});
