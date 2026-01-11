import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/Buttons';
import { Header } from '../components/Cards';
import { colors } from '../styles/colors';
import { commonStyles } from '../styles/common';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';

/**
 * TripHomeScreen - Home screen for trip navigation
 * Displays button to view trip details with stack navigation
 */
export default function TripHomeScreen() {
  const router = useRouter();

  const handleViewDetails = () => {
    // Navigate to trip details with ID parameter
    router.push('/(trip)/T202');
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={styles.content}>
        <Header
          title="My Trips"
          subtitle="Manage and view your travel plans"
        />

        {/* Trip Card */}
        <View style={styles.tripCard}>
          <View style={styles.tripHeader}>
            <Text style={styles.tripTitle}>European Adventure</Text>
            <Text style={styles.tripStatus}>Planned</Text>
          </View>

          <View style={styles.tripDetails}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>8 Days</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Travelers</Text>
              <Text style={styles.detailValue}>2 People</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Destinations</Text>
              <Text style={styles.detailValue}>3 Cities</Text>
            </View>
          </View>

          <PrimaryButton
            title="View Trip Details"
            onPress={handleViewDetails}
            style={styles.button}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  tripCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginTop: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tripTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
  },
  tripStatus: {
    ...typography.button,
    backgroundColor: colors.success,
    color: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 6,
    fontWeight: '600',
    overflow: 'hidden',
  },
  tripDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: spacing.lg,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  button: {
    marginTop: spacing.lg,
  },
});
