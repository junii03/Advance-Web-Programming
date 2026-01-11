import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    ListRenderItem,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { DestinationCard } from '../components/Cards';
import { colors } from '../styles/colors';
import { commonStyles } from '../styles/common';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';
import { SAMPLE_DESTINATIONS } from '../utils/constants';

interface DestinationItem {
  id: string;
  name: string;
  region: string;
  country: string;
}

/**
 * DestinationsScreen - Display list of destinations using FlatList
 * FlatList is preferred over ScrollView for large datasets because:
 * - It renders only visible items (virtualization)
 * - Better memory usage for large lists
 * - Smooth scrolling performance
 * - Built-in support for refresh, pagination, etc.
 */
export default function DestinationsScreen() {
  const router = useRouter();
  const [loading] = useState(false);
  const [destinations] = useState<DestinationItem[]>(SAMPLE_DESTINATIONS);

  // Key extractor for FlatList - ensures unique keys
  const keyExtractor = (item: DestinationItem) => item.id;

  // Render each destination item
  const renderDestination: ListRenderItem<DestinationItem> = ({ item }) => (
    <DestinationCard
      name={`${item.name}, ${item.country}`}
      onPress={() => {
        // Navigate to destination details
        router.push({
          pathname: '/destination-details',
          params: {
            name: encodeURIComponent(`${item.name}, ${item.region}`),
            description: encodeURIComponent(`A beautiful destination in ${item.region}, ${item.country}. Popular attractions include historic sites, cultural landmarks, and local cuisines.`),
            type: 'general',
            comments: 'This is a sample destination from our curated list. Explore more to discover detailed travel information.',
          },
        });
      }}
    />
  );

  // Empty list component
  const renderEmptyList = () => (
    <View style={commonStyles.centerFlex}>
      <Text style={styles.emptyText}>No destinations found</Text>
    </View>
  );

  // List header component
  const ListHeaderComponent = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.title}>Popular Destinations</Text>
      <Text style={styles.subtitle}>
        Discover amazing places around the world
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      {loading && (
        <View style={commonStyles.centerFlex}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {!loading && (
        <FlatList
          data={destinations}
          renderItem={renderDestination}
          keyExtractor={keyExtractor}
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={renderEmptyList}
          contentContainerStyle={styles.listContent}
          scrollIndicatorInsets={{ right: 1 }}
          showsVerticalScrollIndicator={true}
        />
      )}
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
  emptyText: {
    ...typography.body1,
    color: colors.textSecondary,
  },
});
