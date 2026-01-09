import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function PlanTripScreen() {
  const [travelers, setTravelers] = useState('');
  const tripName = 'European Adventure'; // Static trip name for the example

  // Handle "Add to My Trips" button press
  const handleAddTrip = () => {
    if (!travelers.trim()) {
      Alert.alert('Error', 'Please enter number of travelers');
      return;
    }

    const numTravelers = parseInt(travelers, 10);
    if (isNaN(numTravelers) || numTravelers <= 0) {
      Alert.alert('Error', 'Please enter a valid number');
      return;
    }

    Alert.alert(
      'Trip Added',
      `Added ${numTravelers} travelers for ${tripName}`,
      [{ text: 'OK', onPress: () => setTravelers('') }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Plan Your Trip</Text>
        <Text style={styles.subtitle}>Organize your next adventure</Text>
      </View>

      <View style={styles.formContainer}>
        {/* Trip Name Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Trip Name</Text>
          <View style={styles.tripNameBox}>
            <Text style={styles.tripNameText}>{tripName}</Text>
          </View>
        </View>

        {/* Travelers Input Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Number of Travelers</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter number of travelers"
            keyboardType="number-pad"
            value={travelers}
            onChangeText={setTravelers}
            placeholderTextColor="#999"
          />
          <Text style={styles.hint}>Enter the count of people traveling</Text>
        </View>

        {/* Info Section */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Trip Details</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoDot}>•</Text>
            <Text style={styles.infoText}>Destination: {tripName}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoDot}>•</Text>
            <Text style={styles.infoText}>
              Travelers: {travelers || '0'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoDot}>•</Text>
            <Text style={styles.infoText}>Accommodation included</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoDot}>•</Text>
            <Text style={styles.infoText}>Guide assistance available</Text>
          </View>
        </View>

        {/* Add to Trips Button */}
        <TouchableOpacity style={styles.button} onPress={handleAddTrip}>
          <Text style={styles.buttonText}>Add to My Trips</Text>
        </TouchableOpacity>
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
    backgroundColor: '#9C27B0',
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
    color: '#e1bee7',
    marginTop: 5,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  tripNameBox: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  tripNameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9C27B0',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#333',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
    fontStyle: 'italic',
  },
  infoBox: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  infoDot: {
    fontSize: 16,
    color: '#9C27B0',
    marginRight: 8,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  button: {
    backgroundColor: '#9C27B0',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
});
