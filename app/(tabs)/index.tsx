import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import FreeSearchBar from '../../src/components/FreeSearchBar';
import { useFavorites } from '../../src/context/FavoritesContext';
import { PARKING_LOCATIONS } from '../../src/data/parkingData'; // ← ADD THIS
import { parkingAPI } from '../../src/services/api';
import { NominatimResult } from '../../src/services/nominatim';
import { calculateDistance } from '../../src/utils/distance';

export default function HomeScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);

  // State
  const [region, setRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [visibleParking, setVisibleParking] = useState<any[]>([]);
  const [searchLocation, setSearchLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Filters
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterPrice, setFilterPrice] = useState<'all' | 'under40' | 'under60'>('all');
  const [filterDistance, setFilterDistance] = useState<number>(20);
  const [filterAvailability, setFilterAvailability] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Favorites
  const { isFavorite } = useFavorites();
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // ✅ Fetch from MongoDB Backend
  const fetchParkings = async () => {
    try {
      setLoading(true);
      console.log('🔗 Fetching from MongoDB...');

      const response = await parkingAPI.getAll();

      if (response.data.success && response.data.data.length > 0) {
        console.log(`✅ Fetched ${response.data.count} parkings from MongoDB`);
        setVisibleParking(response.data.data);
        await getUserLocation();
      } else {
        throw new Error('No data from backend');
      }
    } catch (error) {
      console.error('❌ Error fetching from MongoDB:', error);
      Alert.alert('Connection Error', 'Make sure backend is running on port 5000');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParkings();
  }, []);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        const defaultRegion = {
          latitude: 12.9716,
          longitude: 78.5,
          latitudeDelta: 2.0,
          longitudeDelta: 2.0,
        };
        setRegion(defaultRegion);
        setLoading(false);
        return;
      }

      const last = await Location.getLastKnownPositionAsync();
      if (last) {
        const userCoords = { latitude: last.coords.latitude, longitude: last.coords.longitude };
        setUserLocation(userCoords);
        const r: Region = { ...userCoords, latitudeDelta: 0.05, longitudeDelta: 0.05 };
        setRegion(r);
        setLoading(false);
        setTimeout(() => mapRef.current?.animateToRegion(r, 500), 0);
        return;
      }

      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const userCoords = { latitude: current.coords.latitude, longitude: current.coords.longitude };
      setUserLocation(userCoords);
      const r: Region = { ...userCoords, latitudeDelta: 0.05, longitudeDelta: 0.05 };
      setRegion(r);
      setLoading(false);
      setTimeout(() => mapRef.current?.animateToRegion(r, 500), 0);
    } catch {
      const defaultRegion = {
        latitude: 12.9716,
        longitude: 78.5,
        latitudeDelta: 2.0,
        longitudeDelta: 2.0,
      };
      setRegion(defaultRegion);
      setLoading(false);
    }
  };

  // ✅ Filtered parking with useMemo
  const filteredParking = useMemo(() => {
    let list = visibleParking;

    if (showFavoritesOnly) {
      // Map MongoDB _id to static id and check if favorite
      list = list.filter(p => {
        const staticParking = PARKING_LOCATIONS.find(sp =>
          sp.name === p.name && sp.city === p.city
        );
        const staticId = staticParking?.id;
        return staticId && isFavorite(staticId);
      });
    }

    if (filterPrice === 'under40') {
      list = list.filter(p => parseInt(p.price.replace(/\D/g, '')) <= 40);
    } else if (filterPrice === 'under60') {
      list = list.filter(p => parseInt(p.price.replace(/\D/g, '')) <= 60);
    }

    if (userLocation && filterDistance < 20) {
      list = list.filter(p =>
        calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          p.coords.latitude,
          p.coords.longitude
        ) <= filterDistance
      );
    }

    if (filterAvailability === 'high') {
      list = list.filter(p => p.availability > 10);
    } else if (filterAvailability === 'medium') {
      list = list.filter(p => p.availability > 5 && p.availability <= 10);
    } else if (filterAvailability === 'low') {
      list = list.filter(p => p.availability <= 5);
    }

    if (searchLocation) {
      list = list.filter(p =>
        calculateDistance(
          searchLocation.latitude,
          searchLocation.longitude,
          p.coords.latitude,
          p.coords.longitude
        ) <= 10
      );
    }

    return list;
  }, [filterPrice, filterDistance, filterAvailability, userLocation, searchLocation, showFavoritesOnly, isFavorite, visibleParking]);

  const handlePlaceSelect = (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const newRegion: Region = { latitude: lat, longitude: lng, latitudeDelta: 0.05, longitudeDelta: 0.05 };
    setSearchLocation({ latitude: lat, longitude: lng });
    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 1000);
  };

  const resetToUserLocation = () => {
    if (userLocation) {
      const r: Region = { ...userLocation, latitudeDelta: 0.05, longitudeDelta: 0.05 };
      setRegion(r);
      setSearchLocation(null);
      mapRef.current?.animateToRegion(r, 1000);
    } else {
      const defaultRegion = { latitude: 12.9716, longitude: 78.5, latitudeDelta: 2.0, longitudeDelta: 2.0 };
      setRegion(defaultRegion);
      setSearchLocation(null);
      mapRef.current?.animateToRegion(defaultRegion, 1000);
    }
  };

  const showAllLocations = () => {
    const allRegion: Region = { latitude: 12.9716, longitude: 78.5, latitudeDelta: 2.0, longitudeDelta: 2.0 };
    setRegion(allRegion);
    setSearchLocation(null);
    mapRef.current?.animateToRegion(allRegion, 1000);
  };

  if (loading || !region) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading from MongoDB…</Text>
      </View>
    );
  }

  const uniqueCities = [...new Set(filteredParking.map(p => p.city))];

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <FreeSearchBar onPlaceSelect={handlePlaceSelect} />
        <View style={styles.buttonContainer}>
          {(searchLocation || userLocation) && (
            <Text style={styles.actionButton} onPress={resetToUserLocation}>
              📍 My Location
            </Text>
          )}

          <Pressable
            onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
            style={[styles.actionButton, showFavoritesOnly && { backgroundColor: '#FF6B6B' }]}
          >
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 12 }}>
              {showFavoritesOnly ? '❤️ Fav' : '🤍 All'}
            </Text>
          </Pressable>

          <Text style={[styles.actionButton, styles.showAllButton]} onPress={showAllLocations}>
            🗺️ All
          </Text>

          <Pressable onPress={() => setFiltersOpen(true)} style={styles.filterFab}>
            <Text style={styles.filterFabText}>⛭</Text>
          </Pressable>
        </View>
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {filteredParking.map((parking) => {
          // ✅ MAP MongoDB _id TO STATIC id
          const staticParking = PARKING_LOCATIONS.find(p =>
            p.name === parking.name && p.city === parking.city
          );
          const parkingId = staticParking?.id || parking._id;

          return (
            <Marker
              key={parking._id}
              coordinate={parking.coords}
              title={parking.name}
              description={`${parking.availability} spots • ${parking.price} • ${parking.city}`}
              pinColor={parking.availability > 15 ? 'green' : parking.availability > 8 ? 'orange' : 'red'}
              onPress={() =>
                router.push({
                  pathname: '/parking-info',
                  params: {
                    id: parkingId,  // ← STATIC ID
                    name: parking.name,
                    availability: String(parking.availability),
                    price: parking.price,
                    hours: parking.hours,
                    city: parking.city,
                    lat: String(parking.coords.latitude),
                    lng: String(parking.coords.longitude),
                  },
                })
              }
            />
          );
        })}
      </MapView>

      <View style={styles.infoBar}>
        <Text style={styles.infoText}>
          🆓 FREE • Showing {filteredParking.length} parking spots
        </Text>
        <Text style={styles.cityInfo}>
          Cities: {uniqueCities.join(', ')} • Total: {visibleParking.length} spots
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

      <Modal
        visible={filtersOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setFiltersOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setFiltersOpen(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Filters</Text>
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            <Text style={styles.groupTitle}>Price</Text>
            <View style={styles.row}>
              <Chip selected={filterPrice === 'all'} onPress={() => setFilterPrice('all')} label="All" />
              <Chip selected={filterPrice === 'under40'} onPress={() => setFilterPrice('under40')} label="Under ₹40" />
              <Chip selected={filterPrice === 'under60'} onPress={() => setFilterPrice('under60')} label="Under ₹60" />
            </View>

            <Text style={styles.groupTitle}>Distance</Text>
            <View style={styles.row}>
              <Chip selected={filterDistance === 5} onPress={() => setFilterDistance(5)} label="5 km" />
              <Chip selected={filterDistance === 10} onPress={() => setFilterDistance(10)} label="10 km" />
              <Chip selected={filterDistance === 20} onPress={() => setFilterDistance(20)} label="20 km" />
            </View>

            <Text style={styles.groupTitle}>Availability</Text>
            <View style={styles.row}>
              <Chip selected={filterAvailability === 'all'} onPress={() => setFilterAvailability('all')} label="All" />
              <Chip selected={filterAvailability === 'high'} onPress={() => setFilterAvailability('high')} label="High (10+)" />
              <Chip selected={filterAvailability === 'medium'} onPress={() => setFilterAvailability('medium')} label="Medium (5-10)" />
              <Chip selected={filterAvailability === 'low'} onPress={() => setFilterAvailability('low')} label="Low (≤5)" />
            </View>

            <View style={styles.sheetActions}>
              <Pressable
                style={[styles.sheetBtn, { backgroundColor: '#eee' }]}
                onPress={() => {
                  setFilterPrice('all');
                  setFilterDistance(20);
                  setFilterAvailability('all');
                }}
              >
                <Text style={{ color: '#333', fontWeight: '600' }}>Reset</Text>
              </Pressable>
              <Pressable
                style={[styles.sheetBtn, { backgroundColor: '#007AFF' }]}
                onPress={() => setFiltersOpen(false)}
              >
                <Text style={{ color: 'white', fontWeight: '700' }}>Apply</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

function Chip({ selected, onPress, label }: { selected: boolean; onPress: () => void; label: string }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 8, fontSize: 16 },
  searchContainer: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    zIndex: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    alignItems: 'center',
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
  filterFab: {
    backgroundColor: '#111',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
  },
  filterFabText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
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
    zIndex: 1,
  },
  infoText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 13,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '70%',
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  groupTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  chipSelected: {
    backgroundColor: '#007AFF',
  },
  chipText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 13,
  },
  chipTextSelected: {
    color: 'white',
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  sheetBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
});
