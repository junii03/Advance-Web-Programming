import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    ListRenderItem,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { colors } from '../styles/colors';
import { commonStyles } from '../styles/common';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';
import { Destination, fetchDestinations } from '../utils/api';

/**
 * DestinationFeedScreen - API Integration Example
 * Fetches destination data from travel API and displays with:
 * - Loading indicator while fetching
 * - Error handling with try-catch
 * - useEffect for API calls
 * - FlatList for displaying results
 * - Navigation to destination details on tap
 */
export default function DestinationFeedScreen() {
  const router = useRouter();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch destinations on component mount
  useEffect(() => {
    const loadDestinations = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchDestinations('London');
        setDestinations(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch destinations';
        setError(errorMessage);
        console.error('Error loading destinations:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDestinations();
  }, []);

  // Render each destination item
  const renderDestination: ListRenderItem<Destination> = ({ item }) => (
    <TouchableOpacity
      style={styles.destinationCard}
      onPress={() => {
        // Navigate to destination details with parameters
        router.push({
          pathname: '/destination-details',
          params: {
            name: encodeURIComponent(item.name),
            description: encodeURIComponent(item.description),
            type: item.type,
            comments: encodeURIComponent(item.comments),
            latitude: item.coordinates.latitude,
            longitude: item.coordinates.longitude,
          },
        });
      }}
      activeOpacity={0.8}
    >
      <View style={styles.typeIndicator}>
        <Text style={styles.typeTag}>{item.type.toUpperCase()}</Text>
      </View>
      <Text style={styles.destinationName}>{item.name}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>
      <Text style={styles.comments}>💡 {item.comments}</Text>
    </TouchableOpacity>
  );

  // List header component
  const ListHeaderComponent = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.title}>Discover London</Text>
      <Text style={styles.subtitle}>
        Explore historical, cultural, and culinary destinations
      </Text>
    </View>
  );

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={commonStyles.centerFlex}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading amazing destinations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={[commonStyles.centerFlex, styles.errorContainer]}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render destination list
  return (
    <SafeAreaView style={commonStyles.container}>
      <FlatList
        data={destinations}
        renderItem={renderDestination}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        ListHeaderComponent={ListHeaderComponent}
        contentContainerStyle={styles.listContent}
        scrollIndicatorInsets={{ right: 1 }}
        showsVerticalScrollIndicator={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  headerContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  destinationCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderTopWidth: 4,
    borderTopColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  typeIndicator: {
    marginBottom: spacing.md,
  },
  typeTag: {
    ...typography.caption,
    backgroundColor: colors.primaryLight,
    color: colors.primaryDark,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 4,
    fontWeight: '600',
    alignSelf: 'flex-start',
  },
  destinationName: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body2,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  comments: {
    ...typography.body2,
    color: colors.secondary,
    fontWeight: '500',
    backgroundColor: colors.secondaryLight,
    padding: spacing.md,
    borderRadius: 8,
    overflow: 'hidden',
  },
  loadingText: {
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
  errorContainer: {
    paddingHorizontal: spacing.lg,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  errorTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  errorMessage: {
    ...typography.body2,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
