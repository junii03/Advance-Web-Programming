import { useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function TripHomeScreen() {
  const router = useRouter();

  // Sample trip data
  const trips = [
    { id: 'T201', name: 'European Adventure', duration: '10 days' },
    { id: 'T202', name: 'Asian Exploration', duration: '14 days' },
    { id: 'T203', name: 'US Road Trip', duration: '7 days' },
  ];

  // Navigate to trip details with parameter
  const viewTripDetails = (tripId: string) => {
    router.push(`/trip/${tripId}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>My Trips</Text>
        <Text style={styles.subtitle}>Manage your upcoming adventures</Text>
      </View>

      <View style={styles.tripsContainer}>
        {trips.map((trip) => (
          <View key={trip.id} style={styles.tripCard}>
            <View style={styles.tripInfo}>
              <Text style={styles.tripName}>{trip.name}</Text>
              <Text style={styles.tripDuration}>Duration: {trip.duration}</Text>
              <Text style={styles.tripId}>Trip ID: {trip.id}</Text>
            </View>
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() => viewTripDetails(trip.id)}
            >
              <Text style={styles.detailsButtonText}>View Details</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#00BCD4',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 13,
    color: '#b2ebf2',
    marginTop: 5,
  },
  tripsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  tripCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tripInfo: {
    flex: 1,
  },
  tripName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  tripDuration: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  tripId: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  detailsButton: {
    backgroundColor: '#00BCD4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 12,
  },
  detailsButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
});
