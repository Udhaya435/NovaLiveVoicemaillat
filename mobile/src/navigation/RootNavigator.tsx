import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

import { SplashScreen } from '../screens/SplashScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { PermissionSetupScreen } from '../screens/PermissionSetupScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { VoicemailInboxScreen } from '../screens/VoicemailInboxScreen';
import { LiveVoicemailScreen } from '../screens/LiveVoicemailScreen';
import { VoicemailDetailScreen } from '../screens/VoicemailDetailScreen';
import { AudioPlayerScreen } from '../screens/AudioPlayerScreen';
import { AISummaryScreen } from '../screens/AISummaryScreen';
import { GreetingManagementScreen } from '../screens/GreetingManagementScreen';
import { CallSettingsScreen } from '../screens/CallSettingsScreen';
import { ForwardingConfigScreen } from '../screens/ForwardingConfigScreen';
import { ContactsScreen } from '../screens/ContactsScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { AppSettingsScreen } from '../screens/AppSettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
          contentStyle: { backgroundColor: '#0B0D12' },
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="PermissionSetup" component={PermissionSetupScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="VoicemailInbox" component={VoicemailInboxScreen} />
        <Stack.Screen
          name="LiveVoicemail"
          component={LiveVoicemailScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="VoicemailDetail" component={VoicemailDetailScreen} />
        <Stack.Screen
          name="AudioPlayer"
          component={AudioPlayerScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen name="AISummary" component={AISummaryScreen} />
        <Stack.Screen name="GreetingManagement" component={GreetingManagementScreen} />
        <Stack.Screen name="CallSettings" component={CallSettingsScreen} />
        <Stack.Screen name="ForwardingConfig" component={ForwardingConfigScreen} />
        <Stack.Screen name="Contacts" component={ContactsScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="AppSettings" component={AppSettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
