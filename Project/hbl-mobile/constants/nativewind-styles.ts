/**
 * NativeWind Tailwind CSS Utility Classes
 * Pre-defined style combinations for consistent styling across the app
 */

// Container & Layout Utilities
export const containers = {
  fullscreen: 'flex-1 w-full h-full',
  centered: 'flex items-center justify-center',
  centerColumn: 'flex flex-col items-center justify-center',
  screenContainer: 'flex-1 bg-white dark:bg-background-dark',
  contentContainer: 'flex-1 px-5 py-6',
};

// Card & Surface Utilities
export const surfaces = {
  card: 'rounded-lg border border-gray-200 bg-white shadow-md dark:bg-surface-dark dark:border-gray-700',
  section: 'rounded-xl bg-surface-light dark:bg-surface-dark p-4 mb-4',
  input: 'rounded-lg border-2 border-gray-200 bg-gray-50 px-3 py-2.5 dark:bg-surface-alt-dark dark:border-gray-600',
  focusedInput: 'border-hbl-red dark:border-hbl-red-light',
};

// Text Utilities
export const typography = {
  h1: 'text-xxxl font-bold text-text-primary dark:text-text-dark-primary',
  h2: 'text-xxl font-bold text-text-primary dark:text-text-dark-primary',
  h3: 'text-xl font-semibold text-text-primary dark:text-text-dark-primary',
  h4: 'text-lg font-semibold text-text-primary dark:text-text-dark-primary',
  body: 'text-base text-text-secondary dark:text-text-dark-secondary',
  label: 'text-sm font-semibold text-text-primary dark:text-text-dark-primary',
  caption: 'text-xs text-text-tertiary dark:text-text-dark-tertiary',
  error: 'text-xs font-medium text-error dark:text-error-light',
};

// Button Utilities
export const buttons = {
  primary: 'bg-hbl-red active:opacity-70 disabled:bg-gray-400 disabled:opacity-50',
  secondary: 'bg-hbl-blue active:opacity-70 disabled:opacity-50',
  danger: 'bg-error active:opacity-70 disabled:opacity-50',
  outline: 'bg-transparent border-2 border-hbl-red active:opacity-70',
  small: 'px-3 py-2 min-h-8',
  medium: 'px-4 py-3 min-h-11',
  large: 'px-5 py-3.5 min-h-13',
};

// Badge & Status Utilities
export const badges = {
  success: 'bg-success/10 text-success rounded-full px-3 py-1',
  warning: 'bg-warning/10 text-warning rounded-full px-3 py-1',
  error: 'bg-error/10 text-error rounded-full px-3 py-1',
  info: 'bg-info/10 text-info rounded-full px-3 py-1',
};

// Spacing Utilities
export const spacing = {
  section: 'mb-6',
  item: 'mb-4',
  divider: 'my-4',
};

// Icon Utilities
export const icons = {
  small: 'w-4 h-4',
  medium: 'w-6 h-6',
  large: 'w-8 h-8',
};

// Flex Utilities
export const flex = {
  row: 'flex-row',
  col: 'flex-col',
  center: 'items-center justify-center',
  between: 'items-center justify-between',
  start: 'items-start',
  end: 'items-end',
};

// Responsive Utilities
export const responsive = {
  container: 'px-4 md:px-6 lg:px-8',
  grid2: 'grid grid-cols-2 gap-4',
  grid3: 'grid grid-cols-3 gap-4',
};
