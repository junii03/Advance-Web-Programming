import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface DestinationItem {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export default function DestinationFeedScreen() {
  const [destinations, setDestinations] = useState<DestinationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch destinations from API using useEffect
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setIsLoading(true);
        // Using fetch instead of axios to keep dependencies minimal
        const response = await fetch(
          'https://jsonplaceholder.typicode.com/posts'
        );
        if (!response.ok) {
          throw new Error('Failed to fetch destinations');
        }
        const data = await response.json();
        // Take first 10 items for display
        setDestinations(data.slice(0, 10));
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An error occurred'
        );
        setDestinations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  // Render each destination item from API
  const renderDestination = ({ item }: { item: DestinationItem }) => (
    <View style={styles.destinationItem}>
      <View style={styles.destinationHeader}>
        <Text style={styles.destinationId}>#{item.id}</Text>
        <Text style={styles.destinationUserId}>By User {item.userId}</Text>
      </View>
      <Text style={styles.destinationTitle}>{item.title}</Text>
      <Text style={styles.destinationBody} numberOfLines={2}>
        {item.body}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Travel Tips & Recipes</Text>
        <Text style={styles.subtitle}>Curated travel guides & local recipes</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6F00" />
          <Text style={styles.loadingText}>Fetching travel tips...</Text>
        </View>
      ) : error ? (
        <ScrollView style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Unable to load destinations</Text>
          <Text style={styles.errorText}>{error}</Text>
        </ScrollView>
      ) : (
        <FlatList
          data={destinations}
          renderItem={renderDestination}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#FF6F00',
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
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6F00',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  destinationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  destinationId: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF6F00',
  },
  destinationUserId: {
    fontSize: 11,
    color: '#999',
  },
  destinationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  destinationBody: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f44336',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
