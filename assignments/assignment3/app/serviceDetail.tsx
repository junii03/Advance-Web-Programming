import { Text, View, StyleSheet, ScrollView, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from "expo-router";
import { useState, useMemo } from "react";
import { servicesData } from '../constants/services'


const ServiceDetail = () => {
  const { serviceId } = useLocalSearchParams();

  const service = useMemo(() => {
    return servicesData.find((s) => s.id === serviceId);
  }, [serviceId]);

  const [isFavorite, setIsFavorite] = useState(service?.isFavorite ?? false);

  if (!service) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Service not found</Text>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleBookAppointment = () => {};

  const handleCall = () => {};

  const handleOpenMaps = () => {};

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} scrollEventThrottle={16}>
        {/* Service Image - extends behind header */}
        <View style={styles.imageContainer}>
          <Image
            source={service.image}
            style={styles.serviceImage}
          />
        </View>

        {/* Service Info Card */}
        <View style={styles.infoCard}>
          {/* Title and Rating */}
          <View style={styles.titleSection}>
            <View>
              <Text style={styles.serviceName}>{service.name}</Text>
              <View style={styles.ratingContainer}>
                <MaterialCommunityIcons name="star" size={18} color="#fbbf24" />
                <Text style={styles.rating}>{service.rating}</Text>
              </View>
            </View>
          </View>

          {/* Status and Category */}
          <View style={styles.badgesContainer}>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{service.status}</Text>
            </View>
            <View style={styles.categoryBadge}>
              <MaterialCommunityIcons name="bookmark" size={14} color="#de7973" />
              <Text style={styles.categoryText}>{service.category}</Text>
            </View>
          </View>

          {/* Distance */}
          <View style={styles.distanceContainer}>
            <MaterialCommunityIcons name="map-marker-outline" size={16} color="#9ca3af" />
            <Text style={styles.distanceText}>{service.distance}</Text>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>{service.about}</Text>
        </View>

        {/* Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>

          {/* Book Appointment Button */}
          <View style={styles.buttonRow}>
            <Pressable
              style={styles.bookButton}
              onPress={handleBookAppointment}
            >
              <MaterialCommunityIcons name="calendar-check" size={20} color="#FFFFFF" />
              <Text style={styles.bookButtonText}>Book Appointment</Text>
            </Pressable>
            <Pressable style={styles.messageButton}>
              <MaterialCommunityIcons name="message-outline" size={20} color="#de7973" />
            </Pressable>
          </View>

          {/* Hours */}
          <View style={styles.detailBox}>
            <MaterialCommunityIcons name="clock-outline" size={20} color="#de7973" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Hours</Text>
              <Text style={styles.detailValue}>{service.hours.weekday}</Text>
              <Text style={styles.detailSubValue}>{service.hours.weekend}</Text>
            </View>
          </View>

          {/* Contact */}
          <View style={styles.detailBox}>
            <MaterialCommunityIcons name="phone-outline" size={20} color="#de7973" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Contact</Text>
              <Text style={styles.detailValue}>{service.contact}</Text>
            </View>
            <Pressable onPress={handleCall}>
              <Text style={styles.callButton}>Call</Text>
            </Pressable>
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>

          {/* Map Placeholder */}
          <View style={styles.mapContainer}>
            <Image style={styles.mapPlaceholder} source={require('../assets/images/map.jpeg')}/>
            <Pressable
              style={styles.openMapsButton}
              onPress={handleOpenMaps}
            >
              <Feather name="navigation" size={18} color="#FFFFFF" />
              <Text style={styles.openMapsButtonText}>Open in Maps</Text>
            </Pressable>
          </View>

          {/* Location Address */}
          <Text style={styles.locationAddress}>{service.location}</Text>
        </View>
      </ScrollView>

      {/* Fixed Header  */}

      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <View style={styles.iconButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </View>
        </Pressable>
        <View style={styles.headerRightButtons}>
          <Pressable onPress={() => setIsFavorite(!isFavorite)}>
            <View style={styles.iconButton}>
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={24}
                color={isFavorite ? '#de7973' : '#FFFFFF'}
              />
            </View>
          </Pressable>
          <Pressable>
            <View style={styles.iconButton}>
              <Ionicons name="share-social-outline" size={24} color="#FFFFFF" />
            </View>
          </Pressable>
        </View>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1419',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#de7973',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 40,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRightButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  imageContainer: {
    height: 320,
    backgroundColor: '#1e293b',
    marginHorizontal: 0,
    marginBottom: 0,
    borderRadius: 0,
    overflow: 'hidden',
  },
  serviceImage: {
    width: '100%',
    height: '100%',
  },
  infoCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    marginTop: 20,
  },
  titleSection: {
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rating: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10b981',
    letterSpacing: 0.5,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#de7973',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  distanceText: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '400',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    color: '#d1d5db',
    fontWeight: '400',
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  bookButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#de7973',
    paddingVertical: 14,
    borderRadius: 12,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  messageButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  detailSubValue: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '400',
  },
  callButton: {
    fontSize: 14,
    fontWeight: '700',
    color: '#de7973',
  },
  mapContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  mapPlaceholder: {
    width: '100%',
    height: 240,
    resizeMode: 'cover',
    backgroundColor: '#b0b8c1',
    borderRadius: 12,
    marginBottom: 12,
  },
  openMapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#de7973',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: 'center',
  },
  openMapsButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  locationAddress: {
    fontSize: 14,
    color: '#d1d5db',
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 32,
  },
});

export default ServiceDetail;
