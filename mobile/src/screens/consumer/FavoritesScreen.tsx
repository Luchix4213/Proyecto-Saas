import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, Surface, useTheme, IconButton, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Heart, ArrowLeft, ShoppingBag } from 'lucide-react-native';
import { AestheticHeader } from '../..//components/v2/AestheticHeader';

import { useFavoritesStore, FavoriteItem } from '../..//store/favoritesStore';
import { getApiImageUrl } from '../..//utils/imageUtils';

export const FavoritesScreen = () => {
    const navigation = useNavigation<any>();
    const theme = useTheme();
    const { favorites, removeFavorite } = useFavoritesStore();

    const renderFavoriteItem = ({ item }: { item: FavoriteItem }) => (
        <Surface style={styles.card} elevation={1}>
            <Image source={{ uri: getApiImageUrl(item.image) || 'https://via.placeholder.com/150' }} style={styles.image} />
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.store}>{item.store}</Text>
                <Text style={styles.price}>Bs {Number(item.price || 0).toFixed(2)}</Text>
            </View>
            <View style={styles.actions}>
                <IconButton
                    icon={() => <ShoppingBag size={20} color="white" />}
                    containerColor={theme.colors.primary}
                    size={20}
                    onPress={() => console.log('Add to cart')}
                />
                <IconButton
                    icon={() => <Heart size={20} color="#ef4444" fill="#ef4444" />}
                    size={20}
                    onPress={() => removeFavorite(item.id)}
                />
            </View>
        </Surface>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <AestheticHeader title="Mis Favoritos" subtitle={`${favorites.length} guardados`} />

            <FlatList
                data={favorites}
                renderItem={renderFavoriteItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Heart size={60} color="#e2e8f0" />
                        <Text style={styles.emptyTitle}>Sin favoritos aún</Text>
                        <Text style={styles.emptyText}>Guarda lo que más te guste para encontrarlo rápido.</Text>
                        <Button mode="contained" style={{ marginTop: 20 }} onPress={() => navigation.navigate('HomeTab')}>
                            Explorar
                        </Button>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    list: { padding: 20 },
    card: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 16, marginBottom: 16, padding: 12, alignItems: 'center' },
    image: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#f1f5f9' },
    info: { flex: 1, marginLeft: 12 },
    name: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
    store: { fontSize: 12, color: '#64748b', marginTop: 2 },
    price: { fontSize: 14, fontWeight: '700', color: '#10b981', marginTop: 4 },
    actions: { alignItems: 'flex-end', gap: 0 },

    empty: { alignItems: 'center', marginTop: 60, padding: 40 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginTop: 16 },
    emptyText: { textAlign: 'center', color: '#64748b', marginTop: 8 }
});
