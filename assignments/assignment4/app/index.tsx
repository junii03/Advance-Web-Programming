import { Redirect } from 'expo-router';
import React from 'react';

export default function Index() {
  // Redirect to the tabs layout which contains our dashboard
  return <Redirect href="/(tabs)" />;
}
