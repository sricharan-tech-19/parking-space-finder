import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import FreeSearchBar from '../../src/components/FreeSearchBar';
import { PARKING_LOCATIONS, Parking } from '../../src/data/parkingData';
import { NominatimResult } from '../../src/services/nominatim';
import { getNearbyParking } from '../../src/utils/distance';

export default function HomeScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [visibleParking, setVisibleParking] = useState<(Parking & { distance?: number })[]>(PARKING_LOCATIONS);
  const [searchLocation, setSearchLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <Text>Map view is not supported on web. Please use Expo Go or an emulator.</Text>
      </View>
    );
  }

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Default to Chennai (since you added Chennai locations)
        const defaultRegion = {
          latitude: 13.0827,
          longitude: 80.2707,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        };
        setRegion(defaultRegion);
        const nearby = getNearbyParking(13.0827, 80.2707, PARKING_LOCATIONS, 20);
        setVisibleParking(nearby);
        setLoading(false);
        return;
      }

      const last = await Location.getLastKnownPositionAsync();
      if (last) {
        const userCoords = { latitude: last.coords.latitude, longitude: last.coords.longitude };
        setUserLocation(userCoords);
        const r: Region = {
          ...userCoords,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        setRegion(r);
        setLoading(false);

        const nearby = getNearbyParking(userCoords.latitude, userCoords.longitude, PARKING_LOCATIONS, 20);
        setVisibleParking(nearby);

        setTimeout(() => mapRef.current?.animateToRegion(r, 500), 0);
        return;
      }

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const userCoords = { latitude: current.coords.latitude, longitude: current.coords.longitude };
      setUserLocation(userCoords);
      const r: Region = {
        ...userCoords,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      setRegion(r);
      setLoading(false);

      const nearby = getNearbyParking(userCoords.latitude, userCoords.longitude, PARKING_LOCATIONS, 20);
      setVisibleParking(nearby);

      setTimeout(() => mapRef.current?.animateToRegion(r, 500), 0);
    } catch {
      // Default to Chennai if location fails
      const defaultRegion = {
        latitude: 13.0827,
        longitude: 80.2707,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
      setRegion(defaultRegion);
      const nearby = getNearbyParking(13.0827, 80.2707, PARKING_LOCATIONS, 20);
      setVisibleParking(nearby);
      setLoading(false);
    }
  };

  const handlePlaceSelect = (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    const newRegion: Region = {
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };

    setSearchLocation({ latitude: lat, longitude: lng });
    setRegion(newRegion);

    const nearby = getNearbyParking(lat, lng, PARKING_LOCATIONS, 10);
    setVisibleParking(nearby);

    mapRef.current?.animateToRegion(newRegion, 1000);

    if (nearby.length === 0) {
      Alert.alert('No Parking Found', 'No parking spots found within 10km of this location.');
    }
  };

  const resetToUserLocation = () => {
    if (userLocation) {
      const r: Region = {
        ...userLocation,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      setRegion(r);
      setSearchLocation(null);

      const nearby = getNearbyParking(userLocation.latitude, userLocation.longitude, PARKING_LOCATIONS, 20);
      setVisibleParking(nearby);

      mapRef.current?.animateToRegion(r, 1000);
    } else {
      // If no user location, show all locations
      const defaultRegion = {
        latitude: 13.0827,
        longitude: 80.2707,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
      setRegion(defaultRegion);
      setSearchLocation(null);
      setVisibleParking(PARKING_LOCATIONS);
      mapRef.current?.animateToRegion(defaultRegion, 1000);
    }
  };

  const showAllLocations = () => {
    // Show both Chennai and Bangalore
    const allRegion: Region = {
      latitude: 12.9716, // Middle point between Chennai and Bangalore
      longitude: 78.5,
      latitudeDelta: 2.0,
      longitudeDelta: 2.0,
    };
    setRegion(allRegion);
    setSearchLocation(null);
    setVisibleParking(PARKING_LOCATIONS);
    mapRef.current?.animateToRegion(allRegion, 1000);
  };

  if (loading || !region) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Getting location…</Text>
      </View>
    );
  }

  const uniqueCities = [...new Set(visibleParking.map(p => p.city))];

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <FreeSearchBar onPlaceSelect={handlePlaceSelect} />

        <View style={styles.buttonContainer}>
          {(searchLocation || userLocation) && (
            <Text
              style={styles.actionButton}
              onPress={resetToUserLocation}
            >
              📍 My Location
            </Text>
          )}

          <Text
            style={[styles.actionButton, styles.showAllButton]}
            onPress={showAllLocations}
          >
            🗺️ Show All Cities
          </Text>
        </View>
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {visibleParking.map((parking) => (
          <Marker
            key={parking.id}
            coordinate={parking.coords}
            title={parking.name}
            description={`${parking.availability} spots • ${parking.price} • ${parking.city}${parking.distance ? ` • ${parking.distance.toFixed(1)}km away` : ''}`}
            pinColor={parking.availability > 15 ? 'green' : parking.availability > 8 ? 'orange' : 'red'}
            onPress={() =>
              router.push({
                pathname: '/parking-info',
                params: {
                  id: parking.id,
                  name: parking.name,
                  availability: String(parking.availability),
                  price: parking.price,
                  hours: parking.hours,
                  city: parking.city,
                  lat: String(parking.coords.latitude),
                  lng: String(parking.coords.longitude),
                  distance: parking.distance ? String(parking.distance.toFixed(1)) : undefined,
                },
              })
            }
          />
        ))}
      </MapView>

      <View style={styles.infoBar}>
        <Text style={styles.infoText}>
          🆓 FREE • Showing {visibleParking.length} parking spots
          {searchLocation ? ' near searched location' : userLocation ? ' near you' : ''}
        </Text>
        <Text style={styles.cityInfo}>
          Cities: {uniqueCities.join(', ')} • Total: {PARKING_LOCATIONS.length} spots
        </Text>
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: 'green' }]} />
            <Text style={styles.legendText}>15+ spots</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: 'orange' }]} />
            <Text style={styles.legendText}>8-15 spots</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: 'red' }]} />
            <Text style={styles.legendText}>1-8 spots</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 8, fontSize: 16 },
  searchContainer: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    zIndex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    color: 'white',
    textAlign: 'center',
    padding: 8,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  showAllButton: {
    backgroundColor: '#34C759',
  },
  map: { flex: 1 },
  infoBar: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.85)',
    padding: 12,
    borderRadius: 12,
  },
  infoText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  cityInfo: {
    color: 'white',
    textAlign: 'center',
    fontSize: 11,
    marginTop: 4,
    opacity: 0.9,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: 'white',
    fontSize: 10,
    opacity: 0.8,
  },
});
