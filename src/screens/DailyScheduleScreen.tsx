import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Platform,
  Alert, TextInput, KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { TimeBlock, Subject } from '../types';
import { BlockModal } from '../components/BlockModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_TABLET = SCREEN_WIDTH >= 768;

const HOURS = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
  '19:00', '20:00', '21:00', '22:00', '23:00',
];

export const DailyScheduleScreen: React.FC = () => {
  const { timeBlocks, subjects, settings, addBlock, toggleBlockCompletion, selectedDate, setSelectedDate } = useApp();
  const [selectedBlock, setSelectedBlock] = useState<TimeBlock | null>(null);
  const [newBlockModal, setNewBlockModal] = useState(false);
  const [scrollToTime, setScrollToTime] = useState<string>('');

  const theme = settings.theme;
  const isDark = theme === 'dark' || theme === 'oled';
  const isOled = theme === 'oled';

  const todayStr = new Date().toISOString().split('T')[0];
  const dateToShow = selectedDate || todayStr;

  const todaysBlocks = useMemo(() => {
    return timeBlocks.filter(b => b.date === dateToShow || b.date === 'general');
  }, [timeBlocks, dateToShow]);

  const subjectMap = useMemo(() => {
    const map: Record<string, Subject> = {};
    subjects.forEach(s => { map[s.id] = s; });
    return map;
  }, [subjects]);

  const totalBlocks = todaysBlocks.length;
  const completedBlocks = todaysBlocks.filter(b => b.isCompleted).length;
  const progress = totalBlocks > 0 ? Math.round((completedBlocks / totalBlocks) * 100) : 0;

  const handleBlockPress = (block: TimeBlock) => {
    setSelectedBlock(block);
  };

  const handleAddBlock = () => {
    setSelectedBlock(null);
    setNewBlockModal(true);
  };

  const handleCloseModal = () => {
    setNewBlockModal(false);
    setSelectedBlock(null);
  };

  const currentTimeStr = useMemo(() => {
    const now = new Date();
    return now.toTimeString().slice(0, 5); // HH:MM
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setScrollToTime(new Date().toTimeString().slice(0, 5));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: isOled ? '#000000' : isDark ? '#121218' : '#F8F9FA' }]}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerInfo}>
            <Text style={[styles.headerDate, { color: isDark ? '#E8EAED' : '#374151' }]}>
              {formatTurkishDate(dateToShow)}
            </Text>
            <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
              Günlük Zaman Çizelgesi
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: '#339AF0' }]}
            onPress={handleAddBlock}
          >
            <Ionicons name="add" size={22} color="#FFFFFF" />
            <Text style={[styles.addButtonText, { color: '#FFFFFF' }]}>Yeni Plan Ekle</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Card */}
        <View style={[styles.progressCard, { backgroundColor: isDark ? '#1E1E28' : '#FFFFFF', borderColor: isDark ? '#2D2D3F' : '#E5E7EB' }]}>
          <View style={styles.progressRow}>
            <View style={styles.progressInfo}>
              <Text style={[styles.progressLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Günlük İlerleme
              </Text>
              <Text style={[styles.progressPercent, { color: isDark ? '#34D399' : '#10B981' }]}>
                %{progress}
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: isDark ? '#34D399' : '#10B981' }]} />
            </View>
          </View>
          <View style={styles.progressDetail}>
            <Text style={[styles.detailText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {completedBlocks} / {totalBlocks} plan tamamlandı
            </Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.timelineContainer}>
          <View style={styles.timeAxis}>
            {HOURS.map(hour => (
              <View key={hour} style={styles.timeSlot}>
                <Text style={[styles.timeText, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
                  {hour}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.blocksAxis}>
            {HOURS.map((hour, idx) => {
              const startMin = timeToMinutes(hour);
              const endMin = idx < HOURS.length - 1 ? timeToMinutes(HOURS[idx + 1]) : timeToMinutes('23:30');

              const blocksInSlot = todaysBlocks.filter(b => {
                const bStart = timeToMinutes(b.startTime);
                const bEnd = timeToMinutes(b.endTime);
                return bStart < endMin && bEnd > startMin;
              });

              const currentMin = timeToMinutes(currentTimeStr);
              const isCurrentSlot = currentMin >= startMin && currentMin < endMin;

              return (
                <View
                  key={hour}
                  style={[
                    styles.hourSlot,
                    isCurrentSlot && styles.currentSlot,
                    { borderLeftColor: isDark ? '#34D399' : '#10B981' },
                  ]}
                >
                  {isCurrentSlot && (
                    <View style={styles.currentIndicator}>
                      <View style={styles.currentDot} />
                      <Text style={[styles.currentLabel, { color: isDark ? '#34D399' : '#10B981' }]}>
                        Şu An: {currentTimeStr}
                      </Text>
                    </View>
                  )}

                  {blocksInSlot.map(block => {
                    const subject = subjectMap[block.subjectId];
                    const blockStartMin = timeToMinutes(block.startTime);
                    const blockEndMin = timeToMinutes(block.endTime);
                    const top = Math.max(0, ((blockStartMin - startMin) / (endMin - startMin)) * 100);
                    const height = Math.min(100 - top, ((blockEndMin - blockStartMin) / (endMin - startMin)) * 100);

                    return (
                      <TouchableOpacity
                        key={block.id}
                        style={[
                          styles.blockCard,
                          {
                            backgroundColor: subject?.color || '#9CA3AF',
                            top: `${top}%`,
                            height: `${Math.max(height, 24)}%`,
                          },
                          block.isCompleted && styles.completedOverlay,
                        ]}
                        onPress={() => handleBlockPress(block)}
                      >
                        <View style={styles.blockContent}>
                          <Ionicons
                            name={(subject?.icon || 'book-outline') as any}
                            size={14}
                            color="#FFFFFF"
                            style={styles.blockIcon}
                          />
                          <View style={styles.blockTextContainer}>
                            <Text
                              numberOfLines={1}
                              style={[
                                styles.blockTitle,
                                { color: block.isCompleted ? 'rgba(255,255,255,0.75)' : '#FFFFFF' },
                              ]}
                            >
                              {block.title}
                            </Text>
                            <Text
                              numberOfLines={1}
                              style={[
                                styles.blockTime,
                                { color: block.isCompleted ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.9)' },
                              ]}
                            >
                              {block.startTime} - {block.endTime}
                            </Text>
                          </View>
                        </View>
                        {block.isCompleted && (
                          <Ionicons name="checkmark" size={16} color="#FFFFFF" style={styles.checkIcon} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}
          </View>
        </View>

        {/* Empty state */}
        {todaysBlocks.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-clear" size={64} color={isDark ? '#4B5563' : '#CBD5E1'} />
            <Text style={[styles.emptyTitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Henüz plan yok
            </Text>
            <Text style={[styles.emptySubtitle, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
              "+ Yeni Plan Ekle" düğmesine basarak ilk çalışma bloğunuzu oluşturun.
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: '#339AF0' }]}
              onPress={handleAddBlock}
            >
              <Text style={[styles.emptyButtonText, { color: '#FFFFFF' }]}>İlk Planı Oluştur</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Block Detail / Quick Actions Bottom Sheet */}
      {selectedBlock && (
        <View style={[styles.bottomSheetOverlay, { backgroundColor: isOled ? 'rgba(0,0,0,0.7)' : isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.35)' }]}>
          <View style={[styles.bottomSheet, { backgroundColor: isDark ? '#1E1E28' : '#FFFFFF' }]}>
            <View style={styles.bottomSheetHeader}>
              <Text style={[styles.bottomSheetTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                {selectedBlock.title}
              </Text>
              <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                <Ionicons name="close" size={22} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>

            <View style={styles.bottomSheetBody}>
              <View style={styles.detailRow}>
                <Ionicons name="time" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                <View style={styles.detailTextContainer}>
                  <Text style={[styles.detailLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                    Başlangıç
                  </Text>
                  <Text style={[styles.detailValue, { color: isDark ? '#E8EAED' : '#111827' }]}>
                    {selectedBlock.startTime}
                  </Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="time" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                <View style={styles.detailTextContainer}>
                  <Text style={[styles.detailLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                    Bitiş
                  </Text>
                  <Text style={[styles.detailValue, { color: isDark ? '#E8EAED' : '#111827' }]}>
                    {selectedBlock.endTime}
                  </Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="book" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                <View style={styles.detailTextContainer}>
                  <Text style={[styles.detailLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                    Ders / Etkinlik
                  </Text>
                  <Text style={[styles.detailValue, { color: isDark ? '#E8EAED' : '#111827' }]}>
                    {subjects.find(s => s.id === selectedBlock.subjectId)?.name || 'Ders'}
                  </Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="repeat" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                <View style={styles.detailTextContainer}>
                  <Text style={[styles.detailLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                    Tekrar
                  </Text>
                  <Text style={[styles.detailValue, { color: isDark ? '#E8EAED' : '#111827' }]}>
                    {repeatTypeLabel(selectedBlock.repeatType)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.bottomSheetActions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: selectedBlock.isCompleted ? '#9CA3AF' : '#10B981' }]}
                onPress={() => { toggleBlockCompletion(selectedBlock.id); handleCloseModal(); }}
              >
                <Ionicons
                  name={selectedBlock.isCompleted ? 'refresh' : 'checkmark'}
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={[styles.actionText, { color: '#FFFFFF' }]}>
                  {selectedBlock.isCompleted ? 'Geri Al' : 'Tamamlandı ✓'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#339AF0' }]}
                onPress={() => { handleCloseModal(); }}
              >
                <Ionicons name="play" size={20} color="#FFFFFF" />
                <Text style={[styles.actionText, { color: '#FFFFFF' }]}>Şimdi Başlat ▶</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: isDark ? '#2D2D3F' : '#F3F4F6' }]}
                onPress={handleCloseModal}
              >
                <Ionicons name="save" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                <Text style={[styles.actionText, { color: isDark ? '#E8EAED' : '#111827' }]}>Şablon Olarak Kaydet</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.deleteButton} onPress={() => { Alert.alert('Bloğu Sil', 'Bu plan bloğunu silmek istediğinizden emin misiniz?', [{ text: 'İptal', style: 'cancel' }, { text: 'Sil', style: 'destructive', onPress: () => { /* delete handled in parent context */ } }]); handleCloseModal(); }}>
              <Text style={[styles.deleteText, { color: isDark ? '#F87171' : '#EF4444' }]}>Bloğu Kaldır</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <BlockModal
        visible={newBlockModal}
        onClose={handleCloseModal}
        selectedDate={dateToShow}
      />
    </View>
  );
};

const repeatTypeLabel = (type: string) => {
  switch (type) {
    case 'once': return 'Sadece Bugün';
    case 'weekdays': return 'Hafta İçi Her Gün';
    case 'weekend': return 'Hafta Sonu';
    case 'custom': return 'Seçili Günler';
    default: return type;
  }
};

const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const formatTurkishDate = (dateStr: string) => {
  const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const d = new Date(dateStr + 'T00:00:00');
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
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
  headerInfo: { flex: 1 },
  headerDate: { fontSize: 14, opacity: 0.8, marginBottom: 4 },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: { fontSize: 14, fontWeight: '700' },
  progressCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 18,
    borderWidth: 1,
    borderRadius: 16,
  },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  progressInfo: { flex: 1 },
  progressLabel: { fontSize: 13, marginBottom: 4 },
  progressPercent: { fontSize: 28, fontWeight: '800' },
  progressBarContainer: {
    width: 120,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginLeft: 12,
  },
  progressBar: { height: 8, borderRadius: 4 },
  progressDetail: { marginTop: 8 },
  detailText: { fontSize: 14 },
  timelineContainer: { marginHorizontal: 20 },
  timeAxis: {
    width: 50,
    alignItems: 'center',
  },
  blocksAxis: { flex: 1 },
  timeSlot: {
    height: 60,
    justifyContent: 'center',
  },
  timeText: { fontSize: 12 },
  hourSlot: {
    position: 'relative',
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingRight: 8,
  },
  currentSlot: { borderBottomColor: '#10B981', borderBottomWidth: 2 },
  currentIndicator: {
    position: 'absolute',
    top: 4,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10B981',
    zIndex: 10,
  },
  currentDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 6 },
  currentLabel: { fontSize: 11, fontWeight: '700' },
  blockCard: {
    position: 'absolute',
    left: 8,
    right: 8,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  completedOverlay: { opacity: 0.7 },
  blockContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    height: '100%',
  },
  blockIcon: { marginRight: 6 },
  blockTextContainer: { flex: 1 },
  blockTitle: { fontSize: 13, fontWeight: '700' },
  blockTime: { fontSize: 11, opacity: 0.9 },
  checkIcon: { position: 'absolute', right: 10, top: 8 },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: { fontSize: 15, fontWeight: '700' },
  bottomSheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  bottomSheet: {
    width: '100%',
    maxHeight: IS_TABLET ? 500 : 420,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  bottomSheetTitle: { fontSize: 18, fontWeight: '700' },
  closeButton: { padding: 6 },
  bottomSheetBody: { paddingHorizontal: 20, paddingVertical: 16 },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  detailTextContainer: { flex: 1, marginLeft: 12 },
  detailLabel: { fontSize: 13, marginBottom: 2 },
  detailValue: { fontSize: 15, fontWeight: '600' },
  bottomSheetActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionText: { fontSize: 14, fontWeight: '700' },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  deleteText: { fontSize: 14, fontWeight: '600' },
});