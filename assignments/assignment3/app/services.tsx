import { Text, View, StyleSheet, FlatList, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import { router } from "expo-router";
import { servicesData , Service } from "../constants/services";


const Services = () => {

  const renderServiceItem = ({ item }: { item: Service }) => (
    <Pressable
      style={styles.serviceItem}
      onPress={()=>{router.push({
        pathname: '/serviceDetail',
        params: { serviceId: item.id}
      })}}
    >
      {/* Icon Container */}
      <View style={[styles.iconWrapper, { backgroundColor: `${item.color}30` }]}>
        <MaterialIcons
          name={item.icon as any}
          size={40}
          color={item.color}
        />
      </View>

      {/* Service Info */}
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{item.name}</Text>
        <Text style={styles.serviceDescription}>{item.description}</Text>
      </View>

      {/* Arrow Icon */}
      <Feather name="chevron-right" size={24} color="#6b7280" />
    </Pressable>
  );

  const renderHeader = () => (
    <View>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Campus Services</Text>
        <View style={styles.profileAvatar}>
          <Image source={require("../assets/images/J.png")} style={{
            width: 36,
            height: 36,
            borderRadius: 18,
          }} />
        </View>
      </View>

      {/* Student Hub Section */}
      <View style={styles.studentHubSection}>
        <Text style={styles.hubTitle}>Student Hub</Text>
      </View>

    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={servicesData}
        renderItem={renderServiceItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1419',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(59, 130, 246, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#de7973',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  studentHubSection: {
    marginBottom: 20,
  },
  hubTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  hubSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hubSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '400',
  },
  hubHighlight: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  trackContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  trackButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
  },
  trackButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  trackButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  trackButtonTextActive: {
    color: '#FFFFFF',
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
    gap: 16,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '400',
  },
});

export default Services;
