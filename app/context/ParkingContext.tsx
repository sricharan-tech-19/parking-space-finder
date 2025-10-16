import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

export type ParkingItem = {
    id: string;
    name: string;
    coords: { latitude: number; longitude: number };
    availability: number;
    price: string;
    hours: string;
};

type ParkingContextType = {
    items: ParkingItem[];
    setItems: (v: ParkingItem[]) => void;
};

const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

export function ParkingProvider({ children }: PropsWithChildren) {
    const [items, setItems] = useState<ParkingItem[]>([]);
    const value = useMemo(() => ({ items, setItems }), [items]);
    return <ParkingContext.Provider value={value}>{children}</ParkingContext.Provider>;
}

export function useParking() {
    const ctx = useContext(ParkingContext);
    if (!ctx) throw new Error('useParking must be used within ParkingProvider');
    return ctx;
}

export default ParkingContext;
