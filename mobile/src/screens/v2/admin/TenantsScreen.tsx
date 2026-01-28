import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { Text, Surface, Avatar, Chip, IconButton, Searchbar, useTheme, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Building2, MoreVertical, Plus } from 'lucide-react-native';

export const TenantsScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');

    // Mock Data
    const tenants = [
        { id: '1', name: 'Bodega Don Pepe', slug: 'bodega-pepe', plan: 'Pro', status: 'Active', owner: 'Juan Pérez' },
        { id: '2', name: 'Farmacia Salud', slug: 'farma-salud', plan: 'Starter', status: 'Active', owner: 'Ana Silva' },
        { id: '3', name: 'Librería Central', slug: 'libreria-central', plan: 'Enterprise', status: 'Suspended', owner: 'Carlos Ruiz' },
        { id: '4', name: 'Tienda de Ropa Moda', slug: 'moda-express', plan: 'Pro', status: 'Active', owner: 'Luisa M.' },
    ];

    const renderItem = ({ item }: { item: any }) => (
        <Surface elevation={1} className="bg-white mx-4 mb-3 rounded-xl overflow-hidden">
            <TouchableOpacity className="p-4 flex-row items-center">
                <Avatar.Text
                    size={48}
                    label={item.name.substring(0,2).toUpperCase()}
                    className="bg-slate-100"
                    color={theme.colors.primary}
                />
                <View className="flex-1 ml-4">
                    <View className="flex-row justify-between items-start">
                        <Text variant="titleMedium" className="font-bold text-slate-800">{item.name}</Text>
                        <Chip
                            mode="flat"
                            textStyle={{ fontSize: 10, marginVertical: 0, marginHorizontal: 8 }}
                            style={{ backgroundColor: item.status === 'Active' ? '#dcfce7' : '#fee2e2', height: 24 }}
                        >
                            <Text style={{ color: item.status === 'Active' ? '#166534' : '#991b1b', fontSize: 10, fontWeight: 'bold' }}>
                                {item.status.toUpperCase()}
                            </Text>
                        </Chip>
                    </View>
                    <Text variant="bodySmall" className="text-slate-500 mt-1">Slug: @{item.slug}</Text>
                    <View className="flex-row items-center mt-2 gap-2">
                        <Chip icon="crown" compact mode="outlined">{item.plan}</Chip>
                        <Text variant="labelSmall" className="text-slate-400">Dueño: {item.owner}</Text>
                    </View>
                </View>
                <IconButton icon={() => <MoreVertical size={20} color="#94a3b8" />} onPress={() => {}} />
            </TouchableOpacity>
        </Surface>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }} edges={['top']}>
            <View className="px-4 py-3">
                <Text variant="headlineMedium" className="font-black text-slate-800 mb-4">Empresas</Text>
                <Searchbar
                    placeholder="Buscar empresa..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    className="bg-white mb-2 elevation-1"
                    inputStyle={{ minHeight: 0 }}
                />
            </View>

            <FlatList
                data={tenants}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingBottom: 80 }}
            />

            <FAB
                icon="plus"
                style={{ position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: theme.colors.primary }}
                onPress={() => {}}
                color="white"
            />
        </SafeAreaView>
    );
};
