import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { TelephonyBridge } from './src/services/telephonyBridge';
import { socketService } from './src/services/socket';

export default function App() {
  useEffect(() => {
    // 1. Connect WebSocket to backend for live transcription streams
    socketService.connect('demo-user-1');

    // 2. Listen to native Android CallScreening / InCallService incoming events
    const unsubscribe = TelephonyBridge.onIncomingCall((event) => {
      console.log('[App] Incoming call event from Android Telecom:', event);
      // Native event automatically triggers live voicemail UI handling
    });

    return () => {
      unsubscribe();
      socketService.disconnect();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0B0D12" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
