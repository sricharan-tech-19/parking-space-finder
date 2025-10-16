import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NominatimResult, searchPlaces } from '../services/nominatim';

interface Props {
    onPlaceSelect: (result: NominatimResult) => void;
    placeholder?: string;
}

export default function FreeSearchBar({ onPlaceSelect, placeholder = 'Search location...' }: Props) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<NominatimResult[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (query.length > 2) {
                handleSearch();
            } else {
                setResults([]);
                setShowResults(false);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const searchResults = await searchPlaces(query);
            setResults(searchResults);
            setShowResults(searchResults.length > 0);
        } catch (error) {
            console.error('Search error:', error);
            setResults([]);
            setShowResults(false);
        }
        setLoading(false);
    };

    const handleSelectPlace = (result: NominatimResult) => {
        setQuery(result.display_name);
        setShowResults(false);
        onPlaceSelect(result);
    };

    const renderResult = ({ item }: { item: NominatimResult }) => (
        <TouchableOpacity style={styles.resultItem} onPress={() => handleSelectPlace(item)}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <Text style={styles.resultText} numberOfLines={2}>
                {item.display_name}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    value={query}
                    onChangeText={setQuery}
                    placeholder={placeholder}
                    placeholderTextColor="#999"
                />
                {loading && <Ionicons name="refresh" size={20} color="#007AFF" />}
            </View>

            {showResults && (
                <FlatList
                    data={results}
                    renderItem={renderResult}
                    keyExtractor={(item) => item.place_id.toString()}
                    style={styles.resultsList}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { zIndex: 1000 },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, fontSize: 16 },
    resultsList: {
        backgroundColor: 'white',
        borderRadius: 8,
        marginTop: 5,
        maxHeight: 200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    resultText: { marginLeft: 10, flex: 1, fontSize: 14 },
});
