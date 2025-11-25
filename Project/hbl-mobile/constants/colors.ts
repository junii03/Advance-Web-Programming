/**
 * NativeWind Color Reference & Examples
 * Demonstrates all HBL brand colors and how to use them in components
 */

// ============================================================================
// HBL PRIMARY BRAND COLORS
// ============================================================================

/**
 * Primary Red - Main HBL Brand Color
 * Use for: Primary buttons, links, active states, important CTAs
 *
 * Example:
 * className="bg-hbl-red text-white"
 */
export const HBL_RED = '#DC143C';

/**
 * Red Light - Lighter variant for hover/focus states
 * Use for: Hover states, disabled backgrounds, light backgrounds
 *
 * Example:
 * className="dark:text-hbl-red-light"
 */
export const HBL_RED_LIGHT = '#FF6B6B';

/**
 * Red Dark - Darker variant for depth
 * Use for: Pressed states, text accents, emphasis
 *
 * Example:
 * className="text-hbl-red-dark"
 */
export const HBL_RED_DARK = '#9C0E2E';

/**
 * HBL Blue - Secondary Brand Color
 * Use for: Secondary actions, information, links
 *
 * Example:
 * className="bg-hbl-blue text-white"
 */
export const HBL_BLUE = '#003366';

/**
 * HBL Gold - Accent Color
 * Use for: Premium features, highlights, special badges
 *
 * Example:
 * className="text-hbl-gold"
 */
export const HBL_GOLD = '#FFB81C';

// ============================================================================
// STATUS/SEMANTIC COLORS
// ============================================================================

/**
 * Success Green
 * Use for: Success messages, completed states, positive indicators
 */
export const SUCCESS = '#10B981';
export const SUCCESS_LIGHT = '#6EE7B7';

/**
 * Warning Orange/Amber
 * Use for: Warnings, pending states, caution messages
 */
export const WARNING = '#F59E0B';
export const WARNING_LIGHT = '#FCD34D';

/**
 * Error Red
 * Use for: Errors, negative states, destructive actions
 */
export const ERROR = '#EF4444';
export const ERROR_LIGHT = '#FCA5A5';

/**
 * Info Blue
 * Use for: Information, notifications, help text
 */
export const INFO = '#3B82F6';
export const INFO_LIGHT = '#93C5FD';

// ============================================================================
// NEUTRAL COLORS - LIGHT MODE
// ============================================================================

export const LIGHT_MODE = {
  background: '#FFFFFF',
  surface: '#F9FAFB',
  surfaceAlt: '#F3F4F6',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
};

// ============================================================================
// NEUTRAL COLORS - DARK MODE
// ============================================================================

export const DARK_MODE = {
  background: '#111827',
  surface: '#1F2937',
  surfaceAlt: '#374151',
  border: '#4B5563',
  borderLight: '#374151',
  textPrimary: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textTertiary: '#9CA3AF',
};

// ============================================================================
// COMPONENT USAGE EXAMPLES
// ============================================================================

/**
 * Example 1: Primary Button with HBL Red
 *
 * <Pressable className="bg-hbl-red px-4 py-3 rounded-lg active:opacity-70">
 *   <Text className="text-white font-semibold text-base">
 *     Sign In
 *   </Text>
 * </Pressable>
 */

/**
 * Example 2: Status Badge using Semantic Colors
 *
 * Success Badge:
 * <View className="bg-success/10 px-3 py-1 rounded-full">
 *   <Text className="text-success font-semibold text-xs">
 *     Active
 *   </Text>
 * </View>
 *
 * Warning Badge:
 * <View className="bg-warning/10 px-3 py-1 rounded-full">
 *   <Text className="text-warning font-semibold text-xs">
 *     Pending
 *   </Text>
 * </View>
 *
 * Error Badge:
 * <View className="bg-error/10 px-3 py-1 rounded-full">
 *   <Text className="text-error font-semibold text-xs">
 *     Failed
 *   </Text>
 * </View>
 */

/**
 * Example 3: Card with Multiple Colors
 *
 * <View className="bg-white dark:bg-surface-dark rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-md">
 *   <Text className="text-text-primary dark:text-text-dark-primary font-semibold mb-2">
 *     Account Balance
 *   </Text>
 *   <Text className="text-text-secondary dark:text-text-dark-secondary text-sm">
 *     PKR 50,000
 *   </Text>
 * </View>
 */

/**
 * Example 4: Form Input with Focus State
 *
 * const [focused, setFocused] = useState(false);
 *
 * <View className={`rounded-lg border-2 bg-gray-50 dark:bg-surface-alt-dark px-3 py-2.5 ${
 *   focused ? 'border-hbl-red' : 'border-gray-200 dark:border-gray-600'
 * }`}>
 *   <TextInput
 *     className="text-base text-text-primary dark:text-text-dark-primary"
 *     onFocus={() => setFocused(true)}
 *     onBlur={() => setFocused(false)}
 *   />
 * </View>
 */

/**
 * Example 5: Transaction List with Status Colors
 *
 * Completed Transaction (Green):
 * <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
 *   <Text className="text-text-secondary">Transfer sent</Text>
 *   <View className="flex-row items-center gap-2">
 *     <View className="w-2 h-2 rounded-full bg-success" />
 *     <Text className="text-success font-semibold">Completed</Text>
 *   </View>
 * </View>
 *
 * Pending Transaction (Orange):
 * <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
 *   <Text className="text-text-secondary">Transfer pending</Text>
 *   <View className="flex-row items-center gap-2">
 *     <View className="w-2 h-2 rounded-full bg-warning" />
 *     <Text className="text-warning font-semibold">Pending</Text>
 *   </View>
 * </View>
 *
 * Failed Transaction (Red):
 * <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
 *   <Text className="text-text-secondary">Transfer failed</Text>
 *   <View className="flex-row items-center gap-2">
 *     <View className="w-2 h-2 rounded-full bg-error" />
 *     <Text className="text-error font-semibold">Failed</Text>
 *   </View>
 * </View>
 */

// ============================================================================
// COLOR MAPPING FOR THEME CONSISTENCY
// ============================================================================

export const colorMap = {
  // Brand
  brand: {
    primary: 'hbl-red',
    primaryLight: 'hbl-red-light',
    primaryDark: 'hbl-red-dark',
    secondary: 'hbl-blue',
    accent: 'hbl-gold',
  },

  // Status
  status: {
    success: 'success',
    warning: 'warning',
    error: 'error',
    info: 'info',
  },

  // Light Mode
  light: {
    bg: 'background-light',
    surface: 'surface-light',
    text: 'text-primary',
    textMuted: 'text-secondary',
    border: 'border-light',
  },

  // Dark Mode
  dark: {
    bg: 'background-dark',
    surface: 'surface-dark',
    text: 'text-dark-primary',
    textMuted: 'text-dark-secondary',
    border: 'border-dark',
  },
};
