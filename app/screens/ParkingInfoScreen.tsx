import { StyleSheet, Text, View } from 'react-native';

export default function ParkingInfoStandalone() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Parking Info (Standalone)</Text>
        </View>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, gap: 8, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 20, fontWeight: '600' },
});
