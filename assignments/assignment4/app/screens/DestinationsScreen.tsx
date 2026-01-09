import React from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Sample destination data
const destinations = [
  { id: '1', name: 'Paris', country: 'France', description: 'City of Light & Love' },
  { id: '2', name: 'Tokyo', country: 'Japan', description: 'Modern & Traditional' },
  { id: '3', name: 'New York', country: 'USA', description: 'The Big Apple' },
  { id: '4', name: 'Barcelona', country: 'Spain', description: 'Art & Architecture' },
  { id: '5', name: 'Dubai', country: 'UAE', description: 'Luxury & Innovation' },
  { id: '6', name: 'Sydney', country: 'Australia', description: 'Beaches & Nature' },
  { id: '7', name: 'Rome', country: 'Italy', description: 'History & Culture' },
  { id: '8', name: 'Singapore', country: 'Singapore', description: 'Modern City State' },
];

export default function DestinationsScreen() {
  // Render each destination item
  const renderDestination = ({ item }: { item: (typeof destinations)[0] }) => (
    <TouchableOpacity style={styles.destinationItem}>
      <Text style={styles.destinationName}>{item.name}</Text>
      <Text style={styles.destinationCountry}>{item.country}</Text>
      <Text style={styles.destinationDesc}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Explore Destinations</Text>
        <Text style={styles.subtitle}>Discover amazing places around the world</Text>
      </View>

      <FlatList
        data={destinations}
        renderItem={renderDestination}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        scrollEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#FF9800',
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
    color: '#ffe0b2',
    marginTop: 5,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  destinationItem: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  destinationName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  destinationCountry: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
    marginTop: 4,
  },
  destinationDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
});
