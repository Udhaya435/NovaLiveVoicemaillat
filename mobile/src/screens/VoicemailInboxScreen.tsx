import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { DarkTheme } from '../theme/colors';
import { VoicemailCard } from '../components/VoicemailCard';
import { ApiService } from '../services/api';
import { Voicemail } from '../types';

export const VoicemailInboxScreen = ({ navigation }: any) => {
  const [voicemails, setVoicemails] = useState<Voicemail[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnread, setFilterUnread] = useState(false);
  const [filterCallbacks, setFilterCallbacks] = useState(false);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [loading, setLoading] = useState(false);

  const fetchVoicemails = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getVoicemails({
        unreadOnly: filterUnread,
        search: searchQuery,
        sort: sortOrder,
      });
      setVoicemails(res.voicemails || []);
    } catch (e) {
      console.log('Error fetching voicemails');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoicemails();
  }, [filterUnread, sortOrder]);

  const handleSearchSubmit = () => {
    fetchVoicemails();
  };

  const filteredList = voicemails.filter((vm) => {
    if (filterCallbacks && !vm.summary?.callbackRequested) {
      return false;
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Voicemail Inbox</Text>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
        >
          <Text style={styles.sortButtonText}>
            {sortOrder === 'desc' ? '↓ Newest' : '↑ Oldest'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by caller, transcript or AI..."
          placeholderTextColor={DarkTheme.mutedText}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => { setSearchQuery(''); fetchVoicemails(); }}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <View style={styles.chipsRow}>
        <TouchableOpacity
          style={[styles.chip, !filterUnread && !filterCallbacks && styles.chipActive]}
          onPress={() => { setFilterUnread(false); setFilterCallbacks(false); }}
        >
          <Text style={[styles.chipText, !filterUnread && !filterCallbacks && styles.chipTextActive]}>
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, filterUnread && styles.chipActive]}
          onPress={() => setFilterUnread(!filterUnread)}
        >
          <Text style={[styles.chipText, filterUnread && styles.chipTextActive]}>
            Unread
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, filterCallbacks && styles.chipActive]}
          onPress={() => setFilterCallbacks(!filterCallbacks)}
        >
          <Text style={[styles.chipText, filterCallbacks && styles.chipTextActive]}>
            📞 Callbacks
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={filteredList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={fetchVoicemails}
        renderItem={({ item }) => (
          <VoicemailCard
            voicemail={item}
            onPress={() => navigation.navigate('VoicemailDetail', { voicemailId: item.id })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>No Voicemails Found</Text>
            <Text style={styles.emptyDesc}>
              {searchQuery ? 'Try adjusting your search criteria.' : 'When callers leave a message, transcripts and AI summaries appear here.'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DarkTheme.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    color: DarkTheme.text,
    fontSize: 26,
    fontWeight: '800',
  },
  sortButton: {
    backgroundColor: DarkTheme.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
  },
  sortButtonText: {
    color: DarkTheme.primaryBlue,
    fontSize: 12,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DarkTheme.card,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: DarkTheme.text,
    paddingVertical: 12,
    fontSize: 14,
  },
  clearIcon: {
    color: DarkTheme.mutedText,
    fontSize: 14,
    padding: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  chip: {
    backgroundColor: DarkTheme.card,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
  },
  chipActive: {
    backgroundColor: DarkTheme.primaryBlue,
    borderColor: DarkTheme.primaryBlue,
  },
  chipText: {
    color: DarkTheme.secondaryText,
    fontSize: 12,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    color: DarkTheme.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyDesc: {
    color: DarkTheme.secondaryText,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
