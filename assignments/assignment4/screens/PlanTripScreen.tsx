import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { PrimaryButton } from '../components/Buttons';
import { Header } from '../components/Cards';
import { colors } from '../styles/colors';
import { commonStyles } from '../styles/common';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';

/**
 * PlanTripScreen - Trip planning form with traveler count input
 * Demonstrates useState, onPress, and onChangeText event handling
 */
export default function PlanTripScreen() {
  const [tripName] = useState('European Adventure');
  const [travelers, setTravelers] = useState('1');

  // Handle add to trips button press
  const handleAddTrip = () => {
    if (!travelers || parseInt(travelers) <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid number of travelers');
      return;
    }

    // Show confirmation alert
    Alert.alert(
      'Trip Created',
      `Added ${travelers} traveler${parseInt(travelers) > 1 ? 's' : ''} for ${tripName}`,
      [{ text: 'OK', onPress: () => setTravelers('1') }]
    );
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
          title="Plan Your Trip"
          subtitle="Create and manage your travel plans"
        />

        {/* Trip Details Card */}
        <View style={styles.card}>
          <Text style={styles.tripName}>{tripName}</Text>
          <Text style={styles.tripDescription}>
            Explore the best of Europe with our curated itinerary
          </Text>
        </View>

        {/* Input Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Number of Travelers</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter number of travelers"
            keyboardType="number-pad"
            value={travelers}
            onChangeText={setTravelers}
            placeholderTextColor={colors.textLight}
          />
          <Text style={styles.helperText}>
            {travelers ? `${travelers} traveler${parseInt(travelers) > 1 ? 's' : ''} selected` : 'Enter a number'}
          </Text>
        </View>

        {/* Trip Highlights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Highlights</Text>
          <View style={styles.highlightItem}>
            <Text style={styles.highlightIcon}>📍</Text>
            <Text style={styles.highlightText}>Paris - 3 days</Text>
          </View>
          <View style={styles.highlightItem}>
            <Text style={styles.highlightIcon}>📍</Text>
            <Text style={styles.highlightText}>Amsterdam - 2 days</Text>
          </View>
          <View style={styles.highlightItem}>
            <Text style={styles.highlightIcon}>📍</Text>
            <Text style={styles.highlightText}>Berlin - 3 days</Text>
          </View>
        </View>

        {/* Add to Trips Button */}
        <PrimaryButton
          title="Add to My Trips"
          onPress={handleAddTrip}
          style={styles.button}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  tripName: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  tripDescription: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  label: {
    ...typography.button,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  helperText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.backgroundDark,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  highlightIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  highlightText: {
    ...typography.body2,
    color: colors.text,
    flex: 1,
  },
  button: {
    marginBottom: spacing.xl,
  },
});
