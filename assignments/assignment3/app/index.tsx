import { Text, View, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';

export default function Welcome() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MaterialCommunityIcons name="school-outline" size={24} color="#de7973" />
            <Text style={styles.headerLabel}>L1S23BSSE0001</Text>
          </View>
          <Ionicons name="notifications-outline" size={24} color="#94a3b8" />
        </View>

        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          <View>
            <Text style={styles.greeting}>Good Morning,</Text>
            <Text style={styles.name}>Junaid</Text>
          </View>
          <Text style={styles.subtitle}>Here is your digital pass for today.</Text>
        </View>

        {/* Student Card */}
        <View style={styles.cardContainer}>
          {/* Card Top Border */}
          <View style={styles.cardTopBorder} />

          {/* Card Content */}
          <View style={styles.card}>
            {/* Profile Section */}
            <View style={styles.profileSection}>
              <View style={styles.profileImageContainer}>
                {/* Avatar Circle */}
                <View style={styles.avatar}>
                  <Image source={require("../assets/images/J.png")} style={{
                    width: 90,
                    height: 90,
                    borderRadius: 40,
                  }} />
                </View>
                {/* Online Status */}
                <View style={styles.statusIndicator} />
              </View>
            </View>

            {/* Student Info */}
            <Text style={styles.studentName}>Junaid Afzal</Text>
            <Text style={styles.degree}>B.Sc Software Engineering</Text>

            {/* Registration Section */}
            <View style={styles.registrationSection}>
              <View style={styles.registrationLeft}>
                <Text style={styles.registrationLabel}>REGISTRATION ID</Text>
                <Text style={styles.registrationId}>L1S23BSSE0001</Text>
              </View>
              <View style={styles.qrCodePlaceholder}>
                <Image source={require("../assets/images/qr.png")} style={{
                    width: 40,
                    height: 40,
                }} />
              </View>
            </View>

            {/* Stats Section */}
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <View style={styles.statContent}>
                  <MaterialCommunityIcons name="star" size={20} color="#de7973" />
                  <Text style={styles.statValue}>3.95</Text>
                </View>
                <Text style={styles.statLabel}>CGPA</Text>
              </View>

              <View style={styles.statBox}>
                <View style={styles.statContent}>
                  <Ionicons name="calendar-outline" size={20} color="#de7973" />
                  <Text style={styles.statValue}>06</Text>
                </View>
                <Text style={styles.statLabel}>Semester</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Button */}
        <TouchableOpacity style={styles.button}>
          <Feather name="grid" size={20} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>View Campus Services</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1419',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#de7973',
    letterSpacing: 1.5,
  },
  greetingSection: {
    marginBottom: 32,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  name: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#de7973',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '400',
  },
  cardContainer: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardTopBorder: {
    height: 4,
    backgroundColor: '#de7973',
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImageContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statusIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10b981',
    position: 'absolute',
    bottom: 10,
    right: 10,
    borderWidth: 3,
    borderColor: 'rgba(30, 41, 59, 0.8)',
  },
  studentName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  degree: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
  },
  registrationSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 20, 25, 0.6)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
  },
  registrationLeft: {
    flex: 1,
  },
  registrationLabel: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
  },
  registrationId: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  qrCodePlaceholder: {
    width: 56,
    height: 56,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(15, 20, 25, 0.6)',
    borderRadius: 12,
    padding: 16,
    borderColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  button: {
    backgroundColor: '#de7973',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
  },
  buttonIcon: {
    marginRight: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
