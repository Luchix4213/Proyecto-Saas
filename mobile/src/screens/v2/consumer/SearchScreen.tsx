import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, TextInput, FlatList, Image } from 'react-native';
import { Text, Surface, useTheme, IconButton, Divider, ActivityIndicator, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Search, MapPin, ArrowLeft, Clock, TrendingUp, X } from 'lucide-react-native';
import { consumerService, PublicTenant } from '../../../api/consumerService';
import { AestheticHeader } from '../../../components/v2/AestheticHeader';

export const SearchScreen = () => {
    const navigation = useNavigation<any>();
    const theme = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [history, setHistory] = useState<string[]>(['Hamburguesas', 'Farmacia', 'Pollo']);
    const [results, setResults] = useState<PublicTenant[]>([]);
    const [loading, setLoading] = useState(false);

    // Trending/Rubros state
    const [trending, setTrending] = useState<string[]>([]);

    // Fetch rubros on mount
    useEffect(() => {
        const loadRubros = async () => {
             try {
                 const data = await consumerService.getRubros();
                 // Take first 10 rubros names
                 const names = data.map((r: any) => r.nombre).slice(0, 10);
                 setTrending(names);
             } catch (error) {
                 console.error('Failed to load rubros', error);
             }
        };
        loadRubros();
    }, []);

    useEffect(() => {
        if (searchQuery.length > 2) {
            performSearch(searchQuery);
        } else {
            setResults([]);
        }
    }, [searchQuery]);

    const performSearch = async (query: string) => {
        setLoading(true);
        try {
            // Server-side search
            const results = await consumerService.getFeaturedTenants(undefined, query);
            setResults(results);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSelect = (term: string) => {
        setSearchQuery(term);
        // Add to history if unique
        if (!history.includes(term)) setHistory([term, ...history].slice(0, 5));
    };

    const renderTenantItem = ({ item }: { item: PublicTenant }) => (
        <TouchableOpacity
            style={styles.resultItem}
            onPress={() => navigation.navigate('StoreHome', { tenantSlug: item.slug || item.tenant_id.toString(), tenantName: item.nombre_empresa })}
        >
            <Image source={{ uri: item.logo_url || 'https://via.placeholder.com/60' }} style={styles.resultImage} />
            <View style={styles.resultInfo}>
                <Text style={styles.resultTitle}>{item.nombre_empresa}</Text>
                <Text style={styles.resultSubtitle}>{item.rubro || 'Comercio'}</Text>
            </View>
            <ArrowLeft size={16} style={{ transform: [{ rotate: '180deg' }] }} color="#cbd5e1" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <View style={styles.searchBar}>
                    <Search size={20} color="#64748b" style={{ marginRight: 8 }} />
                    <TextInput
                        placeholder="Buscar tiendas, productos..."
                        style={styles.input}
                        placeholderTextColor="#94a3b8"
                        autoFocus
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <X size={18} color="#94a3b8" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {loading && <ActivityIndicator style={{ marginTop: 20 }} color={theme.colors.primary} />}

            {!loading && searchQuery.length === 0 && (
                <ScrollView contentContainerStyle={styles.content}>
                    {/* History */}
                    {history.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Recientes</Text>
                            <View style={styles.historyList}>
                                {history.map((term, index) => (
                                    <TouchableOpacity key={index} style={styles.historyItem} onPress={() => handleSearchSelect(term)}>
                                        <Clock size={16} color="#94a3b8" />
                                        <Text style={styles.historyText}>{term}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Trending */}
                    <View style={[styles.section, { marginTop: 24 }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                            <TrendingUp size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
                            <Text style={styles.sectionTitle}>Categorías</Text>
                        </View>
                        <View style={styles.trendingList}>
                            {trending.map((term, index) => (
                                <Chip
                                    key={index}
                                    style={styles.trendChip}
                                    textStyle={{ color: '#1e293b', fontWeight: '600' }}
                                    onPress={() => handleSearchSelect(term)}
                                >
                                    {term}
                                </Chip>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            )}

            {!loading && searchQuery.length > 0 && (
                <FlatList
                    data={results}
                    renderItem={renderTenantItem}
                    keyExtractor={item => item.tenant_id.toString()}
                    contentContainerStyle={styles.resultsList}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No encontramos resultados para "{searchQuery}"</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingBottom: 10, paddingTop: 10 },
    searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', height: 50, borderRadius: 12, paddingHorizontal: 16, marginRight: 10, borderWidth: 1, borderColor: '#f1f5f9' },
    input: { flex: 1, fontSize: 16, color: '#1e293b', height: '100%' },

    content: { padding: 20 },
    section: {},
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 12 },

    historyList: { gap: 0 },
    historyItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', gap: 12 },
    historyText: { fontSize: 15, color: '#64748b' },

    trendingList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    trendChip: { backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0' },

    resultsList: { padding: 20 },
    resultItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 12, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9' },
    resultImage: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#f1f5f9' },
    resultInfo: { flex: 1, marginLeft: 12 },
    resultTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
    resultSubtitle: { fontSize: 13, color: '#64748b' },

    emptyContainer: { alignItems: 'center', marginTop: 40 },
    emptyText: { color: '#94a3b8', fontSize: 16 }
});
