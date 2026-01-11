import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { colors } from '../styles/colors';
import { commonStyles } from '../styles/common';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';

interface DestinationDetailsParams {
  name: string;
  description: string;
  type: string;
  comments: string;
  latitude?: string;
  longitude?: string;
}

/**
 * DestinationDetailsScreen - Display detailed destination information
 * Shows full description, location, and travel tips
 */
export default function DestinationDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const destination: DestinationDetailsParams = {
    name: typeof params.name === 'string' ? decodeURIComponent(params.name) : 'Unknown',
    description: typeof params.description === 'string' ? decodeURIComponent(params.description) : 'No description available',
    type: typeof params.type === 'string' ? params.type : 'general',
    comments: typeof params.comments === 'string' ? decodeURIComponent(params.comments) : 'No comments available',
    latitude: typeof params.latitude === 'string' ? params.latitude : undefined,
    longitude: typeof params.longitude === 'string' ? params.longitude : undefined,
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'historical':
        return colors.primary;
      case 'cultural':
        return colors.secondary;
      case 'food':
        return '#FF9800';
      default:
        return colors.primary;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'historical':
        return 'home';
      case 'cultural':
        return 'library';
      case 'food':
        return 'restaurant';
      default:
        return 'information-circle';
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView
        style={commonStyles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={28} color={colors.primary} />
        </TouchableOpacity>

        {/* Type Badge */}
        <View style={[styles.typeBadge, { backgroundColor: getTypeColor(destination.type) }]}>
          <Ionicons
            name={getTypeIcon(destination.type) as any}
            size={24}
            color={colors.surface}
            style={{ marginRight: spacing.md }}
          />
          <Text style={styles.typeBadgeText}>{destination.type.toUpperCase()}</Text>
        </View>

        {/* Destination Name */}
        <Text style={styles.destinationName}>{destination.name}</Text>

        {/* Description Card */}
        <View style={styles.descriptionCard}>
          <Text style={styles.sectionTitle}>About This Destination</Text>
          <Text style={styles.descriptionText}>{destination.description}</Text>
        </View>

        {/* Location Information */}
        {(destination.latitude || destination.longitude) && (
          <View style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <Ionicons name="location" size={24} color={colors.primary} />
              <Text style={styles.locationTitle}>Location Coordinates</Text>
            </View>
            <View style={styles.coordinateRow}>
              <Text style={styles.coordinateLabel}>Latitude:</Text>
              <Text style={styles.coordinateValue}>{destination.latitude || 'N/A'}</Text>
            </View>
            <View style={styles.coordinateRow}>
              <Text style={styles.coordinateLabel}>Longitude:</Text>
              <Text style={styles.coordinateValue}>{destination.longitude || 'N/A'}</Text>
            </View>
          </View>
        )}

        {/* Travel Tips */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={24} color="#FF9800" />
            <Text style={styles.tipsTitle}>Travel Tips</Text>
          </View>
          <Text style={styles.tipsText}>{destination.comments}</Text>
        </View>

        {/* What to Do Section */}
        <View style={styles.activitiesCard}>
          <Text style={styles.sectionTitle}>Popular Activities</Text>
          <View style={styles.activityItem}>
            <Ionicons name="camera" size={20} color={colors.primary} />
            <Text style={styles.activityText}>Photography</Text>
          </View>
          <View style={styles.activityItem}>
            <Ionicons name="map" size={20} color={colors.secondary} />
            <Text style={styles.activityText}>Sightseeing</Text>
          </View>
          <View style={styles.activityItem}>
            <Ionicons name="restaurant" size={20} color="#FF9800" />
            <Text style={styles.activityText}>Local Dining</Text>
          </View>
        </View>

        {/* Best Time to Visit */}
        <View style={styles.bestTimeCard}>
          <Ionicons name="calendar" size={24} color={colors.info} />
          <View style={styles.bestTimeContent}>
            <Text style={styles.bestTimeTitle}>Best Time to Visit</Text>
            <Text style={styles.bestTimeText}>Spring (Mar-May) & Fall (Sep-Nov)</Text>
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
  backButton: {
    marginBottom: spacing.lg,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    marginBottom: spacing.lg,
    alignSelf: 'flex-start',
  },
  typeBadgeText: {
    ...typography.button,
    color: colors.surface,
    fontWeight: '600',
  },
  destinationName: {
    ...typography.h1,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.xl,
  },
  descriptionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  descriptionText: {
    ...typography.body1,
    color: colors.text,
    lineHeight: 24,
  },
  locationCard: {
    backgroundColor: colors.backgroundDark,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  locationTitle: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '600',
    marginLeft: spacing.md,
  },
  coordinateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  coordinateLabel: {
    ...typography.body2,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  coordinateValue: {
    ...typography.body2,
    color: colors.text,
    fontWeight: '600',
  },
  tipsCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderTopWidth: 3,
    borderTopColor: '#FF9800',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  tipsTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
    marginLeft: spacing.md,
  },
  tipsText: {
    ...typography.body1,
    color: colors.text,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  activitiesCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  activityText: {
    ...typography.body1,
    color: colors.text,
    marginLeft: spacing.lg,
    fontWeight: '500',
  },
  bestTimeCard: {
    backgroundColor: colors.info,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bestTimeContent: {
    marginLeft: spacing.lg,
    flex: 1,
  },
  bestTimeTitle: {
    ...typography.h4,
    color: colors.surface,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  bestTimeText: {
    ...typography.body2,
    color: colors.surface,
  },
});
