import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles/colors';
import { commonStyles } from '../styles/common';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';

/**
 * TripDetailsScreen - Display detailed trip information
 * Receives tripId parameter from navigation
 * Includes back button for returning to home
 */
export default function TripDetailsScreen() {
  const { id } = useLocalSearchParams();

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView
        style={commonStyles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Trip ID */}
        <View style={styles.headerSection}>
          <Text style={styles.tripId}>Trip ID: {id || 'Unknown'}</Text>
          <Text style={styles.title}>European Adventure Details</Text>
        </View>

        {/* Itinerary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Itinerary</Text>

          <View style={styles.itineraryItem}>
            <View style={styles.dayBadge}>
              <Text style={styles.dayText}>Day 1</Text>
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle}>Paris - Arrival</Text>
              <Text style={styles.itemDescription}>
                Check-in at hotel, explore the Eiffel Tower area
              </Text>
            </View>
          </View>

          <View style={styles.itineraryItem}>
            <View style={styles.dayBadge}>
              <Text style={styles.dayText}>Days 2-3</Text>
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle}>Paris - City Tour</Text>
              <Text style={styles.itemDescription}>
                Visit Louvre Museum, Notre-Dame Cathedral, Arc de Triomphe
              </Text>
            </View>
          </View>

          <View style={styles.itineraryItem}>
            <View style={styles.dayBadge}>
              <Text style={styles.dayText}>Days 4-5</Text>
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle}>Amsterdam</Text>
              <Text style={styles.itemDescription}>
                Canal tours, Van Gogh Museum, flower markets
              </Text>
            </View>
          </View>

          <View style={styles.itineraryItem}>
            <View style={styles.dayBadge}>
              <Text style={styles.dayText}>Days 6-8</Text>
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle}>Berlin</Text>
              <Text style={styles.itemDescription}>
                Brandenburg Gate, museums, vibrant nightlife
              </Text>
            </View>
          </View>
        </View>

        {/* Trip Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trip Summary</Text>

          <View style={styles.summaryItem}>
            <Ionicons name="people" size={24} color={colors.primary} />
            <View style={styles.summaryContent}>
              <Text style={styles.summaryLabel}>Travelers</Text>
              <Text style={styles.summaryValue}>2 People</Text>
            </View>
          </View>

          <View style={styles.summaryItem}>
            <Ionicons name="calendar" size={24} color={colors.secondary} />
            <View style={styles.summaryContent}>
              <Text style={styles.summaryLabel}>Duration</Text>
              <Text style={styles.summaryValue}>8 Days</Text>
            </View>
          </View>

          <View style={styles.summaryItem}>
            <Ionicons name="location" size={24} color={colors.info} />
            <View style={styles.summaryContent}>
              <Text style={styles.summaryLabel}>Destinations</Text>
              <Text style={styles.summaryValue}>3 Cities</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  headerSection: {
    marginBottom: spacing.xl,
  },
  tripId: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    fontWeight: '700',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  itineraryItem: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    paddingLeft: spacing.lg,
    borderLeftWidth: 2,
    borderLeftColor: colors.primary,
  },
  dayBadge: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 6,
    marginRight: spacing.lg,
    marginTop: spacing.xs,
  },
  dayText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    ...typography.body1,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  itemDescription: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.backgroundDark,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  summaryContent: {
    marginLeft: spacing.lg,
    flex: 1,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  summaryValue: {
    ...typography.body1,
    color: colors.text,
    fontWeight: '600',
  },
});
