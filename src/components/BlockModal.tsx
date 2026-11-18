import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Switch, Dimensions, Alert, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { TimeBlock, Subject } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_TABLET = SCREEN_WIDTH >= 768;

const REPEAT_OPTIONS: { id: string; label: string }[] = [
  { id: 'once', label: 'Sadece Bugün' },
  { id: 'weekdays', label: 'Hafta İçi Her Gün' },
  { id: 'weekend', label: 'Hafta Sonu' },
  { id: 'custom', label: 'Seçili Günler' },
];

const DAYS_SHORT: { id: number; label: string }[] = [
  { id: 1, label: 'Pzt' },
  { id: 2, label: 'Sal' },
  { id: 3, label: 'Çar' },
  { id: 4, label: 'Per' },
  { id: 5, label: 'Cum' },
  { id: 6, label: 'Cmt' },
  { id: 0, label: 'Paz' },
];

interface BlockModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: string;
}

export const BlockModal: React.FC<BlockModalProps> = ({ visible, onClose, selectedDate }) => {
  const { subjects, settings, addBlock, updateBlock } = useApp();

  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('16:00');
  const [endTime, setEndTime] = useState('17:00');
  [settings];
  const [subjectId, setSubjectId] = useState<string>('');
  const [repeatType, setRepeatType] = useState<string>('once');
  const [selectedRepeatDays, setSelectedRepeatDays] = useState<number[]>([]);
  const [customColor, setCustomColor] = useState('#FF6B6B');
  const [customIcon, setCustomIcon] = useState('book-outline');

  const isEditing = editingBlock !== null;

  const COLORS = ['#FF6B6B', '#339AF0', '#51CF66', '#FF922B', '#CC5DE8', '#20C997', '#F06595', '#748FFC', '#FCC419', '#868E96'];
  const ICONS = ['book-outline', 'calculator-outline', 'flask-outline', 'globe-outline', 'heart-outline', 'chatbubbles-outline', 'document-text-outline', 'trophy-outline', 'book-sharp', 'cafe-outline'];

  useCallback(() => {
    if (visible && editingBlock) {
      setTitle(editingBlock.title);
      setStartTime(editingBlock.startTime);
      setEndTime(editingBlock.endTime);
      setSubjectId(editingBlock.subjectId);
      setRepeatType(editingBlock.repeatType);
      setSelectedRepeatDays(editingBlock.repeatDays || []);
      setCustomColor(subjects.find(s => s.id === editingBlock.subjectId)?.color || '#FF6B6B');
      setCustomIcon(subjects.find(s => s.id === editingBlock.subjectId)?.icon || 'book-outline');
    }
  }, [visible, editingBlock]);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen plan başlığını giriniz.');
      return;
    }
    if (!subjectId) {
      Alert.alert('Eksik Bilgi', 'Lütfen bir ders veya etkinlik seçiniz.');
      return;
    }

    const blockData = {
      subjectId,
      title: title.trim(),
      startTime,
      endTime,
      date: selectedDate,
      repeatType: repeatType as 'once' | 'weekdays' | 'weekend' | 'custom',
      repeatDays: repeatType === 'custom' ? selectedRepeatDays : undefined,
    };

    if (isEditing && editingBlock) {
      updateBlock(editingBlock.id, blockData);
    } else {
      addBlock(blockData);
    }
    onClose();
    resetForm();
  };

  const handleDelete = () => {
    Alert.alert(
      'Bloğu Sil',
      'Bu plan bloğunu silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: () => {
          // delete handled by parent context - for now just close
          onClose();
        } },
      ]
    );
  };

  const resetForm = () => {
    setEditingBlock(null);
    setTitle('');
    setStartTime('16:00');
    setEndTime('17:00');
    setSubjectId('');
    setRepeatType('once');
    setSelectedRepeatDays([]);
    setCustomColor('#FF6B6B');
    setCustomIcon('book-outline');
  };

  if (!visible) return null;

  const theme = 'light';
  const isDark = false;

  const modalWidth = IS_TABLET ? 460 : SCREEN_WIDTH - 40;

  return (
    <View style={styles.overlay}>
      <View style={[styles.modal, { backgroundColor: isDark ? '#1E1E28' : '#FFFFFF', width: modalWidth }]}>
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: isDark ? '#E8EAED' : '#111827' }]}>
            {isEditing ? 'Planı Düzenle' : 'Yeni Plan Ekle'}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Title */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Plan Başlığı
            </Text>
            <TextInput
              style={[styles.input, { color: isDark ? '#E8EAED' : '#111827' }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Örn: Matematik Soru Çözümü"
            />
          </View>

          {/* Subject */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Ders / Etkinlik
            </Text>
            <View style={styles.subjectSelector}>
              {subjects.map(sub => (
                <TouchableOpacity
                  key={sub.id}
                  style={[styles.subjectChip, subjectId === sub.id && styles.activeSubjectChip, { borderColor: subjectId === sub.id ? sub.color : 'transparent', backgroundColor: subjectId === sub.id ? sub.color + '20' : 'transparent' }]}
                  onPress={() => setSubjectId(sub.id)}
                >
                  <Ionicons name={(sub.icon as any)} size={16} color={subjectId === sub.id ? sub.color : isDark ? '#6B7280' : '#9CA3AF'} />
                  <Text style={[styles.subjectChipText, { color: subjectId === sub.id ? sub.color : isDark ? '#E8EAED' : '#111827', fontWeight: subjectId === sub.id ? '800' : '600' }]}>
                    {sub.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Time */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Başlangıç & Bitiş Saati
            </Text>
            <View style={styles.timeRow}>
              <TouchableOpacity style={[styles.timeInputContainer, { borderColor: isDark ? '#2D2D3F' : '#D1D5DB' }]}>
                <Ionicons name="time" size={18} color={isDark ? '#9CA3AF' : '#6B7280'} style={styles.timeIcon} />
                <TextInput
                  style={[styles.timeInput, { color: isDark ? '#E8EAED' : '#111827' }]}
                  value={startTime}
                  onChangeText={setStartTime}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </TouchableOpacity>
              <Text style={styles.timeSeparator}>–</Text>
              <TouchableOpacity style={[styles.timeInputContainer, { borderColor: isDark ? '#2D2D3F' : '#D1D5DB' }]}>
                <Ionicons name="time" size={18} color={isDark ? '#9CA3AF' : '#6B7280'} style={styles.timeIcon} />
                <TextInput
                  style={[styles.timeInput, { color: isDark ? '#E8EAED' : '#111827' }]}
                  value={endTime}
                  onChangeText={setEndTime}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Repeat */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Tekrarlama Seçeneği
            </Text>
            <View style={styles.repeatSelector}>
              {REPEAT_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.repeatChip, repeatType === opt.id && styles.activeRepeatChip]}
                  onPress={() => setRepeatType(opt.id)}
                >
                  <Text style={[styles.repeatChipText, { color: repeatType === opt.id ? '#339AF0' : isDark ? '#E8EAED' : '#111827', fontWeight: repeatType === opt.id ? '700' : '600' }]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {repeatType === 'custom' && (
              <View style={styles.daysSelector}>
                {DAYS_SHORT.map(day => (
                  <TouchableOpacity
                    key={day.id}
                    style={[styles.dayChip, selectedRepeatDays.includes(day.id) && styles.activeDayChip]}
                    onPress={() => {
                      const idx = selectedRepeatDays.indexOf(day.id);
                      if (idx >= 0) setSelectedRepeatDays(selectedRepeatDays.filter(d => d !== day.id));
                      else setSelectedRepeatDays([...selectedRepeatDays, day.id]);
                    }}
                  >
                    <Text style={[styles.dayChipText, { color: selectedRepeatDays.includes(day.id) ? '#FFFFFF' : isDark ? '#9CA3AF' : '#6B7280', fontWeight: '700' }]}>
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Color & Icon */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Renk & İkon
            </Text>
            <View style={styles.colorSelector}>
              {COLORS.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[styles.colorChip, customColor === color && styles.activeColorChip, { backgroundColor: color }]}
                  onPress={() => setCustomColor(color)}
                />
              ))}
            </View>
            <View style={styles.iconSelector}>
              {ICONS.map(icon => (
                <TouchableOpacity
                  key={icon}
                  style={[styles.iconChip, customIcon === icon && styles.activeIconChip]}
                  onPress={() => setCustomIcon(icon)}
                >
                  <Ionicons name={(icon as any)} size={20} color={customIcon === icon ? '#FFFFFF' : isDark ? '#9CA3AF' : '#6B7280'} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.modalActions}>
          {isEditing && (
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Text style={[styles.deleteText, { color: isDark ? '#F87171' : '#EF4444' }]}>Bloğu Kaldır</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.saveButton, { backgroundColor: '#339AF0' }]} onPress={handleSave}>
            <Ionicons name="save" size={20} color="#FFFFFF" style={styles.saveIcon} />
            <Text style={[styles.saveButtonText, { color: '#FFFFFF' }]}>{isEditing ? 'Değişiklikleri Kaydet' : 'Planı Oluştur'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    borderRadius: 20,
    maxHeight: '85%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, gap: 18 },
  fieldGroup: { gap: 8 },
  fieldLabel: { fontSize: 13 },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
  },
  subjectSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  activeSubjectChip: { borderWidth: 2 },
  subjectChipText: { fontSize: 13 },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 10,
  },
  timeIcon: { marginRight: 8 },
  timeInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  timeSeparator: { fontSize: 18, fontWeight: '800', color: '#6B7280' },
  repeatSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  repeatChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F8F9FA',
  },
  activeRepeatChip: {
    backgroundColor: '#E7F5FF',
    borderColor: '#339AF0',
  },
  repeatChipText: { fontSize: 13 },
  daysSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  dayChip: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDayChip: {
    backgroundColor: '#339AF0',
    borderColor: '#339AF0',
  },
  dayChipText: { fontSize: 14 },
  colorSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorChip: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  activeColorChip: { borderWidth: 3, transform: [{ scale: 1.1 }] },
  iconSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  iconChip: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconChip: {
    backgroundColor: '#339AF0',
    borderColor: '#339AF0',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  deleteButton: { padding: 8 },
  deleteText: { fontSize: 13, fontWeight: '700' },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  saveIcon: { marginRight: 4 },
  saveButtonText: { fontSize: 15, fontWeight: '700' },
});