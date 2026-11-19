import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Switch } from 'react-native';
import { DarkTheme } from '../theme/colors';
import { TelephonyBridge } from '../services/telephonyBridge';

export const CallSettingsScreen = ({ navigation }: any) => {
  const [callScreeningEnabled, setCallScreeningEnabled] = useState(true);
  const [silenceUnknown, setSilenceUnknown] = useState(false);
  const [ringDuration, setRingDuration] = useState(20);
  const [defaultDialerEnabled, setDefaultDialerEnabled] = useState(false);

  const handleSilenceToggle = (val: boolean) => {
    setSilenceUnknown(val);
    TelephonyBridge.setSilenceUnknownCallers(val);
  };

  const handleDefaultDialerToggle = async () => {
    const success = await TelephonyBridge.requestDefaultDialerRole();
    setDefaultDialerEnabled(success);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Call Screening & Telecom</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Section 1: Android Telecom Call Screening */}
        <Text style={styles.sectionTitle}>CALL SCREENING SERVICE</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Enable CallScreeningService</Text>
              <Text style={styles.settingDesc}>
                Detects incoming calls via Android Telecom and verifies caller identity within system timeout.
              </Text>
            </View>
            <Switch
              value={callScreeningEnabled}
              onValueChange={setCallScreeningEnabled}
              trackColor={{ false: DarkTheme.cardElevated, true: DarkTheme.primaryBlue }}
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Silence Unknown Callers</Text>
              <Text style={styles.settingDesc}>
                Silently sends numbers not in your contacts directly to Nova Live Voicemail without ringing.
              </Text>
            </View>
            <Switch
              value={silenceUnknown}
              onValueChange={handleSilenceToggle}
              trackColor={{ false: DarkTheme.cardElevated, true: DarkTheme.primaryBlue }}
            />
          </View>
        </View>

        {/* Section 2: Ring Time Before Voicemail */}
        <Text style={styles.sectionTitle}>RING DURATION BEFORE VOICEMAIL</Text>
        <View style={styles.card}>
          <Text style={styles.settingDesc}>
            How long your phone rings before your carrier forwards unanswered calls to Nova.
          </Text>
          <View style={styles.durationSelector}>
            {[15, 20, 25, 30].map((sec) => (
              <TouchableOpacity
                key={sec}
                style={[styles.durationTab, ringDuration === sec && styles.durationTabActive]}
                onPress={() => setRingDuration(sec)}
              >
                <Text style={[styles.durationTabText, ringDuration === sec && styles.durationTabTextActive]}>
                  {sec}s
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Section 3: Default Dialer Integration */}
        <Text style={styles.sectionTitle}>DEFAULT DIALER INTEGRATION</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Nova InCallService (Default Phone App)</Text>
              <Text style={styles.settingDesc}>
                Allows Nova to show the incoming call screen directly with live pick up and decline buttons.
              </Text>
            </View>
            <Switch
              value={defaultDialerEnabled}
              onValueChange={handleDefaultDialerToggle}
              trackColor={{ false: DarkTheme.cardElevated, true: DarkTheme.primaryBlue }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DarkTheme.background,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    color: DarkTheme.primaryBlue,
    fontSize: 16,
    fontWeight: '700',
  },
  headerTitle: {
    color: DarkTheme.text,
    fontSize: 18,
    fontWeight: '800',
  },
  sectionTitle: {
    color: DarkTheme.mutedText,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 10,
    marginTop: 10,
  },
  card: {
    backgroundColor: DarkTheme.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    color: DarkTheme.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  settingDesc: {
    color: DarkTheme.secondaryText,
    fontSize: 13,
    lineHeight: 18,
    paddingRight: 12,
  },
  durationSelector: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  durationTab: {
    flex: 1,
    backgroundColor: DarkTheme.cardElevated,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
  },
  durationTabActive: {
    backgroundColor: DarkTheme.primaryBlue,
    borderColor: DarkTheme.primaryBlue,
  },
  durationTabText: {
    color: DarkTheme.secondaryText,
    fontWeight: '700',
    fontSize: 14,
  },
  durationTabTextActive: {
    color: '#FFFFFF',
  },
});
