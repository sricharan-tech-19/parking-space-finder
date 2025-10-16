export interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
}

// Mock data that always works - now includes Chennai
const MOCK_LOCATIONS: NominatimResult[] = [
  // Bangalore locations
  {
    place_id: 1,
    lat: '12.9716',
    lon: '77.5946',
    display_name: 'Bangalore, Karnataka, India',
  },
  {
    place_id: 2,
    lat: '12.9352',
    lon: '77.6245',
    display_name: 'Koramangala, Bangalore, Karnataka, India',
  },
  {
    place_id: 3,
    lat: '12.973',
    lon: '77.606',
    display_name: 'MG Road, Bangalore, Karnataka, India',
  },
  {
    place_id: 4,
    lat: '12.9784',
    lon: '77.6408',
    display_name: 'Indiranagar, Bangalore, Karnataka, India',
  },

  // Chennai locations
  {
    place_id: 5,
    lat: '13.0827',
    lon: '80.2707',
    display_name: 'Chennai, Tamil Nadu, India',
  },
  {
    place_id: 6,
    lat: '13.03581',
    lon: '80.27015',
    display_name: 'Ragtag, Chennai, Tamil Nadu, India',
  },
  {
    place_id: 7,
    lat: '13.141500109470506',
    lon: '80.22391809594305',
    display_name: 'Sricharan, Chennai, Tamil Nadu, India',
  },
  {
    place_id: 8,
    lat: '12.840866429530545',
    lon: '80.15344892080635',
    display_name: 'VIT Chennai, Vellore, Tamil Nadu, India',
  },
  {
    place_id: 9,
    lat: '13.0418',
    lon: '80.2341',
    display_name: 'T Nagar, Chennai, Tamil Nadu, India',
  },
  {
    place_id: 10,
    lat: '13.0475',
    lon: '80.2824',
    display_name: 'Marina Beach, Chennai, Tamil Nadu, India',
  },
  {
    place_id: 11,
    lat: '13.0569',
    lon: '80.2676',
    display_name: 'Express Avenue, Chennai, Tamil Nadu, India',
  },
];

export async function searchPlaces(query: string): Promise<NominatimResult[]> {
  console.log('Searching for:', query);

  const lowerQuery = query.toLowerCase();

  // Filter results based on query
  const results = MOCK_LOCATIONS.filter(location =>
    location.display_name.toLowerCase().includes(lowerQuery)
  );

  // If no specific match, return city-based results
  if (results.length === 0) {
    if (lowerQuery.includes('chen') || lowerQuery.includes('madras')) {
      return MOCK_LOCATIONS.filter(loc => loc.display_name.includes('Chennai'));
    }
    if (lowerQuery.includes('bang') || lowerQuery.includes('beng')) {
      return MOCK_LOCATIONS.filter(loc => loc.display_name.includes('Bangalore'));
    }

    // Return all locations if no city match
    return MOCK_LOCATIONS.slice(0, 5);
  }

  return results.slice(0, 5);
}

export async function reverseGeocode(lat: number, lng: number): Promise<NominatimResult | null> {
  // Determine if coordinates are in Chennai or Bangalore
  const isChennai = lat > 12.8 && lat < 13.2 && lng > 80.0 && lng < 80.3;
  const isBangalore = lat > 12.8 && lat < 13.1 && lng > 77.4 && lng < 77.8;

  let cityName = 'Unknown Location';
  if (isChennai) cityName = 'Chennai, Tamil Nadu';
  if (isBangalore) cityName = 'Bangalore, Karnataka';

  return {
    place_id: 999,
    lat: lat.toString(),
    lon: lng.toString(),
    display_name: `${cityName}, India`,
  };
}
