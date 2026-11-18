import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList, Dimensions, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { TimeBlock, Subject } from '../types';
import { BlockModal } from '../components/BlockModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_TABLET = SCREEN_WIDTH >= 768;

const DAYS = [
  { key: 'mon', label: 'Pzt', full: 'Pazartesi', num: 1 },
  { key: 'tue', label: 'Sal', full: 'Salı', num: 2 },
  { key: 'wed', label: 'Çar', full: 'Çarşamba', num: 3 },
  { key: 'thu', label: 'Per', full: 'Perşembe', num: 4 },
  { key: 'fri', label: 'Cum', full: 'Cuma', num: 5 },
  { key: 'sat', label: 'Cmt', full: 'Cumartesi', num: 6 },
  { key: 'sun', label: 'Paz', full: 'Pazar', num: 0 },
];

export const WeeklyPlannerScreen: React.FC = () => {
  const { timeBlocks, subjects, settings, addBlock, applyTemplate } = useApp();

  const theme = settings.theme;
  const isDark = theme === 'dark' || theme === 'oled';
  const isOled = theme === 'oled';

  const cardBg = isOled ? '#111111' : isDark ? '#1E1E28' : '#FFFFFF';
  const borderColor = isDark ? '#2D2D3F' : '#E5E7EB';
  const textColor = isDark ? '#E8EAED' : '#111827';
  const mutedColor = isDark ? '#9CA3AF' : '#6B7280';
  const bgColor = isOled ? '#000000' : isDark ? '#121218' : '#F8F9FA';

  const [selectedDay, setSelectedDay] = useState<string>('mon');
  const [newBlockModal, setNewBlockModal] = useState(false);

  const dayNum = DAYS.find(d => d.key === selectedDay)?.num || 1;
  const dayStr = new Date().toISOString().split('T')[0];

  const dayBlocks = useMemo(() => {
    return timeBlocks.filter(b => {
      if (b.date === dayStr) return true;
      if (b.repeatType === 'weekdays' && dayNum >= 1 && dayNum <= 5) return true;
      if (b.repeatType === 'weekend' && (dayNum === 6 || dayNum === 0)) return true;
      if (b.repeatType === 'custom' && b.repeatDays?.includes(dayNum)) return true;
      if (b.date === 'general') return true;
      return false;
    });
  }, [timeBlocks, selectedDay, dayNum, dayStr]);

  const subjectMap = useMemo(() => {
    const map: Record<string, Subject> = {};
    subjects.forEach(s => { map[s.id] = s; });
    return map;
  }, [subjects]);

  const handleDayPress = (key: string) => {
    setSelectedDay(key);
  };

  const handleAddBlock = () => {
    setNewBlockModal(true);
  };

  const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollView: { flex: 1 },
    scrollContent: { paddingBottom: 100 },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    headerTitle: { fontSize: 22, fontWeight: '800' },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 10,
      gap: 6,
    },
    addButtonText: { fontSize: 13, fontWeight: '700' },
    daySelector: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingBottom: 16,
      gap: 8,
    },
    dayItem: {
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: 'center',
      minWidth: 56,
    },
    activeDay: { backgroundColor: '#E7F5FF' },
    dayLabel: { fontSize: 16 },
    dayNum: { fontSize: 11, marginTop: 2 },
    dayInfoCard: {
      marginHorizontal: 20,
      marginBottom: 20,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
    },
    dayInfoTitle: { fontSize: 18, fontWeight: '800' },
    dayInfoSub: { fontSize: 13, opacity: 0.8, marginTop: 4 },
    templatesSection: { marginHorizontal: 20, marginBottom: 16 },
    templatesScroll: { paddingHorizontal: 20, paddingBottom: 12 },
    templateCard: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      marginRight: 10,
      alignItems: 'center',
      flexDirection: 'row',
      gap: 8,
    },
    templateTitle: { fontSize: 14, fontWeight: '700' },
    blocksSection: { marginHorizontal: 20 },
    sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12 },
    listContent: { paddingBottom: 20 },
    blockRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      borderRadius: 12,
      marginBottom: 10,
      borderWidth: 1,
    },
    completedRow: { opacity: 0.6 },
    blockTimeContainer: { width: 90 },
    blockTime: { fontSize: 13, fontWeight: '700' },
    blockIconBadge: {
      width: 32,
      height: 32,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    blockInfo: { flex: 1 },
    blockTextContainer: { flex: 1 },
    blockTitle: { fontSize: 15, marginBottom: 2 },
    blockSubtitle: { fontSize: 12, opacity: 0.8 },
    completeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 60,
      paddingHorizontal: 40,
    },
    emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 16, marginBottom: 8 },
    emptySubtitle: { fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
    emptyButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
      marginTop: 16,
    },
    emptyButtonText: { fontSize: 15, fontWeight: '700' },
  });

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            Haftalık Planlayıcı
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: '#339AF0' }]}
            onPress={handleAddBlock}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={[styles.addButtonText, { color: '#FFFFFF' }]}>Yeni Plan</Text>
          </TouchableOpacity>
        </View>

        {/* Week Day Selector */}
        <View style={styles.daySelector}>
          {DAYS.map(day => {
            const isActive = selectedDay === day.key;
            const isWeekend = day.num === 6 || day.num === 0;
            return (
              <TouchableOpacity
                key={day.key}
                style={[
                  styles.dayItem,
                  isActive && styles.activeDay,
                  { borderColor: isActive ? '#339AF0' : 'transparent', backgroundColor: isActive ? '#E7F5FF' : 'transparent' },
                ]}
                onPress={() => handleDayPress(day.key)}
              >
                <Text style={[styles.dayLabel, { color: isActive ? '#339AF0' : mutedColor, fontWeight: isActive ? '800' : '600' }]}>
                  {day.label}
                </Text>
                <Text style={[styles.dayNum, { color: isActive ? '#339AF0' : mutedColor, fontWeight: isActive ? '700' : '500' }]}>
                  {isWeekend ? '*' : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Current Day Info */}
        <View style={[styles.dayInfoCard, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.dayInfoTitle, { color: textColor }]}>
            {DAYS.find(d => d.key === selectedDay)?.full}
          </Text>
          <Text style={[styles.dayInfoSub, { color: mutedColor }]}>
            {dayBlocks.length} planlanmış blok
          </Text>
        </View>

        {/* Templates Section */}
        <View style={styles.templatesSection}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Hızlı Şablonlar
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templatesScroll}>
            <TouchableOpacity
              style={[styles.templateCard, { backgroundColor: '#E7F5FF' }]}
              onPress={() => { applyTemplate('after-school', dayStr); }}
            >
              <Ionicons name="school" size={24} color="#339AF0" />
              <Text style={[styles.templateTitle, { color: '#339AF0' }]}>Okul Sonrası Rutini</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.templateCard, { backgroundColor: '#FFF3BF' }]}
              onPress={() => { applyTemplate('weekend-study', dayStr); }}
            >
              <Ionicons name="trophy" size={24} color="#F59F00" />
              <Text style={[styles.templateTitle, { color: '#F59F00' }]}>Hafta Sonu Kampı</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Blocks List */}
        <View style={styles.blocksSection}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            {DAYS.find(d => d.key === selectedDay)?.full} Programı
          </Text>
          {dayBlocks.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-clear" size={48} color={mutedColor} />
              <Text style={[styles.emptyTitle, { color: mutedColor }]}>
                Bu gün için plan yok
              </Text>
              <TouchableOpacity style={[styles.emptyButton, { backgroundColor: '#339AF0' }]} onPress={handleAddBlock}>
                <Text style={[styles.emptyButtonText, { color: '#FFFFFF' }]}>Yeni Plan Ekle</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={dayBlocks.sort((a, b) => a.startTime.localeCompare(b.startTime))}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const subject = subjectMap[item.subjectId];
                const isCompleted = item.isCompleted;
                return (
                  <TouchableOpacity
                    style={[
                      styles.blockRow,
                      { backgroundColor: cardBg, borderColor, borderLeftColor: subject?.color || '#9CA3AF' },
                      isCompleted && styles.completedRow,
                    ]}
                    onPress={() => { /* open detail */ }}
                  >
                    <View style={styles.blockTimeContainer}>
                      <Text style={[styles.blockTime, { color: mutedColor }]}>
                        {item.startTime} - {item.endTime}
                      </Text>
                    </View>
                    <View style={styles.blockInfo}>
                      <View style={[styles.blockIconBadge, { backgroundColor: isDark ? '#2D2D3F' : '#F3F4F6' }]}>
                        <Ionicons name={(subject?.icon || 'book-outline') as any} size={18} color={subject?.color || '#9CA3AF'} />
                      </View>
                      <View style={styles.blockTextContainer}>
                        <Text style={[styles.blockTitle, { color: textColor, fontWeight: isCompleted ? '600' : '700' }]}>
                          {item.title}
                        </Text>
                        <Text style={[styles.blockSubtitle, { color: mutedColor }]}>
                          {subject?.name || 'Ders'} • {item.repeatType === 'once' ? 'Sadece Bugün' : 'Tekrarlı'}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[styles.completeButton, { backgroundColor: isCompleted ? '#9CA3AF' : '#10B981' }]}
                      onPress={() => { /* toggle via context */ }}
                    >
                      <Ionicons name={isCompleted ? 'refresh' : 'checkmark'} size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </ScrollView>

      <BlockModal visible={newBlockModal} onClose={() => setNewBlockModal(false)} selectedDate={dayStr} />
    </View>
  );
};