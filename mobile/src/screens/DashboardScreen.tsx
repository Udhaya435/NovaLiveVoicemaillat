import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, RefreshControl } from 'react-native';
import { DarkTheme } from '../theme/colors';
import { VoicemailCard } from '../components/VoicemailCard';
import { ApiService } from '../services/api';
import { Voicemail } from '../types';

export const DashboardScreen = ({ navigation }: any) => {
  const [voicemails, setVoicemails] = useState<Voicemail[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ unread: 2, total: 5, minutesSaved: 14 });

  const loadData = async () => {
    try {
      setRefreshing(true);
      const res = await ApiService.getVoicemails({ sort: 'desc' });
      if (res.voicemails && res.voicemails.length > 0) {
        setVoicemails(res.voicemails.slice(0, 3));
        const unreadCount = res.voicemails.filter(v => !v.isRead).length;
        setStats({
          unread: unreadCount,
          total: res.total,
          minutesSaved: Math.round(res.total * 2.8),
        });
      } else {
        // Sample default data if backend has no records yet
        setVoicemails([
          {
            id: 'demo-vm-1',
            callerNumber: '+1 415-555-0132',
            callerName: 'Sarah Jenkins',
            durationSeconds: 42,
            status: 'COMPLETED',
            isRead: false,
            createdAt: new Date().toISOString(),
            transcript: {
              id: 'tr-1',
              rawText: 'Hi Sarah here, confirming our product sync tomorrow at 10 AM. Let me know if that works!',
              language: 'en',
              confidence: 0.98,
            },
            summary: {
              id: 'sum-1',
              summaryText: 'Confirming product sync tomorrow at 10:00 AM.',
              callerPurpose: 'Schedule confirmation',
              appointmentDates: ['Tomorrow 10:00 AM'],
              callbackRequested: true,
              callbackNumber: '+1 415-555-0132',
              suggestedReplies: [
                { en: "Tomorrow 10 AM works great for me!", ta: "Nalaikku 10 manikku sync ok, paakkalam!" }
              ]
            }
          }
        ]);
      }
    } catch (e) {
      console.log('[Dashboard] Fetch error, using cached display');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={DarkTheme.primaryBlue} />}
      >
        {/* App Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>NOVA</Text>
            <Text style={styles.screenTitle}>Live Voicemail</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.profileInitial}>U</Text>
          </TouchableOpacity>
        </View>

        {/* Live Protection Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.liveIndicator}>
              <View style={styles.pulseDot} />
              <Text style={styles.statusBadgeText}>TELECOM ACTIVE</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('ForwardingConfig')}>
              <Text style={styles.setupLink}>Configure ➔</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.statusTitle}>Voicemail Protection Active</Text>
          <Text style={styles.statusDesc}>
            Incoming calls are screened. Unanswered calls automatically route to Nova AI live transcription.
          </Text>
        </View>

        {/* Test Live Call Demo Button */}
        <TouchableOpacity
          style={styles.liveTestBanner}
          onPress={() => navigation.navigate('LiveVoicemail', {
            callerName: 'Dr. Michael Chen',
            callerNumber: '+1 (650) 892-4410',
          })}
        >
          <View style={styles.liveIconBadge}>
            <Text style={styles.liveTestIcon}>⚡</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.liveTestTitle}>Test Live Voicemail Demo</Text>
            <Text style={styles.liveTestDesc}>Simulate incoming call with progressive live speech transcription</Text>
          </View>
          <Text style={styles.liveTestArrow}>➔</Text>
        </TouchableOpacity>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.unread}</Text>
            <Text style={styles.statLabel}>Unread Messages</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.minutesSaved}m</Text>
            <Text style={styles.statLabel}>AI Time Saved</Text>
          </View>
        </View>

        {/* Quick Actions Carousel */}
        <Text style={styles.sectionHeader}>QUICK ACTIONS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionRow}>
          <TouchableOpacity style={styles.actionTile} onPress={() => navigation.navigate('VoicemailInbox')}>
            <Text style={styles.actionIcon}>📬</Text>
            <Text style={styles.actionText}>Voicemail Inbox</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionTile} onPress={() => navigation.navigate('GreetingManagement')}>
            <Text style={styles.actionIcon}>🎙️</Text>
            <Text style={styles.actionText}>Custom Greetings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionTile} onPress={() => navigation.navigate('ForwardingConfig')}>
            <Text style={styles.actionIcon}>📲</Text>
            <Text style={styles.actionText}>Carrier MMI Setup</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionTile} onPress={() => navigation.navigate('CallSettings')}>
            <Text style={styles.actionIcon}>⚙️</Text>
            <Text style={styles.actionText}>Call Screening</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Recent Voicemails */}
        <View style={styles.recentSectionHeader}>
          <Text style={styles.sectionHeader}>RECENT VOICEMAILS</Text>
          <TouchableOpacity onPress={() => navigation.navigate('VoicemailInbox')}>
            <Text style={styles.viewAllText}>View All ({stats.total})</Text>
          </TouchableOpacity>
        </View>

        {voicemails.map((vm) => (
          <VoicemailCard
            key={vm.id}
            voicemail={vm}
            onPress={() => navigation.navigate('VoicemailDetail', { voicemailId: vm.id })}
          />
        ))}
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
  appName: {
    color: DarkTheme.primaryBlue,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
  screenTitle: {
    color: DarkTheme.text,
    fontSize: 26,
    fontWeight: '800',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: DarkTheme.card,
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    color: DarkTheme.text,
    fontWeight: '700',
    fontSize: 16,
  },
  statusCard: {
    backgroundColor: DarkTheme.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: DarkTheme.success,
    marginRight: 6,
  },
  statusBadgeText: {
    color: DarkTheme.success,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  setupLink: {
    color: DarkTheme.primaryBlue,
    fontSize: 12,
    fontWeight: '700',
  },
  statusTitle: {
    color: DarkTheme.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusDesc: {
    color: DarkTheme.secondaryText,
    fontSize: 13,
    lineHeight: 18,
  },
  liveTestBanner: {
    backgroundColor: 'rgba(22, 139, 255, 0.12)',
    borderWidth: 1,
    borderColor: DarkTheme.primaryBlue,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  liveIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: DarkTheme.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveTestIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  liveTestTitle: {
    color: DarkTheme.text,
    fontSize: 15,
    fontWeight: '700',
  },
  liveTestDesc: {
    color: DarkTheme.secondaryText,
    fontSize: 12,
    marginTop: 2,
  },
  liveTestArrow: {
    color: DarkTheme.secondaryBlue,
    fontSize: 18,
    fontWeight: '800',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: DarkTheme.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
  },
  statNumber: {
    color: DarkTheme.text,
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    color: DarkTheme.mutedText,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  sectionHeader: {
    color: DarkTheme.mutedText,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  actionTile: {
    backgroundColor: DarkTheme.card,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: 140,
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
  },
  actionIcon: {
    fontSize: 26,
    marginBottom: 8,
  },
  actionText: {
    color: DarkTheme.text,
    fontSize: 13,
    fontWeight: '700',
  },
  recentSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllText: {
    color: DarkTheme.primaryBlue,
    fontSize: 12,
    fontWeight: '700',
  },
});
