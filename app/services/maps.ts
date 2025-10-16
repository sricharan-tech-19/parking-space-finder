// app/services/maps.ts
export type NearbyQuery = { lat: number; lng: number; radiusMeters?: number };

export async function getNearbyParkingSpots(_q: NearbyQuery) {
    // TODO: integrate Google Places / your API.
    return [];
}
