import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';

interface ActionCardProps {
  title: string;
  icon: string;
  onPress: () => void;
  color?: string;
}

/**
 * ActionCard Component - A reusable card with title, icon, and onPress action
 * Used for dashboard quick actions
 */
export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  icon,
  onPress,
  color = colors.primary,
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, { borderTopColor: color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name={icon as any} size={32} color={color} />
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
};

interface DestinationCardProps {
  name: string;
  onPress: () => void;
}

/**
 * DestinationCard Component - Display destination with modern styling
 */
export const DestinationCard: React.FC<DestinationCardProps> = ({
  name,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.destinationCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.destinationContent}>
        <Text style={styles.destinationName}>{name}</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
};

interface HeaderProps {
  title: string;
  subtitle?: string;
}

/**
 * Header Component - Page header with title and optional subtitle
 */
export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>{title}</Text>
      {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 160,
    height: 120,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderTopWidth: 4,
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    ...typography.body2,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  destinationCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  destinationContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  destinationName: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  headerContainer: {
    marginBottom: spacing.xl,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    ...typography.body2,
    color: colors.textSecondary,
  },
});

export default { ActionCard, DestinationCard, Header };
