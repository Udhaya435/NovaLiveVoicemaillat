import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { DarkTheme } from '../theme/colors';
import { WaveformVisualizer } from '../components/WaveformVisualizer';
import { socketService } from '../services/socket';

export const LiveVoicemailScreen = ({ route, navigation }: any) => {
  const callerName = route.params?.callerName || 'Dr. Michael Chen';
  const callerNumber = route.params?.callerNumber || '+1 (650) 892-4410';
  const initialVoicemailId = route.params?.voicemailId || 'live-vm-demo';

  const [callDuration, setCallDuration] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState(
    "Hi, I'm calling regarding your appointment tomorrow at 11 AM..."
  );
  const [callStatus, setCallStatus] = useState<'RECORDING' | 'ENDED'>('RECORDING');
  const [aiSummaryReady, setAiSummaryReady] = useState(false);

  // Progressive live transcription simulation & WebSocket listener
  useEffect(() => {
    // 1. Duration counter
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    // 2. Progressive text simulation (simulating live speech stream chunks)
    const progressiveTextChunks = [
      "Hi, I'm calling regarding your appointment tomorrow at 11 AM.",
      " Please make sure to bring your medical records and insurance card.",
      " If you need to reschedule or have questions,",
      " please call my office back before 5 PM today.",
      " Thank you!"
    ];

    let chunkIndex = 0;
    const textStreamer = setInterval(() => {
      if (chunkIndex < progressiveTextChunks.length) {
        setLiveTranscript((prev) => prev + progressiveTextChunks[chunkIndex]);
        chunkIndex++;
      } else {
        clearInterval(textStreamer);
        // Automatically finish call after speaker ends
        setTimeout(() => {
          setCallStatus('ENDED');
          setAiSummaryReady(true);
        }, 1500);
      }
    }, 2200);

    // 3. Listen to real WebSocket live events if connected
    const unsubscribeLive = socketService.on('LIVE_TRANSCRIPT_UPDATE', (data: any) => {
      if (data.partialText) {
        setLiveTranscript(data.partialText);
      }
      if (data.isFinal) {
        setCallStatus('ENDED');
        setAiSummaryReady(true);
      }
    });

    const unsubscribeCompleted = socketService.on('VOICEMAIL_COMPLETED', (data: any) => {
      setCallStatus('ENDED');
      setAiSummaryReady(true);
    });

    return () => {
      clearInterval(timer);
      clearInterval(textStreamer);
      unsubscribeLive();
      unsubscribeCompleted();
    };
  }, []);

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleAnswer = () => {
    // Answer caller using InCallService or native dialer
    alert(`Connecting call with ${callerName}...`);
    navigation.goBack();
  };

  const handleDecline = () => {
    // Decline call
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar with Live Badge */}
      <View style={styles.topBar}>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveBadgeText}>
            {callStatus === 'RECORDING' ? 'LIVE VOICEMAIL' : 'MESSAGE SAVED'}
          </Text>
        </View>
        <Text style={styles.durationCounter}>{formatDuration(callDuration)}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Caller Header Card */}
        <View style={styles.callerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{callerName[0]}</Text>
          </View>
          <Text style={styles.callerName}>{callerName}</Text>
          <Text style={styles.callerNumber}>{callerNumber}</Text>
          <Text style={styles.statusSubtext}>
            {callStatus === 'RECORDING'
              ? 'Caller is speaking into your voicemail...'
              : 'Voicemail recording complete. AI summary ready.'}
          </Text>
        </View>

        {/* Real-time Audio Waveform */}
        <View style={styles.waveformContainer}>
          <WaveformVisualizer isPlaying={callStatus === 'RECORDING'} height={40} barCount={32} />
        </View>

        {/* Live Transcription Box */}
        <View style={styles.transcriptionCard}>
          <View style={styles.transcriptionHeader}>
            <Text style={styles.transcriptionLabel}>LIVE SPEECH TRANSCRIPT</Text>
            {callStatus === 'RECORDING' && <Text style={styles.streamingIndicator}>Streaming •••</Text>}
          </View>

          <Text style={styles.transcriptionBody}>
            "{liveTranscript}"
          </Text>
        </View>

        {/* AI Summary Banner if call ended */}
        {aiSummaryReady && (
          <View style={styles.aiSummaryCard}>
            <View style={styles.aiHeader}>
              <Text style={styles.aiSparkle}>✨</Text>
              <Text style={styles.aiTitle}>NOVA AI SUMMARY</Text>
            </View>
            <Text style={styles.aiSummaryText}>
              Caller wants to confirm your medical appointment tomorrow at 11:00 AM. Requested to call back before 5:00 PM if rescheduling is needed.
            </Text>
            <View style={styles.appointmentTag}>
              <Text style={styles.appointmentTagText}>📅 Appointment: Tomorrow 11:00 AM</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action Controls */}
      <View style={styles.bottomControls}>
        {callStatus === 'RECORDING' ? (
          <View style={styles.actionRow}>
            {/* Decline / Leave on Voicemail */}
            <TouchableOpacity style={styles.declineButton} onPress={handleDecline}>
              <Text style={styles.buttonIcon}>✕</Text>
              <Text style={styles.buttonLabel}>Let it Record</Text>
            </TouchableOpacity>

            {/* Answer Call Now */}
            <TouchableOpacity style={styles.answerButton} onPress={handleAnswer}>
              <Text style={styles.buttonIcon}>📞</Text>
              <Text style={styles.buttonLabel}>Pick Up Call</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.fullWidthButton}
              onPress={() => navigation.navigate('VoicemailInbox')}
            >
              <Text style={styles.fullWidthButtonText}>View in Inbox</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DarkTheme.background,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 82, 82, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: DarkTheme.danger,
    marginRight: 6,
  },
  liveBadgeText: {
    color: DarkTheme.danger,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  durationCounter: {
    color: DarkTheme.mutedText,
    fontFamily: 'monospace',
    fontSize: 15,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  callerCard: {
    alignItems: 'center',
    marginVertical: 16,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: DarkTheme.card,
    borderWidth: 2,
    borderColor: DarkTheme.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 4,
  },
  avatarText: {
    color: DarkTheme.primaryBlue,
    fontSize: 28,
    fontWeight: '800',
  },
  callerName: {
    color: DarkTheme.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  callerNumber: {
    color: DarkTheme.secondaryText,
    fontSize: 14,
    marginBottom: 8,
  },
  statusSubtext: {
    color: DarkTheme.mutedText,
    fontSize: 13,
    fontStyle: 'italic',
  },
  waveformContainer: {
    width: '100%',
    backgroundColor: DarkTheme.card,
    borderRadius: 16,
    paddingVertical: 12,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
  },
  transcriptionCard: {
    width: '100%',
    backgroundColor: DarkTheme.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
    marginTop: 8,
  },
  transcriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transcriptionLabel: {
    color: DarkTheme.mutedText,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  streamingIndicator: {
    color: DarkTheme.secondaryBlue,
    fontSize: 12,
    fontWeight: '700',
  },
  transcriptionBody: {
    color: DarkTheme.text,
    fontSize: 16,
    lineHeight: 26,
    fontStyle: 'italic',
  },
  aiSummaryCard: {
    width: '100%',
    backgroundColor: '#121D2C',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(22, 139, 255, 0.4)',
    marginTop: 16,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiSparkle: {
    fontSize: 14,
    marginRight: 6,
  },
  aiTitle: {
    color: DarkTheme.secondaryBlue,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  aiSummaryText: {
    color: DarkTheme.text,
    fontSize: 14,
    lineHeight: 20,
  },
  appointmentTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 10,
  },
  appointmentTagText: {
    color: DarkTheme.success,
    fontSize: 12,
    fontWeight: '600',
  },
  bottomControls: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: DarkTheme.background,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  declineButton: {
    flex: 1,
    backgroundColor: DarkTheme.cardElevated,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
  },
  answerButton: {
    flex: 1,
    backgroundColor: DarkTheme.success,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 4,
  },
  buttonIcon: {
    fontSize: 22,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  fullWidthButton: {
    width: '100%',
    backgroundColor: DarkTheme.primaryBlue,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  fullWidthButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
