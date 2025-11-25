import { Text, type TextProps } from 'react-native';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  className?: string;
};

export function ThemedText({
  className,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const typeClasses = {
    default: 'text-base leading-6 text-gray-900 dark:text-white',
    defaultSemiBold: 'text-base leading-6 font-semibold text-gray-900 dark:text-white',
    title: 'text-3xl font-bold leading-8 text-gray-900 dark:text-white',
    subtitle: 'text-xl font-bold text-gray-900 dark:text-white',
    link: 'text-base leading-7 text-hbl-blue active:opacity-70',
  }[type];

  return (
    <Text
      className={`${typeClasses} ${className || ''}`}
      {...rest}
    />
  );
}
