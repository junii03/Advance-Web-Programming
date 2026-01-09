import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function TripDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Sample trip details data
  const tripDetails: { [key: string]: any } = {
    T201: {
      name: 'European Adventure',
      duration: '10 days',
      destination: 'Paris, Rome, Barcelona',
      travelers: 4,
      budget: '$5000',
      startDate: 'June 15, 2024',
      highlights: ['Eiffel Tower', 'Colosseum', 'Sagrada Familia'],
    },
    T202: {
      name: 'Asian Exploration',
      duration: '14 days',
      destination: 'Tokyo, Bangkok, Singapore',
      travelers: 3,
      budget: '$4000',
      startDate: 'July 20, 2024',
      highlights: ['Mount Fuji', 'Grand Palace', 'Marina Bay Sands'],
    },
    T203: {
      name: 'US Road Trip',
      duration: '7 days',
      destination: 'New York, Boston, Philadelphia',
      travelers: 5,
      budget: '$3000',
      startDate: 'August 1, 2024',
      highlights: ['Statue of Liberty', 'Freedom Trail', 'Liberty Bell'],
    },
  };

  const trip = tripDetails[id as string] || tripDetails.T201;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Trip Details</Text>
        <Text style={styles.subtitle}>Trip ID: {id}</Text>
      </View>

      <View style={styles.content}>
        {/* Trip Name */}
        <View style={styles.detailBox}>
          <Text style={styles.boxLabel}>Trip Name</Text>
          <Text style={styles.boxValue}>{trip.name}</Text>
        </View>

        {/* Duration */}
        <View style={styles.detailBox}>
          <Text style={styles.boxLabel}>Duration</Text>
          <Text style={styles.boxValue}>{trip.duration}</Text>
        </View>

        {/* Destination */}
        <View style={styles.detailBox}>
          <Text style={styles.boxLabel}>Destination</Text>
          <Text style={styles.boxValue}>{trip.destination}</Text>
        </View>

        {/* Travelers */}
        <View style={styles.detailBox}>
          <Text style={styles.boxLabel}>Number of Travelers</Text>
          <Text style={styles.boxValue}>{trip.travelers}</Text>
        </View>

        {/* Start Date */}
        <View style={styles.detailBox}>
          <Text style={styles.boxLabel}>Start Date</Text>
          <Text style={styles.boxValue}>{trip.startDate}</Text>
        </View>

        {/* Budget */}
        <View style={styles.detailBox}>
          <Text style={styles.boxLabel}>Budget</Text>
          <Text style={styles.boxValue}>{trip.budget}</Text>
        </View>

        {/* Highlights */}
        <View style={styles.detailBox}>
          <Text style={styles.boxLabel}>Highlights</Text>
          {trip.highlights.map((highlight: string, index: number) => (
            <Text key={index} style={styles.highlightText}>
              • {highlight}
            </Text>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Edit Trip</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.dangerButton]}>
            <Text style={styles.actionButtonText}>Cancel Trip</Text>
          </TouchableOpacity>
        </View>
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
    paddingVertical: 16,
    paddingTop: 10,
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 12,
    color: '#b2ebf2',
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  detailBox: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#00BCD4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  boxLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginBottom: 4,
  },
  boxValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  highlightText: {
    fontSize: 13,
    color: '#555',
    marginTop: 6,
    marginLeft: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 30,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#00BCD4',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
});
