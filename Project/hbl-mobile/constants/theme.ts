/**
 * HBL Mobile Banking - Design System & Theme Configuration
 * Colors, typography, and spacing constants for the banking app
 */

import { Platform } from 'react-native';

// HBL Brand Colors
const primaryColor = '#DC143C'; // HBL Red
const primaryLight = '#FF6B6B';
const primaryDark = '#9C0E2E';

const secondaryColor = '#003366'; // Dark Blue
const accentColor = '#FFB81C'; // Gold

const successColor = '#10B981';
const warningColor = '#F59E0B';
const errorColor = '#EF4444';
const infoColor = '#3B82F6';

export const Colors = {
  light: {
    // Primary colors
    primary: primaryColor,
    primaryLight: primaryLight,
    primaryDark: primaryDark,

    // Secondary & Accent
    secondary: secondaryColor,
    accent: accentColor,

    // Status colors
    success: successColor,
    warning: warningColor,
    error: errorColor,
    info: infoColor,

    // Backgrounds
    background: '#FFFFFF',
    surface: '#F9FAFB',
    surfaceAlt: '#F3F4F6',

    // Text
    text: '#111827',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',

    // Borders
    border: '#E5E7EB',
    borderLight: '#F3F4F6',

    // Icons & Tabs
    icon: '#6B7280',
    tabIconDefault: '#6B7280',
    tabIconSelected: primaryColor,
  },
  dark: {
    // Primary colors
    primary: primaryLight,
    primaryLight: '#FF8C8C',
    primaryDark: '#C91E1E',

    // Secondary & Accent
    secondary: '#E5E7EB',
    accent: '#FCD34D',

    // Status colors
    success: '#6EE7B7',
    warning: '#FCD34D',
    error: '#FCA5A5',
    info: '#93C5FD',

    // Backgrounds
    background: '#111827',
    surface: '#1F2937',
    surfaceAlt: '#374151',

    // Text
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textTertiary: '#9CA3AF',

    // Borders
    border: '#4B5563',
    borderLight: '#374151',

    // Icons & Tabs
    icon: '#D1D5DB',
    tabIconDefault: '#D1D5DB',
    tabIconSelected: primaryLight,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Spacing constants
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Typography scale
export const FontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const LineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
};

// Border radius
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// Shadow styles
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
};
