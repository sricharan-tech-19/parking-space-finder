/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of first point
 * @param lng1 Longitude of first point  
 * @param lat2 Latitude of second point
 * @param lng2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Filter parking spots within a given radius
 * @param userLat User's latitude
 * @param userLng User's longitude
 * @param parkingSpots Array of parking spots
 * @param radiusKm Search radius in kilometers
 * @returns Filtered parking spots with distances
 */
export function getNearbyParking(
    userLat: number,
    userLng: number,
    parkingSpots: any[],
    radiusKm: number = 5
) {
    return parkingSpots
        .map(spot => ({
            ...spot,
            distance: calculateDistance(
                userLat,
                userLng,
                spot.coords.latitude,
                spot.coords.longitude
            ),
        }))
        .filter(spot => spot.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance);
}
