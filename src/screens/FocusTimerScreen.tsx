import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { useApp } from '../context/AppContext';
import { TimeBlock } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_TABLET = SCREEN_WIDTH >= 768;

export const FocusTimerScreen: React.FC = () => {
  const { settings, timeBlocks, subjects } = useApp();

  const theme = settings.theme;
  const isDark = theme === 'dark' || theme === 'oled';
  const isOled = theme === 'oled';

  const [mode, setMode] = useState<'pomodoro' | 'block'>('pomodoro');
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [sessionType, setSessionType] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [selectedBlock, setSelectedBlock] = useState<TimeBlock | null>(null);
  const [customMinutes, setCustomMinutes] = useState(25);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const focusMinutes = 25;
  const shortBreakMinutes = 5;
  const longBreakMinutes = 15;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getModeColor = () => {
    if (sessionType === 'focus') return '#339AF0';
    if (sessionType === 'shortBreak') return '#10B981';
    return '#F59F00';
  };

  const getModeLabel = () => {
    if (sessionType === 'focus') return 'Odaklanma Süresi';
    if (sessionType === 'shortBreak') return 'Kısa Mola';
    return 'Uzun Mola';
  };

  const startTimer = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          setIsRunning(false);
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } catch {}
          if (Platform.OS !== 'web') {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const Notifications = require('expo-notifications');
            Notifications.scheduleNotificationAsync({
              content: {
                title: '⏰ Odak Seansı Bitti!',
                body: `${getModeLabel()} tamamlandı. Mola zamanı veya devam etmeye hazır mısın?`,
                sound: true,
              },
              trigger: null,
            });
          }
          Alert.alert(
            'Odak Seansı Tamamlandı!',
            `${getModeLabel()} süreniz doldu. İyi çalıştın!`,
            [{ text: 'Tamam', onPress: () => {} }]
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [isRunning, sessionType]);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    pauseTimer();
    if (mode === 'pomodoro') {
      setTimeLeft(sessionType === 'focus' ? focusMinutes * 60 : sessionType === 'shortBreak' ? shortBreakMinutes * 60 : longBreakMinutes * 60);
    } else {
      setTimeLeft(selectedBlock ? (timeToMinutes(selectedBlock.endTime) - timeToMinutes(selectedBlock.startTime)) * 60 : customMinutes * 60);
    }
  }, [mode, sessionType, selectedBlock, customMinutes, pauseTimer]);

  const startFocus = useCallback(() => {
    pauseTimer();
    setSessionType('focus');
    setTimeLeft(mode === 'pomodoro' ? focusMinutes * 60 : customMinutes * 60);
  }, [mode, customMinutes, pauseTimer]);

  const startShortBreak = useCallback(() => {
    pauseTimer();
    setSessionType('shortBreak');
    setTimeLeft(shortBreakMinutes * 60);
  }, [pauseTimer]);

  const startLongBreak = useCallback(() => {
    pauseTimer();
    setSessionType('longBreak');
    setTimeLeft(longBreakMinutes * 60);
  }, [pauseTimer]);

  const loadBlock = useCallback((block: TimeBlock) => {
    pauseTimer();
    setSelectedBlock(block);
    setMode('block');
    const minutes = timeToMinutes(block.endTime) - timeToMinutes(block.startTime);
    setTimeLeft(minutes * 60);
    setSessionType('focus');
  }, [pauseTimer]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const centerSize = IS_TABLET ? 260 : 220;
  const cardBg = isOled ? '#111111' : isDark ? '#1E1E28' : '#FFFFFF';
  const borderColor = isDark ? '#2D2D3F' : '#E5E7EB';
  const textColor = isDark ? '#E8EAED' : '#111827';
  const mutedColor = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <View style={[styles.container, { backgroundColor: isOled ? '#000000' : isDark ? '#121218' : '#F8F9FA' }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          Odak & Pomodoro Sayacı
        </Text>
      </View>

      {/* Mode Selector */}
      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'pomodoro' && styles.activeMode]}
          onPress={() => { setMode('pomodoro'); resetTimer(); }}
        >
          <Ionicons name="timer" size={20} color={mode === 'pomodoro' ? '#339AF0' : mutedColor} />
          <Text style={[styles.modeText, { color: mode === 'pomodoro' ? '#339AF0' : mutedColor, fontWeight: '700' }]}>
            Pomodoro (25/5/15)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'block' && styles.activeMode]}
          onPress={() => { setMode('block'); resetTimer(); }}
        >
          <Ionicons name="calendar" size={20} color={mode === 'block' ? '#339AF0' : mutedColor} />
          <Text style={[styles.modeText, { color: mode === 'block' ? '#339AF0' : mutedColor, fontWeight: '700' }]}>
            Planlı Blok
          </Text>
        </TouchableOpacity>
      </View>

      {/* Timer Display */}
      <View style={[styles.timerCard, { backgroundColor: cardBg, borderColor }]}>
        <View style={styles.timerDisplayContainer}>
          <Text style={[styles.sessionLabel, { color: getModeColor(), fontWeight: '800' }]}>
            {getModeLabel()}
          </Text>
          <Text style={[styles.timerText, { color: textColor }]}>
            {formatTime(timeLeft)}
          </Text>
        </View>

        {mode === 'block' && selectedBlock && (
          <View style={styles.blockInfoRow}>
            <Ionicons name="book" size={18} color={mutedColor} />
            <Text style={[styles.blockSubjectName, { color: textColor }]}>
              {subjects.find(s => s.id === selectedBlock.subjectId)?.name || 'Ders'}
            </Text>
            <Text style={[styles.blockSubjectName, { color: mutedColor, fontSize: 13 }]}>
              {selectedBlock.startTime} - {selectedBlock.endTime}
            </Text>
          </View>
        )}

        {/* Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: isRunning ? '#9CA3AF' : '#10B981' }]}
            onPress={isRunning ? pauseTimer : startTimer}
            disabled={timeLeft <= 0}
          >
            <Ionicons name={isRunning ? 'pause' : 'play'} size={24} color="#FFFFFF" />
            <Text style={[styles.controlText, { color: '#FFFFFF', fontWeight: '700' }]}>
              {isRunning ? 'Durdur' : 'Başlat'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: isDark ? '#2D2D3F' : '#F3F4F6' }]}
            onPress={resetTimer}
          >
            <Ionicons name="refresh" size={22} color={mutedColor} />
            <Text style={[styles.controlText, { color: textColor, fontWeight: '700' }]}>
              Sıfırla
            </Text>
          </TouchableOpacity>
        </View>

        {/* Session Quick Actions */}
        <View style={styles.sessionActions}>
          <TouchableOpacity
            style={[styles.sessionButton, sessionType === 'focus' && styles.activeSession]}
            onPress={startFocus}
          >
            <Ionicons name="lock-closed" size={18} color={sessionType === 'focus' ? '#339AF0' : mutedColor} />
            <Text style={[styles.sessionButtonText, { color: sessionType === 'focus' ? '#339AF0' : mutedColor, fontWeight: '700' }]}>
              Odaklanma
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sessionButton, sessionType === 'shortBreak' && styles.activeSession]}
            onPress={startShortBreak}
          >
            <Ionicons name="cafe-outline" size={18} color={sessionType === 'shortBreak' ? '#10B981' : mutedColor} />
            <Text style={[styles.sessionButtonText, { color: sessionType === 'shortBreak' ? '#10B981' : mutedColor, fontWeight: '700' }]}>
              Kısa Mola
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sessionButton, sessionType === 'longBreak' && styles.activeSession]}
            onPress={startLongBreak}
          >
            <Ionicons name="bed-outline" size={18} color={sessionType === 'longBreak' ? '#F59F00' : mutedColor} />
            <Text style={[styles.sessionButtonText, { color: sessionType === 'longBreak' ? '#F59F00' : mutedColor, fontWeight: '700' }]}>
              Uzun Mola
            </Text>
          </TouchableOpacity>
        </View>

        {/* Custom Minutes (Pomodoro mode) */}
        {mode === 'pomodoro' && sessionType === 'focus' && (
          <View style={styles.customSliderSection}>
            <Text style={[styles.sliderLabel, { color: mutedColor }]}>
              Odak Süresi (dakika)
            </Text>
            <TextInput
              style={[styles.minutesInput, { color: textColor }]}
              value={String(customMinutes)}
              onChangeText={t => setCustomMinutes(parseInt(t) || 25)}
              keyboardType="numeric"
            />
            <Text style={[styles.sliderValue, { color: textColor, fontWeight: '700' }]}>
              {customMinutes} dk
            </Text>
          </View>
        )}

        {/* Schedule Block List (Block mode) */}
        {mode === 'block' && (
          <View style={styles.blocksSection}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#E8EAED' : '#374151' }]}>
              Planlanmış Bloklar
            </Text>
            {timeBlocks.length === 0 ? (
              <Text style={[styles.emptyText, { color: mutedColor }]}>
                Henüz planlanmış blok yok. Günlük Program'dan ekleyebilirsin.
              </Text>
            ) : (
              timeBlocks.map(block => (
                <TouchableOpacity
                  key={block.id}
                  style={[styles.blockRow, { backgroundColor: cardBg, borderColor }]}
                  onPress={() => loadBlock(block)}
                >
                  <Ionicons name="play" size={16} color="#339AF0" style={styles.playIcon} />
                  <View style={styles.blockRowInfo}>
                    <Text style={[styles.blockRowTitle, { color: textColor }]}>
                      {block.title}
                    </Text>
                    <Text style={[styles.blockRowTime, { color: mutedColor, fontSize: 12 }]}>
                      {block.startTime} - {block.endTime} • {(timeToMinutes(block.endTime) - timeToMinutes(block.startTime))} dk
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  headerRow: { marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  activeMode: {
    backgroundColor: '#E7F5FF',
    borderColor: '#339AF0',
  },
  modeText: { fontSize: 14 },
  timerCard: {
    alignItems: 'center',
    paddingVertical: 30,
    borderRadius: 24,
    borderWidth: 1,
  },
  timerDisplayContainer: { alignItems: 'center', marginBottom: 20 },
  sessionLabel: { fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  timerText: { fontSize: 56, fontWeight: '800', fontFamily: 'monospace' },
  blockInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  blockSubjectName: { fontSize: 15, fontWeight: '700' },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    minWidth: 110,
  },
  controlText: { fontSize: 15 },
  sessionActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  sessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  activeSession: {
    backgroundColor: '#E7F5FF',
    borderColor: '#339AF0',
  },
  sessionButtonText: { fontSize: 13, fontWeight: '700' },
  customSliderSection: {
    width: '100%',
    marginBottom: 24,
    alignItems: 'center',
  },
  sliderLabel: { fontSize: 14, marginBottom: 8, alignSelf: 'flex-start' },
  minutesInput: {
    height: 40,
    width: 60,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    backgroundColor: '#F8F9FA',
  },
  sliderValue: { marginTop: 4 },
  blocksSection: { width: '100%' },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12, alignSelf: 'flex-start' },
  blockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  playIcon: { marginRight: 10 },
  blockRowInfo: { flex: 1 },
  blockRowTitle: { fontSize: 14, fontWeight: '700' },
  blockRowTime: { marginTop: 2 },
  emptyText: { fontSize: 14, textAlign: 'center', paddingVertical: 20 },
});