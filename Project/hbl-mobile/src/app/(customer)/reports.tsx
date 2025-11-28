import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api } from '@/src/lib/apiClient';

// Report Types
type ReportCategory = 'complaint' | 'feedback' | 'dispute' | 'fraud' | 'technical' | 'other';
type ReportStatus = 'pending' | 'in_progress' | 'resolved' | 'closed';

interface Report {
  _id: string;
  category: ReportCategory;
  subject: string;
  description: string;
  status: ReportStatus;
  createdAt: string;
  resolvedAt?: string;
  resolution?: string | {
    resolutionNote?: string;
    resolvedAt?: string;
    resolvedBy?: string;
  };
}

// Category options
const CATEGORIES: { value: ReportCategory; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'complaint', label: 'Complaint', icon: 'warning' },
  { value: 'feedback', label: 'Feedback', icon: 'chatbubble' },
  { value: 'dispute', label: 'Dispute', icon: 'document-text' },
  { value: 'fraud', label: 'Report Fraud', icon: 'shield' },
  { value: 'technical', label: 'Technical Issue', icon: 'build' },
  { value: 'other', label: 'Other', icon: 'help-circle' },
];

// Status style
const getStatusStyle = (status: ReportStatus) => {
  switch (status) {
    case 'pending':
      return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: 'time' as const };
    case 'in_progress':
      return { bg: 'bg-blue-100', text: 'text-blue-700', icon: 'refresh' as const };
    case 'resolved':
      return { bg: 'bg-green-100', text: 'text-green-700', icon: 'checkmark-circle' as const };
    case 'closed':
      return { bg: 'bg-gray-100', text: 'text-gray-700', icon: 'close-circle' as const };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700', icon: 'help-circle' as const };
  }
};

// Format date
const formatDate = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Report Item Component
const ReportItem = ({ report }: { report: Report }) => {
  const statusStyle = getStatusStyle(report.status);
  const category = CATEGORIES.find((c) => c.value === report.category);

  return (
    <View className="bg-white dark:bg-surface-dark rounded-xl p-4 mb-3">
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 rounded-full bg-hbl-green/10 items-center justify-center mr-3">
            <Ionicons name={category?.icon || 'help-circle'} size={20} color="#006747" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900 dark:text-white" numberOfLines={1}>
              {report.subject}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {category?.label} • {formatDate(report.createdAt)}
            </Text>
          </View>
        </View>
        <View className={`px-2 py-1 rounded-full ${statusStyle.bg}`}>
          <Text className={`text-xs font-medium capitalize ${statusStyle.text}`}>
            {report.status.replace('_', ' ')}
          </Text>
        </View>
      </View>
      <Text className="text-sm text-gray-600 dark:text-gray-400" numberOfLines={2}>
        {report.description}
      </Text>
      {report.resolution && (
        <View className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <Text className="text-xs font-medium text-gray-500 mb-1">Resolution:</Text>
          <Text className="text-sm text-green-600">
            {typeof report.resolution === 'string'
              ? report.resolution
              : report.resolution.resolutionNote || 'Resolved'}
          </Text>
        </View>
      )}
    </View>
  );
};

// Category Selector Component
const CategorySelector = ({
  selected,
  onSelect,
}: {
  selected: ReportCategory | null;
  onSelect: (category: ReportCategory) => void;
}) => (
  <View className="flex-row flex-wrap gap-2 mb-4">
    {CATEGORIES.map((cat) => (
      <Pressable
        key={cat.value}
        onPress={() => onSelect(cat.value)}
        className={`flex-row items-center px-3 py-2 rounded-lg border ${
          selected === cat.value
            ? 'bg-hbl-green/10 border-hbl-green'
            : 'bg-white dark:bg-surface-dark border-gray-200 dark:border-gray-700'
        }`}
      >
        <Ionicons
          name={cat.icon}
          size={16}
          color={selected === cat.value ? '#006747' : '#6B7280'}
        />
        <Text
          className={`ml-1 text-sm ${
            selected === cat.value
              ? 'text-hbl-green font-medium'
              : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          {cat.label}
        </Text>
      </Pressable>
    ))}
  </View>
);

export default function ReportsScreen() {
  const router = useRouter();
  const [view, setView] = useState<'list' | 'create'>('list');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [category, setCategory] = useState<ReportCategory | null>(null);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const fetchReports = useCallback(async () => {
    try {
      const response = await api.get<{ success: boolean; data: Report[] }>('/reports');
      setReports(response.data || []);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReports();
  }, [fetchReports]);

  const handleSubmit = async () => {
    if (!category) {
      Alert.alert('Required', 'Please select a category');
      return;
    }
    if (!subject.trim()) {
      Alert.alert('Required', 'Please enter a subject');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Required', 'Please enter a description');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/reports', {
        category,
        subject: subject.trim(),
        description: description.trim(),
      });

      Alert.alert('Success', 'Your report has been submitted successfully');
      setView('list');
      setCategory(null);
      setSubject('');
      setDescription('');
      fetchReports();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setCategory(null);
    setSubject('');
    setDescription('');
    setView('list');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-background-dark">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800">
        <View className="flex-row items-center">
          <Pressable onPress={() => (view === 'create' ? resetForm() : router.back())} className="mr-3">
            <Ionicons name="chevron-back" size={28} color="#006747" />
          </Pressable>
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            {view === 'create' ? 'New Report' : 'Reports & Feedback'}
          </Text>
        </View>
        {view === 'list' && (
          <Pressable
            onPress={() => setView('create')}
            className="flex-row items-center bg-hbl-green px-3 py-2 rounded-lg"
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text className="text-white text-sm font-medium ml-1">New</Text>
          </Pressable>
        )}
      </View>

      {view === 'list' ? (
        // Reports List View
        <ScrollView
          className="flex-1 px-4 pt-4"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#006747" />
          }
        >
          {loading ? (
            <View className="flex-1 items-center justify-center py-12">
              <ActivityIndicator size="large" color="#006747" />
            </View>
          ) : reports.length === 0 ? (
            <View className="flex-1 items-center justify-center py-12">
              <Ionicons name="document-text-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-900 dark:text-white font-semibold mt-4">
                No Reports Yet
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-sm text-center mt-2 px-8">
                Submit a report or feedback to get started
              </Text>
              <Pressable
                onPress={() => setView('create')}
                className="mt-4 bg-hbl-green px-6 py-3 rounded-lg"
              >
                <Text className="text-white font-semibold">Create Report</Text>
              </Pressable>
            </View>
          ) : (
            reports.map((report) => <ReportItem key={report._id} report={report} />)
          )}
          <View className="h-6" />
        </ScrollView>
      ) : (
        // Create Report View
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Category
          </Text>
          <CategorySelector selected={category} onSelect={setCategory} />

          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Subject
          </Text>
          <View className="bg-white dark:bg-surface-dark rounded-xl px-4 py-3 mb-4 border border-gray-200 dark:border-gray-700">
            <TextInput
              value={subject}
              onChangeText={setSubject}
              placeholder="Brief description of your issue"
              placeholderTextColor="#9CA3AF"
              className="text-gray-900 dark:text-white"
              maxLength={100}
            />
          </View>

          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </Text>
          <View className="bg-white dark:bg-surface-dark rounded-xl px-4 py-3 mb-6 border border-gray-200 dark:border-gray-700">
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Provide detailed information about your concern..."
              placeholderTextColor="#9CA3AF"
              className="text-gray-900 dark:text-white min-h-[120px]"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              maxLength={1000}
            />
          </View>

          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            className="bg-hbl-green py-4 rounded-xl items-center flex-row justify-center"
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="send" size={18} color="#FFFFFF" />
                <Text className="text-white font-semibold text-base ml-2">Submit Report</Text>
              </>
            )}
          </Pressable>

          <View className="h-6" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
