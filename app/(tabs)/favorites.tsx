import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { useFavorites } from '../../src/context/FavoritesContext';
import { PARKING_LOCATIONS } from '../../src/data/parkingData';

export default function FavoritesScreen() {
    const router = useRouter();
    const { favorites } = useFavorites();

    // Refresh when tab opens
    useFocusEffect(
        useCallback(() => {
            // Just refresh the favorites list
        }, [favorites])
    );

    // Filter favorites from static data
    const favoriteParking = PARKING_LOCATIONS.filter(parking =>
        favorites.includes(parking.id)
    );

    if (favoriteParking.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.emptyTitle}>❤️ No Favorites Yet</Text>
                <Text style={styles.emptySubtitle}>
                    Add parking spots to your favorites to see them here
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>❤️ My Favorites</Text>
                <Text style={styles.headerSubtitle}>{favoriteParking.length} saved spots</Text>
            </View>

            <FlatList
                data={favoriteParking}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() =>
                            router.push({
                                pathname: '/parking-info',
                                params: {
                                    id: item.id,
                                    name: item.name,
                                    availability: String(item.availability),
                                    price: item.price,
                                    hours: item.hours,
                                    city: item.city,
                                    lat: String(item.coords.latitude),
                                    lng: String(item.coords.longitude),
                                },
                            })
                        }
                        style={styles.card}
                    >
                        <View style={styles.cardContent}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>{item.name}</Text>
                                <View
                                    style={[
                                        styles.availabilityBadge,
                                        {
                                            backgroundColor:
                                                item.availability > 15
                                                    ? '#4CAF50'
                                                    : item.availability > 8
                                                        ? '#FF9800'
                                                        : '#F44336',
                                        },
                                    ]}
                                >
                                    <Text style={styles.availabilityText}>{item.availability}</Text>
                                </View>
                            </View>

                            <View style={styles.cardDetails}>
                                <Text style={styles.detailText}>📍 {item.city}</Text>
                                <Text style={styles.detailText}>💰 {item.price}</Text>
                                <Text style={styles.detailText}>⏰ {item.hours}</Text>
                            </View>
                        </View>
                    </Pressable>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    header: {
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#888',
        marginTop: 4,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        marginHorizontal: 20,
    },
    listContainer: {
        padding: 16,
        gap: 12,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    cardContent: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a1a1a',
        flex: 1,
    },
    availabilityBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    availabilityText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 12,
    },
    cardDetails: {
        gap: 8,
    },
    detailText: {
        fontSize: 13,
        color: '#666',
    },
});
