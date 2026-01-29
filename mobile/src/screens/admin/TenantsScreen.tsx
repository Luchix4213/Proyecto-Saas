import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity,  StyleSheet } from 'react-native';
import { Text, Surface, Avatar, Chip, IconButton, Searchbar, useTheme, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Building2, MoreVertical, Plus, Search, Crown, ArrowRight } from 'lucide-react-native';
import { AestheticHeader } from '../..//components/v2/AestheticHeader';
import { tenantsService } from '../..//api/tenantsService';

export const TenantsScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');

    const [tenants, setTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadTenants = async () => {
        try {
            setLoading(true);
            const data = await tenantsService.getAllTenants();
            setTenants(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    React.useEffect(() => {
        loadTenants();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadTenants();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVA': return { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' };
            case 'SUSPENDIDO': return { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' };
            case 'PENDIENTE': return { bg: '#fef3c7', text: '#92400e', border: '#fde68a' };
            default: return { bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0' };
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const statusColors = getStatusColor(item.estado);
        const planColor = item.plan_actual === 'Pro' ? '#6366f1' : '#64748b';

        return (
            <Surface elevation={1} style={styles.card}>
                <TouchableOpacity
                    style={styles.cardContent}
                    onPress={() => (navigation as any).navigate('TenantForm', { tenant: item })}
                >
                    <View style={styles.cardHeader}>
                         <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Avatar.Text
                                size={48}
                                label={item.nombre_empresa ? item.nombre_empresa.substring(0,2).toUpperCase() : 'EM'}
                                style={{ backgroundColor: '#f1f5f9' }}
                                color={theme.colors.primary}
                                labelStyle={{ fontWeight: '700' }}
                            />
                            <View style={{ marginLeft: 12 }}>
                                <Text style={styles.tenantName}>{item.nombre_empresa}</Text>
                                <Text style={styles.tenantSlug}>@{item.slug}</Text>
                            </View>
                        </View>
                        <IconButton icon={() => <MoreVertical size={20} color="#94a3b8" />} onPress={() => {}} />
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.cardFooter}>
                         <View style={[styles.statusBadge, { backgroundColor: statusColors.bg, borderColor: statusColors.border }]}>
                            <Text style={[styles.statusText, { color: statusColors.text }]}>
                                {item.estado ? item.estado.toUpperCase() : 'N/A'}
                            </Text>
                        </View>

                        <View style={styles.planBadge}>
                            <Crown size={14} color={planColor} />
                            <Text style={[styles.planText, { color: planColor }]}>{item.plan_actual || 'Gratis'}</Text>
                        </View>

                        <ArrowRight size={16} color="#cbd5e1" style={{ marginLeft: 'auto' }} />
                    </View>
                </TouchableOpacity>
            </Surface>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }} edges={['top']}>
            <AestheticHeader title="Empresas" subtitle="Gestión de Tenants" />

            <View style={styles.searchContainer}>
                <Searchbar
                    placeholder="Buscar empresa..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                    inputStyle={styles.searchInput}
                    icon={() => <Search size={20} color="#94a3b8" />}
                    placeholderTextColor="#94a3b8"
                />
            </View>

            <FlatList
                data={tenants}
                renderItem={renderItem}
                keyExtractor={item => item.tenant_id.toString()}
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            />

            <FAB
                icon={() => <Plus size={24} color="white" />}
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                onPress={() => (navigation as any).navigate('TenantForm', { tenant: null })}
                color="white"
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    searchContainer: { paddingHorizontal: 20, paddingBottom: 10 },
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
        alignSelf: 'center', // Fix for react-native-paper Searchbar input alignment
        minHeight: 0 // Fix for react-native-paper Searchbar height issue
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 20,
        overflow: 'hidden'
    },
    cardContent: {
        padding: 16
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    tenantName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b'
    },
    tenantSlug: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500'
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginVertical: 12
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 100,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '800'
    },
    planBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: '#f8fafc',
        borderRadius: 8
    },
    planText: {
        fontSize: 11,
        fontWeight: '700'
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        borderRadius: 16
    }
});
