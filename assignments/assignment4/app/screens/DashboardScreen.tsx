import { useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function DashboardScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Welcome to TravelMate</Text>
        <Text style={styles.subtitle}>Plan your next adventure</Text>
      </View>

      {/* Quick Action Cards */}
      <View style={styles.cardsContainer}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/explore')}
        >
          <Text style={styles.cardText}>Explore{'\n'}Destinations</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/plan-trip')}
        >
          <Text style={styles.cardText}>Plan{'\n'}a Trip</Text>
        </TouchableOpacity>
      </View>

      {/* Featured Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Destinations</Text>
        <View style={styles.featuredList}>
          <View style={styles.featuredItem}>
            <Text style={styles.featuredItemText}>🗼 Paris</Text>
            <Text style={styles.featuredItemSubText}>City of Light</Text>
          </View>
          <View style={styles.featuredItem}>
            <Text style={styles.featuredItemText}>🗻 Tokyo</Text>
            <Text style={styles.featuredItemSubText}>Land of Rising Sun</Text>
          </View>
          <View style={styles.featuredItem}>
            <Text style={styles.featuredItemText}>🗽 New York</Text>
            <Text style={styles.featuredItemSubText}>The Big Apple</Text>
          </View>
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
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: '#e8f5e9',
    marginTop: 8,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
    gap: 20,
  },
  card: {
    width: 160,
    height: 120,
    backgroundColor: '#2196F3',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  featuredList: {
    gap: 12,
  },
  featuredItem: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  featuredItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  featuredItemSubText: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
});
