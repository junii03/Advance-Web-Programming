import { Text, View, StyleSheet, ScrollView, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";
import {  useMemo } from "react";
import { servicesData } from '../constants/services';
import { quickActions } from "../constants/quickActions";


const Profile = () => {
  const studentData = {
    name: 'Junaid Afzal',
    registrationId: 'L1S23BSSE0001',
    semester: '06',
    department: 'SE',
  };

  // Get favorite services
  const favoriteServices = useMemo(() => {
    return servicesData.filter((service) => service.isFavorite);
  }, []);

  const handleTrackLive = () => {};
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Pressable
          onPress={()=>router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>My Profile</Text>
          <Pressable>
            <Ionicons name="settings" size={24} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarGlow}>
              <View style={styles.avatarContainer}>
                <Image
                  source={require("../assets/images/J.png")}
                  style={styles.avatarImage}
                />
              </View>
              {/* Online Indicator */}
              <View style={styles.onlineIndicator} />
            </View>
          </View>

          {/* Student Info */}
          <Text style={styles.studentName}>{studentData.name}</Text>
          <Text style={styles.registrationText}>Reg: {studentData.registrationId}</Text>

          {/* Info Boxes */}
          <View style={styles.infoBoxesContainer}>
            <View style={styles.infoBox}>
              <MaterialCommunityIcons name="book-education" size={20} color="#de7973" />
              <Text style={styles.infoLabel}>SEMESTER</Text>
              <Text style={styles.infoValue}>{studentData.semester}</Text>
            </View>
            <View style={styles.infoBox}>
              <MaterialCommunityIcons name="bus-school" size={20} color="#de7973" />
              <Text style={styles.infoLabel}>DEPT</Text>
              <Text style={styles.infoValue}>{studentData.department}</Text>
            </View>
          </View>
        </View>

        {/* My Top Pick Section */}
        {favoriteServices.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Top Pick</Text>
              <Pressable>
                <Text style={styles.changeButton}>Change</Text>
              </Pressable>
            </View>

            {/* Favorite Service Card */}
            {favoriteServices.map((service) => (
              <Pressable
                key={service.id}
                onPress={() =>
                  router.push({
                    pathname: '/serviceDetail',
                    params: { serviceId: service.id },
                  })
                }
              >
                <View style={styles.serviceCard}>
                  {/* Service Image */}
                  <Image
                    source={{ uri: service.image }}
                    style={styles.serviceImage}
                  />

                  {/* Active Badge */}
                  <View style={styles.activeBadge}>
                    <View style={styles.activeDot} />
                    <Text style={styles.activeText}>Active</Text>
                  </View>

                  {/* Service Info */}
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.serviceRoute}>{service.description}</Text>

                    {/* Arrival Time */}
                    <View style={styles.arrivalContainer}>
                      <Ionicons name="time-outline" size={16} color="#de7973" />
                      <Text style={styles.arrivalText}>Arrives in 5 mins</Text>
                    </View>

                    {/* Track Live Button */}
                    <Pressable
                      style={styles.trackButton}
                      onPress={handleTrackLive}
                    >
                      <Ionicons name="radio-button-on" size={18} color="#FFFFFF" />
                      <Text style={styles.trackButtonText}>Track Live</Text>
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <Pressable
                key={action.id}
                style={styles.quickActionButton}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: `${action.color}20` }]}>
                  <MaterialCommunityIcons
                    name={action.icon as any}
                    size={32}
                    color={action.color}
                  />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1419',
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
  },
  avatarSection: {
    marginBottom: 16,
    alignItems: 'center',
  },
  avatarGlow: {
    position: 'relative',
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#de7973',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e293b',
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10b981',
    borderWidth: 4,
    borderColor: 'rgba(30, 41, 59, 0.8)',
  },
  studentName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  registrationText: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 16,
  },
  infoBoxesContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  infoBox: {
    flex: 1,
    backgroundColor: 'rgba(15, 20, 25, 0.6)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  infoLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
    letterSpacing: 1,
  },
  infoValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  changeButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#de7973',
  },
  serviceCard: {
    margin: 10,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  serviceImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#1e293b',
  },
  activeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  activeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10b981',
  },
  serviceInfo: {
    padding: 16,
    gap: 8,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  serviceRoute: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '400',
  },
  arrivalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  arrivalText: {
    fontSize: 13,
    color: '#de7973',
    fontWeight: '600',
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#de7973',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  trackButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  quickActionsGrid: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: '40%',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default Profile;
