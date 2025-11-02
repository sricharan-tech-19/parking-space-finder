import { Stack } from 'expo-router';
import { FavoritesProvider } from '../src/context/FavoritesContext';
import { AuthProvider } from './context/AuthContext';
import { ParkingProvider } from './context/ParkingContext';


export default function RootLayout() {
    return (
        <AuthProvider>
            <ParkingProvider>
                <FavoritesProvider>
                    <Stack>
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Info' }} />
                    </Stack>
                </FavoritesProvider>
            </ParkingProvider>
        </AuthProvider>
    );
}
