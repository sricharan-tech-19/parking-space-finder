import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { PARKING_LOCATIONS } from '../../src/data/parkingData';

interface NominatimResult {
    lat: string;
    lon: string;
    display_name: string;
}

interface Props {
    onPlaceSelect: (result: NominatimResult) => void;
    placeholder?: string;
}

export default function FreeSearchBar({ onPlaceSelect, placeholder = 'Search parking...' }: Props) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [showResults, setShowResults] = useState(false);

    // ✅ SEARCH IN PARKING DATA (Not Nominatim)
    const handleSearch = (text: string) => {
        setQuery(text);

        if (text.trim().length === 0) {
            setResults([]);
            setShowResults(false);
            return;
        }

        // ✅ Filter parking by name or city
        const filteredParking = PARKING_LOCATIONS.filter(parking =>
            parking.name.toLowerCase().includes(text.toLowerCase()) ||
            parking.city.toLowerCase().includes(text.toLowerCase())
        );

        // ✅ Format results
        const formattedResults = filteredParking.map(p => ({
            lat: String(p.coords.latitude),
            lon: String(p.coords.longitude),
            display_name: `${p.name}, ${p.city}`,
            place_id: p.id,
            parking: p,
        }));

        setResults(formattedResults);
        setShowResults(formattedResults.length > 0);
    };

    const handleSelectPlace = (result: any) => {
        setQuery(result.display_name);
        setShowResults(false);
        onPlaceSelect({
            lat: result.lat,
            lon: result.lon,
            display_name: result.display_name,
        });
    };

    const renderResult = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.resultItem} onPress={() => handleSelectPlace(item)}>
            <Ionicons name="location-outline" size={20} color="#007AFF" />
            <View style={styles.resultContent}>
                <Text style={styles.resultTitle}>{item.parking.name}</Text>
                <Text style={styles.resultSubtitle}>
                    {item.parking.city} • {item.parking.price} • {item.parking.availability} spots
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    value={query}
                    onChangeText={handleSearch}
                    placeholder={placeholder}
                    placeholderTextColor="#999"
                />
                {query.length > 0 && (
                    <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setShowResults(false); }}>
                        <Ionicons name="close-circle" size={20} color="#999" />
                    </TouchableOpacity>
                )}
            </View>

            {showResults && results.length > 0 && (
                <FlatList
                    data={results}
                    renderItem={renderResult}
                    keyExtractor={(item) => item.place_id}
                    style={styles.resultsList}
                    scrollEnabled={results.length > 3}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {showResults && query.length > 0 && results.length === 0 && (
                <View style={styles.noResults}>
                    <Text style={styles.noResultsText}>No parking found</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        zIndex: 1000,
        position: 'relative',
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchIcon: {
        marginRight: 10
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    resultsList: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginTop: 5,
        maxHeight: 250,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    resultContent: {
        marginLeft: 10,
        flex: 1,
    },
    resultTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    resultSubtitle: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    noResults: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginTop: 5,
        padding: 16,
        alignItems: 'center',
    },
    noResultsText: {
        fontSize: 14,
        color: '#999',
    },
});
