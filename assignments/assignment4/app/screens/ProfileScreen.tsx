import React from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

// Sample achievements/badges data
const achievements = [
  { id: '1', name: 'Explorer', icon: '🌍' },
  { id: '2', name: 'Adventurer', icon: '🏔️' },
  { id: '3', name: 'Foodie', icon: '🍜' },
  { id: '4', name: 'Culture Enthusiast', icon: '🏛️' },
  { id: '5', name: 'Beach Lover', icon: '🏖️' },
  { id: '6', name: 'Mountain Climber', icon: '⛰️' },
];

export default function ProfileScreen() {
  const renderAchievement = ({ item }: { item: (typeof achievements)[0] }) => (
    <View style={styles.achievementItem}>
      <Text style={styles.achievementIcon}>{item.icon}</Text>
      <Text style={styles.achievementName}>{item.name}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        {/* Profile Picture Placeholder */}
        <View style={styles.profilePictureContainer}>
          <View style={styles.profilePicture}>
            <Text style={styles.profileInitial}>AJ</Text>
          </View>
        </View>

        {/* User Info */}
        <Text style={styles.name}>Ajay Journey</Text>
        <Text style={styles.username}>@ajayjourney</Text>

        {/* Bio */}
        <Text style={styles.bio}>
          Passionate traveler exploring the world, one destination at a time.
          Love meeting new people and trying local cuisines. 🌎✈️
        </Text>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Countries</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Trips</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>156</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
        </View>
      </View>

      {/* Achievements Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements & Badges</Text>
        <FlatList
          data={achievements}
          renderItem={renderAchievement}
          keyExtractor={(item) => item.id}
          numColumns={3}
          scrollEnabled={false}
          columnWrapperStyle={styles.achievementRow}
        />
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.aboutBox}>
          <Text style={styles.aboutLabel}>Joined</Text>
          <Text style={styles.aboutValue}>January 2023</Text>
        </View>
        <View style={styles.aboutBox}>
          <Text style={styles.aboutLabel}>Favorite Destination</Text>
          <Text style={styles.aboutValue}>Tokyo, Japan</Text>
        </View>
        <View style={styles.aboutBox}>
          <Text style={styles.aboutLabel}>Travel Style</Text>
          <Text style={styles.aboutValue}>Adventure & Culture</Text>
        </View>
      </View>

      {/* Recent Trips Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Trips</Text>
        <View style={styles.tripItem}>
          <Text style={styles.tripIcon}>✈️</Text>
          <View style={styles.tripContent}>
            <Text style={styles.tripName}>European Adventure</Text>
            <Text style={styles.tripDate}>June 2024</Text>
          </View>
        </View>
        <View style={styles.tripItem}>
          <Text style={styles.tripIcon}>🏖️</Text>
          <View style={styles.tripContent}>
            <Text style={styles.tripName}>Southeast Asia Tour</Text>
            <Text style={styles.tripDate}>May 2024</Text>
          </View>
        </View>
        <View style={styles.tripItem}>
          <Text style={styles.tripIcon}>🏔️</Text>
          <View style={styles.tripContent}>
            <Text style={styles.tripName}>Himalayan Trekking</Text>
            <Text style={styles.tripDate}>April 2024</Text>
          </View>
        </View>
      </View>

      {/* Extra spacing at bottom */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileHeader: {
    backgroundColor: 'white',
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#45a049',
  },
  profileInitial: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  username: {
    fontSize: 13,
    color: '#999',
    marginBottom: 12,
  },
  bio: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginHorizontal: 20,
    lineHeight: 18,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  achievementRow: {
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  achievementItem: {
    width: '30%',
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  achievementIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  achievementName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  aboutBox: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  aboutLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
    marginBottom: 4,
  },
  aboutValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  tripItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  tripIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  tripContent: {
    flex: 1,
  },
  tripName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  tripDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  bottomPadding: {
    height: 20,
  },
});
