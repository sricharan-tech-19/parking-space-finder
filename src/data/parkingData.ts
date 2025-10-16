export type Parking = {
    id: string;
    name: string;
    coords: { latitude: number; longitude: number };
    availability: number;
    price: string;
    hours: string;
    city: string;
};

export const PARKING_LOCATIONS: Parking[] = [
    // Bangalore locations (original 12)
    { id: 'blr1', name: 'MG Road Parking', coords: { latitude: 12.973, longitude: 77.606 }, availability: 8, price: '₹50/hr', hours: '8am - 10pm', city: 'Bangalore' },
    { id: 'blr2', name: 'Brigade Road Lot', coords: { latitude: 12.9716, longitude: 77.5946 }, availability: 3, price: '₹40/hr', hours: '9am - 9pm', city: 'Bangalore' },
    { id: 'blr3', name: 'Koramangala Plaza', coords: { latitude: 12.9352, longitude: 77.6245 }, availability: 12, price: '₹30/hr', hours: '24 hours', city: 'Bangalore' },
    { id: 'blr4', name: 'Indiranagar Metro', coords: { latitude: 12.9784, longitude: 77.6408 }, availability: 6, price: '₹35/hr', hours: '6am - 11pm', city: 'Bangalore' },
    { id: 'blr5', name: 'Whitefield Tech Park', coords: { latitude: 12.9698, longitude: 77.7500 }, availability: 25, price: '₹20/hr', hours: '24 hours', city: 'Bangalore' },
    { id: 'blr6', name: 'Electronic City', coords: { latitude: 12.8456, longitude: 77.6603 }, availability: 18, price: '₹25/hr', hours: '7am - 10pm', city: 'Bangalore' },
    { id: 'blr7', name: 'Jayanagar Shopping Complex', coords: { latitude: 12.9237, longitude: 77.5937 }, availability: 4, price: '₹45/hr', hours: '10am - 9pm', city: 'Bangalore' },
    { id: 'blr8', name: 'HSR Layout', coords: { latitude: 12.9082, longitude: 77.6476 }, availability: 9, price: '₹35/hr', hours: '24 hours', city: 'Bangalore' },
    { id: 'blr9', name: 'Malleshwaram Circle', coords: { latitude: 13.0067, longitude: 77.5667 }, availability: 2, price: '₹40/hr', hours: '8am - 8pm', city: 'Bangalore' },
    { id: 'blr10', name: 'Banashankari Temple', coords: { latitude: 12.9250, longitude: 77.5667 }, availability: 7, price: '₹30/hr', hours: '6am - 10pm', city: 'Bangalore' },
    { id: 'blr11', name: 'Silk Board Junction', coords: { latitude: 12.9165, longitude: 77.6222 }, availability: 15, price: '₹25/hr', hours: '24 hours', city: 'Bangalore' },
    { id: 'blr12', name: 'JP Nagar Metro', coords: { latitude: 12.9089, longitude: 77.5850 }, availability: 11, price: '₹35/hr', hours: '6am - 11pm', city: 'Bangalore' },

    // Chennai locations (10 new ones)
    { id: 'che1', name: 'Ragtag Parking', coords: { latitude: 13.03581, longitude: 80.27015 }, availability: 15, price: '₹40/hr', hours: '24 hours', city: 'Chennai' },
    { id: 'che2', name: 'Sricharan radiance', coords: { latitude: 13.141500109470506, longitude: 80.22391809594305 }, availability: 8, price: '₹35/hr', hours: '8am - 10pm', city: 'Chennai' },
    { id: 'che3', name: 'VIT Chennai Campus', coords: { latitude: 12.840866429530545, longitude: 80.15344892080635 }, availability: 50, price: '₹20/hr', hours: '24 hours', city: 'Chennai' },
    { id: 'che4', name: 'T Nagar Shopping District', coords: { latitude: 13.0418, longitude: 80.2341 }, availability: 6, price: '₹60/hr', hours: '10am - 10pm', city: 'Chennai' },
    { id: 'che5', name: 'Marina Beach Parking', coords: { latitude: 13.0475, longitude: 80.2824 }, availability: 20, price: '₹30/hr', hours: '6am - 11pm', city: 'Chennai' },
    { id: 'che6', name: 'Express Avenue Mall', coords: { latitude: 13.0569, longitude: 80.2676 }, availability: 12, price: '₹50/hr', hours: '10am - 11pm', city: 'Chennai' },
    { id: 'che7', name: 'Chennai Central Railway', coords: { latitude: 13.0827, longitude: 80.2707 }, availability: 35, price: '₹25/hr', hours: '24 hours', city: 'Chennai' },
    { id: 'che8', name: 'Anna Nagar Tower Park', coords: { latitude: 13.0850, longitude: 80.2101 }, availability: 10, price: '₹35/hr', hours: '6am - 10pm', city: 'Chennai' },
    { id: 'che9', name: 'OMR IT Corridor', coords: { latitude: 12.9171, longitude: 80.2275 }, availability: 30, price: '₹25/hr', hours: '24 hours', city: 'Chennai' },
    { id: 'che10', name: 'Velachery Bus Terminus', coords: { latitude: 12.9854, longitude: 80.2180 }, availability: 18, price: '₹30/hr', hours: '5am - 12am', city: 'Chennai' },
];

// Helper function to get parking by city
export function getParkingByCity(city: string): Parking[] {
    return PARKING_LOCATIONS.filter(parking =>
        parking.city.toLowerCase() === city.toLowerCase()
    );
}

// Helper function to get all cities
export function getAllCities(): string[] {
    return [...new Set(PARKING_LOCATIONS.map(parking => parking.city))];
}
