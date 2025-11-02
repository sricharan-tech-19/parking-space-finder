import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useFavorites } from '../../src/context/FavoritesContext';

type Params = {
    id?: string;
    name?: string;
    availability?: string;
    price?: string;
    hours?: string;
    lat?: string;
    lng?: string;
    distance?: string;
    city?: string;
};

export default function ParkingInfoScreen() {
    const params = useLocalSearchParams<Params>();
    const lat = params.lat ? Number(params.lat) : undefined;
    const lng = params.lng ? Number(params.lng) : undefined;

    // ✅ Add Favorites Hook
    const { isFavorite, addFavorite, removeFavorite } = useFavorites();
    const parkingId = params.id as string;

    // ✅ ADD STATE FOR HEART:
    const [isLiked, setIsLiked] = useState(isFavorite(parkingId));

    // ✅ ADD HEART HANDLER:
    const handleHeartPress = async () => {
        console.log('Heart pressed. ID:', parkingId, 'Currently Liked:', isLiked);

        try {
            if (isLiked) {
                console.log('Removing from favorites:', parkingId);
                await removeFavorite(parkingId);
                setIsLiked(false);
            } else {
                console.log('Adding to favorites:', parkingId);
                await addFavorite(parkingId);
                setIsLiked(true);
            }
        } catch (error) {
            console.error('Error updating favorite:', error);
            Alert.alert('Error', 'Could not update favorite');
        }
    };

    const openExternalMaps = () => {
        if (!lat || !lng) return;
        const url = Platform.select({
            ios: `http://maps.apple.com/?daddr=${lat},${lng}`,
            android: `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(params.name || 'Parking')})`,
            default: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
        });
        if (url) Linking.openURL(url);
    };

    const shareLocation = async () => {
        try {
            const shareMessage = `🚗 Found parking spot: ${params.name || 'Parking Location'}
      
📍 Location: ${params.city || 'Unknown City'}
🅿️ Available spots: ${params.availability || 'N/A'}
💰 Price: ${params.price || 'N/A'}
⏰ Hours: ${params.hours || 'N/A'}
${params.distance ? `📏 Distance: ${params.distance} km away` : ''}

📍 Coordinates: ${lat?.toFixed(4)}, ${lng?.toFixed(4)}
🗺️ Open in Maps: https://www.google.com/maps/search/?api=1&query=${lat},${lng}

Shared via Parking Finder App 🆓`;

            const result = await Share.share({
                message: shareMessage,
                title: `${params.name} - Parking Spot`,
                url: lat && lng ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` : undefined,
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    console.log('Shared via:', result.activityType);
                } else {
                    console.log('Shared successfully');
                }
            } else if (result.action === Share.dismissedAction) {
                console.log('Share dismissed');
            }
        } catch (error) {
            console.error('Error sharing:', error);
            Alert.alert('Share Error', 'Could not share the location. Please try again.');
        }
    };

    const copyCoordinates = async () => {
        if (!lat || !lng) {
            Alert.alert('Error', 'Coordinates not available');
            return;
        }

        try {
            const coordinates = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            await Share.share({
                message: `📍 ${params.name || 'Parking Location'} Coordinates: ${coordinates}`,
                title: 'Parking Coordinates',
            });
        } catch (error) {
            Alert.alert('Error', 'Could not copy coordinates');
        }
    };

    const getAvailabilityColor = (availability: string) => {
        const num = parseInt(availability || '0');
        if (num > 15) return '#4CAF50';
        if (num > 8) return '#FF9800';
        return '#F44336';
    };

    const getAvailabilityStatus = (availability: string) => {
        const num = parseInt(availability || '0');
        if (num > 15) return 'High Availability';
        if (num > 8) return 'Medium Availability';
        if (num > 0) return 'Low Availability';
        return 'Full';
    };

    const getCityFlag = (city: string) => {
        switch (city?.toLowerCase()) {
            case 'chennai': return '🏖️';
            case 'bangalore': return '🌳';
            default: return '🏙️';
        }
    };

    const getCityColor = (city: string) => {
        switch (city?.toLowerCase()) {
            case 'chennai': return '#FF6B35';
            case 'bangalore': return '#7B68EE';
            default: return '#666';
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View style={styles.headerIcon}>
                        <Ionicons name="car" size={40} color="#007AFF" />
                    </View>
                    <Pressable
                        onPress={handleHeartPress}
                        style={styles.heartButton}
                    >
                        <Text style={styles.heartIcon}>
                            {isLiked ? '❤️' : '🤍'}
                        </Text>
                    </Pressable>
                </View>
                <Text style={styles.title}>{params.name || 'Parking Details'}</Text>
                <Text style={styles.subtitle}>Parking Information</Text>
            </View>

            <View style={styles.infoGrid}>
                <View style={[styles.infoCard, styles.availabilityCard]}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="car-sport" size={28} color={getAvailabilityColor(params.availability || '0')} />
                        <Text style={styles.cardTitle}>Availability</Text>
                    </View>
                    <Text style={[styles.availabilityNumber, { color: getAvailabilityColor(params.availability || '0') }]}>
                        {params.availability || 'N/A'}
                    </Text>
                    <Text style={styles.availabilityText}>spots available</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getAvailabilityColor(params.availability || '0') }]}>
                        <Text style={styles.statusText}>
                            {getAvailabilityStatus(params.availability || '0')}
                        </Text>
                    </View>
                </View>

                <View style={styles.infoCard}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="cash" size={24} color="#4CAF50" />
                        <Text style={styles.cardTitle}>Price</Text>
                    </View>
                    <Text style={styles.cardValue}>{params.price || 'N/A'}</Text>
                    <Text style={styles.cardSubtext}>per hour</Text>
                </View>

                <View style={styles.infoCard}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="time" size={24} color="#FF9800" />
                        <Text style={styles.cardTitle}>Hours</Text>
                    </View>
                    <Text style={styles.cardValue}>{params.hours || 'N/A'}</Text>
                    <Text style={styles.cardSubtext}>operating hours</Text>
                </View>

                {params.city && (
                    <View style={styles.infoCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cityFlag}>{getCityFlag(params.city)}</Text>
                            <Text style={styles.cardTitle}>City</Text>
                        </View>
                        <Text style={[styles.cardValue, { color: getCityColor(params.city) }]}>
                            {params.city}
                        </Text>
                        <Text style={styles.cardSubtext}>location</Text>
                    </View>
                )}

                {params.distance && (
                    <View style={styles.infoCard}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="location" size={24} color="#9C27B0" />
                            <Text style={styles.cardTitle}>Distance</Text>
                        </View>
                        <Text style={styles.cardValue}>{params.distance} km</Text>
                        <Text style={styles.cardSubtext}>from your location</Text>
                    </View>
                )}

                {lat && lng && (
                    <Pressable
                        style={[styles.infoCard, styles.coordinatesCard]}
                        onPress={copyCoordinates}
                    >
                        <View style={styles.cardHeader}>
                            <Ionicons name="navigate" size={24} color="#FF5722" />
                            <Text style={styles.cardTitle}>Coordinates</Text>
                        </View>
                        <Text style={styles.coordinateText}>
                            {lat.toFixed(4)}, {lng.toFixed(4)}
                        </Text>
                        <Text style={styles.cardSubtext}>tap to share coordinates</Text>
                    </Pressable>
                )}
            </View>

            <View style={styles.buttonContainer}>
                <Pressable onPress={openExternalMaps} style={styles.navigateButton}>
                    <Ionicons name="navigate" size={20} color="white" />
                    <Text style={styles.buttonText}>Navigate to Parking</Text>
                </Pressable>

                <Pressable onPress={shareLocation} style={styles.shareButton}>
                    <Ionicons name="share" size={20} color="#007AFF" />
                    <Text style={styles.shareButtonText}>Share This Parking Spot</Text>
                </Pressable>
            </View>

            <View style={styles.quickActions}>
                <Text style={styles.quickActionsTitle}>Quick Actions</Text>
                <View style={styles.quickButtonsRow}>
                    <Pressable style={styles.quickButton} onPress={() => {
                        if (lat && lng) {
                            Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
                        }
                    }}>
                        <Ionicons name="map" size={20} color="#4285F4" />
                        <Text style={styles.quickButtonText}>Google Maps</Text>
                    </Pressable>

                    <Pressable style={styles.quickButton} onPress={shareLocation}>
                        <Ionicons name="share-social" size={20} color="#1DA1F2" />
                        <Text style={styles.quickButtonText}>Share Details</Text>
                    </Pressable>

                    <Pressable style={styles.quickButton} onPress={copyCoordinates}>
                        <Ionicons name="copy" size={20} color="#FF6B35" />
                        <Text style={styles.quickButtonText}>Copy Location</Text>
                    </Pressable>
                </View>
            </View>

            <View style={styles.additionalInfo}>
                <Text style={styles.additionalTitle}>Additional Information</Text>
                <View style={styles.infoRow}>
                    <Ionicons name="information-circle" size={16} color="#666" />
                    <Text style={styles.infoRowText}>
                        Prices may vary during peak hours and special events
                    </Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="time" size={16} color="#666" />
                    <Text style={styles.infoRowText}>
                        Availability updates in real-time
                    </Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="card" size={16} color="#666" />
                    <Text style={styles.infoRowText}>
                        Most locations accept both cash and digital payments
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa'
    },
    header: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 20,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 10,
    },
    heartButton: {
        padding: 12,
        backgroundColor: '#fff',
        borderRadius: 25,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    heartIcon: {
        fontSize: 32,
    },
    headerIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f0f8ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        color: '#1a1a1a',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        gap: 15
    },
    infoCard: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 16,
        width: '47%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        alignItems: 'center',
    },
    availabilityCard: {
        width: '100%',
        marginBottom: 10,
    },
    coordinatesCard: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#FF5722',
        borderStyle: 'dashed',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    cardValue: {
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        color: '#1a1a1a',
        marginBottom: 2,
    },
    cardSubtext: {
        fontSize: 11,
        color: '#888',
        textAlign: 'center'
    },
    availabilityNumber: {
        fontSize: 32,
        fontWeight: '800',
        textAlign: 'center',
        marginVertical: 8,
    },
    availabilityText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '600',
        textAlign: 'center',
    },
    cityFlag: {
        fontSize: 20,
    },
    coordinateText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FF5722',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    buttonContainer: {
        paddingHorizontal: 20,
        marginTop: 20,
        gap: 10,
    },
    navigateButton: {
        backgroundColor: '#007AFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 8,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    shareButton: {
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 8,
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600'
    },
    shareButtonText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '600'
    },
    quickActions: {
        margin: 20,
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    quickActionsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    quickButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        gap: 10,
    },
    quickButton: {
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#f8f9fa',
        flex: 1,
        gap: 4,
    },
    quickButtonText: {
        fontSize: 11,
        fontWeight: '500',
        color: '#333',
        textAlign: 'center',
    },
    additionalInfo: {
        margin: 20,
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    additionalTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
        gap: 8,
    },
    infoRowText: {
        fontSize: 13,
        color: '#666',
        flex: 1,
        lineHeight: 18,
    },
});
