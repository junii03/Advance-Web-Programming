import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { ActionCard, Header } from '../components/Cards';
import { colors } from '../styles/colors';
import { commonStyles } from '../styles/common';
import { spacing } from '../styles/spacing';

/**
 * DashboardScreen - Home screen with quick action cards
 * Display "Explore Destinations" and "Plan a Trip" cards
 */
export default function DashboardScreen() {
  const router = useRouter();



  const handlePlanTrip = () => {
    // Navigate to Plan Trip
    router.push('/plan-trip');
  };

  const handleViewTrips = () => {
    // Navigate to Trip Home Screen
    router.push('/(trip)');
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView
        style={commonStyles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Header
          title="Welcome to TravelMate"
          subtitle="Explore the world with ease"
        />

        {/* Action Cards Container - Flexbox centered */}
        <View style={styles.cardsContainer}>

          <ActionCard
            title="Plan a Trip"
            icon="map"
            onPress={handlePlanTrip}
            color={colors.secondary}
          />
          <ActionCard
            title="View My Trips"
            icon="briefcase"
            onPress={handleViewTrips}
            color={colors.warning}
          />
        </View>

        {/* Featured Destination Info */}
        <View style={styles.infoSection}>
          <Header
            title="Start Your Adventure"
            subtitle="Discover amazing places and create unforgettable memories"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginVertical: spacing.xxl,
  },
  infoSection: {
    marginTop: spacing.xl,
  },
});
