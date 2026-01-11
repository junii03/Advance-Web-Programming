import React from 'react';
import {
    FlatList,
    Image,
    ListRenderItem,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { colors } from '../styles/colors';
import { commonStyles } from '../styles/common';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';
import { SAMPLE_PROFILE } from '../utils/constants';

interface Badge {
  id: string;
  name: string;
  icon: string;
}

/**
 * ProfileScreen - User profile with scrollable badges
 * Displays profile info and achievements using ScrollView for long content
 */
export default function ProfileScreen() {
  const { name, bio, profileImage, badges } = SAMPLE_PROFILE;

  // Render badge item
  const renderBadge: ListRenderItem<Badge> = ({ item }) => (
    <View style={styles.badgeItem}>
      <Text style={styles.badgeIcon}>{item.icon}</Text>
      <Text style={styles.badgeName}>{item.name}</Text>
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView
        style={commonStyles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: profileImage }}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>{name}</Text>
          <Text style={styles.profileBio}>{bio}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Trips</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>28</Text>
            <Text style={styles.statLabel}>Cities</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>18</Text>
            <Text style={styles.statLabel}>Countries</Text>
          </View>
        </View>

        {/* Achievements/Badges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <FlatList
            data={badges}
            renderItem={renderBadge}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.badgeRow}
          />
        </View>

        {/* Bio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <View style={styles.bioCard}>
            <Text style={styles.bioText}>
              I am an adventurous traveler who loves exploring new cultures, trying local cuisines,
              and meeting people from around the world. With 12 completed trips across 18 countries,
              I am always planning the next adventure!
            </Text>
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Travel Preferences</Text>
          <View style={styles.preferenceTag}>
            <Text style={styles.preferenceText}>🏖️ Beach Destinations</Text>
          </View>
          <View style={styles.preferenceTag}>
            <Text style={styles.preferenceText}>🏛️ Historical Sites</Text>
          </View>
          <View style={styles.preferenceTag}>
            <Text style={styles.preferenceText}>🍽️ Food Tours</Text>
          </View>
          <View style={styles.preferenceTag}>
            <Text style={styles.preferenceText}>🚴 Adventure Sports</Text>
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.primary,
    marginBottom: spacing.lg,
  },
  profileName: {
    ...typography.h2,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  profileBio: {
    ...typography.body2,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: spacing.lg,
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '700',
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
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
  badgeRow: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  badgeItem: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  badgeName: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  bioCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  bioText: {
    ...typography.body2,
    color: colors.text,
    lineHeight: 22,
  },
  preferenceTag: {
    backgroundColor: colors.backgroundDark,
    borderRadius: 8,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  preferenceText: {
    ...typography.body2,
    color: colors.text,
    fontWeight: '500',
  },
});
