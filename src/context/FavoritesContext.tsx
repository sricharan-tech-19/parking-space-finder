import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

type FavoritesContextType = {
    favorites: string[];
    addFavorite: (id: string) => Promise<void>;
    removeFavorite: (id: string) => Promise<void>;
    isFavorite: (id: string) => boolean;
    refreshFavorites: () => Promise<void>;  // ← ADD THIS
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
    const [favorites, setFavorites] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // ✅ Load favorites on mount
    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            const stored = await AsyncStorage.getItem('favorites');
            if (stored) {
                setFavorites(JSON.parse(stored));
            }
            setLoading(false);
        } catch (error) {
            console.error('Error loading favorites:', error);
            setLoading(false);
        }
    };

    const addFavorite = async (id: string) => {
        try {
            const updated = [...favorites, id];
            setFavorites(updated);
            await AsyncStorage.setItem('favorites', JSON.stringify(updated));
            console.log('✅ Added to favorites:', id);
        } catch (error) {
            console.error('Error adding favorite:', error);
        }
    };

    const removeFavorite = async (id: string) => {
        try {
            const updated = favorites.filter(fav => fav !== id);
            setFavorites(updated);
            await AsyncStorage.setItem('favorites', JSON.stringify(updated));
            console.log('✅ Removed from favorites:', id);
        } catch (error) {
            console.error('Error removing favorite:', error);
        }
    };

    const isFavorite = (id: string) => {
        return favorites.includes(id);
    };

    // ✅ NEW: Refresh function
    const refreshFavorites = async () => {
        await loadFavorites();
    };

    return (
        <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, refreshFavorites }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within FavoritesProvider');
    }
    return context;
}
