import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Help Item Component
const HelpItem = ({
  icon,
  title,
  description,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  onPress?: () => void;
}) => (
  <Pressable
    onPress={onPress}
    className="flex-row items-center p-4 bg-white dark:bg-surface-dark mb-2 rounded-xl"
  >
    <View className="w-12 h-12 rounded-full bg-hbl-green/10 items-center justify-center mr-4">
      <Ionicons name={icon} size={24} color="#006747" />
    </View>
    <View className="flex-1">
      <Text className="text-base font-semibold text-gray-900 dark:text-white">{title}</Text>
      <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{description}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
  </Pressable>
);

// FAQ Item Component
const FAQItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Pressable
      onPress={() => setExpanded(!expanded)}
      className="p-4 bg-white dark:bg-surface-dark mb-2 rounded-xl"
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-medium text-gray-900 dark:text-white flex-1 mr-4">
          {question}
        </Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#9CA3AF"
        />
      </View>
      {expanded && (
        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-3">{answer}</Text>
      )}
    </Pressable>
  );
};

export default function HelpScreen() {
  const router = useRouter();

  const helpSections = [
    {
      icon: 'call' as const,
      title: 'Call Us',
      description: '24/7 Helpline: 111-111-425',
      onPress: () => Linking.openURL('tel:111111425'),
    },
    {
      icon: 'chatbubble-ellipses' as const,
      title: 'Live Chat',
      description: 'Chat with our support team',
      onPress: () => {},
    },
    {
      icon: 'mail' as const,
      title: 'Email Support',
      description: 'support@hbl.com.pk',
      onPress: () => Linking.openURL('mailto:support@hbl.com.pk'),
    },
    {
      icon: 'location' as const,
      title: 'Find Branch/ATM',
      description: 'Locate nearest HBL branch or ATM',
      onPress: () => {},
    },
  ];

  const faqs = [
    {
      question: 'How do I reset my password?',
      answer: 'Go to Settings > Security > Change Password, or use the "Forgot Password" option on the login screen.',
    },
    {
      question: 'What are the transfer limits?',
      answer: 'Transfer limits depend on your account type. Standard accounts have a daily limit of PKR 500,000 and monthly limit of PKR 2,000,000.',
    },
    {
      question: 'How do I block my card?',
      answer: 'Go to Cards section, select the card you want to block, and tap on "Block Card". You can also call our helpline.',
    },
    {
      question: 'How do I add a beneficiary?',
      answer: 'Go to Transfers > Add Beneficiary. Enter the account details and verify via OTP.',
    },
    {
      question: 'What should I do if a transaction fails?',
      answer: 'Check your transaction history for status. If amount was debited but transfer failed, it will be auto-reversed within 24-48 hours. Contact support if it persists.',
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-background-dark">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800">
        <Pressable onPress={() => router.back()} className="mr-3">
          <Ionicons name="chevron-back" size={28} color="#006747" />
        </Pressable>
        <Text className="text-lg font-bold text-gray-900 dark:text-white">Help & Support</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-4 pt-4">
        {/* Contact Options */}
        <Text className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
          Contact Us
        </Text>
        {helpSections.map((section, index) => (
          <HelpItem key={index} {...section} />
        ))}

        {/* FAQs */}
        <Text className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 mt-6">
          Frequently Asked Questions
        </Text>
        {faqs.map((faq, index) => (
          <FAQItem key={index} {...faq} />
        ))}

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
