import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FavoriteItem {
    id: number | string;
    name: string;
    price: number;
    store: string;
    image: string;
    type: 'PRODUCT' | 'STORE';
    slug?: string; // For stores or product's store slug
}

interface FavoritesState {
    favorites: FavoriteItem[];
    addFavorite: (item: FavoriteItem) => void;
    removeFavorite: (id: number | string) => void;
    isFavorite: (id: number | string) => boolean;
    clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
    persist(
        (set, get) => ({
            favorites: [],

            addFavorite: (item) => {
                const exists = get().favorites.some(f => f.id === item.id);
                if (!exists) {
                    set({ favorites: [...get().favorites, item] });
                }
            },

            removeFavorite: (id) => {
                set({ favorites: get().favorites.filter(f => f.id !== id) });
            },

            isFavorite: (id) => {
                return get().favorites.some(f => f.id === id);
            },

            clearFavorites: () => set({ favorites: [] })
        }),
        {
            name: 'kipu-favorites-storage',
            storage: createJSONStorage(() => AsyncStorage)
        }
    )
);
