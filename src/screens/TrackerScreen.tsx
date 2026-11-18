import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, FlatList, Dimensions, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { LgsExamRecord } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_TABLET = SCREEN_WIDTH >= 768;

export const TrackerScreen: React.FC = () => {
  const { examRecords, addExamRecord, deleteExamRecord } = useApp();

  const theme = 'light'; // settings not destructured to avoid unused
  const isDark = false;

  const [examName, setExamName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showForm, setShowForm] = useState(false);

  // Form fields: correct, incorrect, empty per subject
  type FormSection = { correct: number; incorrect: number; empty: number };
  type ExamForm = Record<string, FormSection>;

  const [form, setForm] = useState<ExamForm>({
    turkce: { correct: 0, incorrect: 0, empty: 0 },
    matematik: { correct: 0, incorrect: 0, empty: 0 },
    fen: { correct: 0, incorrect: 0, empty: 0 },
    inkilap: { correct: 0, incorrect: 0, empty: 0 },
    din: { correct: 0, incorrect: 0, empty: 0 },
    ingilizce: { correct: 0, incorrect: 0, empty: 0 },
  });

  const subjects = [
    { key: 'turkce', label: 'Türkçe' },
    { key: 'matematik', label: 'Matematik' },
    { key: 'fen', label: 'Fen Bilimleri' },
    { key: 'inkilap', label: 'Sosyal Bilgiler / İnkılap' },
    { key: 'din', label: 'Din Kültürü' },
    { key: 'ingilizce', label: 'İngilizce' },
  ];

  const calcNet = (sec: { correct: number; incorrect: number }) => sec.correct - sec.incorrect / 4;
  const totalNet = examRecords.length > 0
    ? Number(examRecords[0].totalNet.toFixed(2))
    : 0;

  const emptyForm: ExamForm = {
    turkce: { correct: 0, incorrect: 0, empty: 0 },
    matematik: { correct: 0, incorrect: 0, empty: 0 },
    fen: { correct: 0, incorrect: 0, empty: 0 },
    inkilap: { correct: 0, incorrect: 0, empty: 0 },
    din: { correct: 0, incorrect: 0, empty: 0 },
    ingilizce: { correct: 0, incorrect: 0, empty: 0 },
  };

  const handleSaveExam = () => {
    if (!examName.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen sınav adını giriniz.');
      return;
    }
    addExamRecord({
      examName,
      date,
      turkce: form.turkce,
      matematik: form.matematik,
      fen: form.fen,
      inkilap: form.inkilap,
      din: form.din,
      ingilizce: form.ingilizce,
    });
    setExamName('');
    setShowForm(false);
    setForm({ ...emptyForm });
    Alert.alert('Başarılı', 'Sınav sonucu kaydedildi!');
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Silmeyi Onayla',
      'Bu sınav kaydını silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: () => deleteExamRecord(id) },
      ]
    );
  };

  const updateField = (subjectKey: string, field: 'correct' | 'incorrect' | 'empty', value: number) => {
    setForm(prev => {
      const next: ExamForm = { ...prev };
      next[subjectKey] = { ...next[subjectKey], [field]: value };
      return next;
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: '#F8F9FA' }]}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: '#111827' }]}>
            Soru & Net Takibi
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: '#339AF0' }]}
            onPress={() => setShowForm(true)}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={[styles.addButtonText, { color: '#FFFFFF' }]}>Yeni Deneme</Text>
          </TouchableOpacity>
        </View>

        {/* Net Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: '#6B7280' }]}>
                En Son Net
              </Text>
              <Text style={[styles.summaryValue, { color: '#10B981', fontWeight: '800' }]}>
                {totalNet}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: '#6B7280' }]}>
                Kayıt Sayısı
              </Text>
              <Text style={[styles.summaryValue, { color: '#339AF0', fontWeight: '800' }]}>
                {examRecords.length}
              </Text>
            </View>
          </View>
          <View style={styles.summaryNote}>
            <Text style={[styles.summaryNoteText, { color: '#9CA3AF' }]}>
              LGS net hesaplaması: Doğru - (Yanlış ÷ 4)
            </Text>
          </View>
        </View>

        {/* Add Form */}
        {showForm && (
          <View style={styles.formCard}>
            <Text style={[styles.formTitle, { color: '#111827', fontWeight: '800' }]}>
              Yeni Deneme Sınavı Sonucu
            </Text>
            <View style={styles.formRow}>
              <Text style={[styles.formLabel, { color: '#6B7280' }]}>
                Sınav Adı
              </Text>
              <TextInput
                style={[styles.input, { color: '#111827' }]}
                value={examName}
                onChangeText={setExamName}
                placeholder="Örn: 1. Kurumsal Deneme"
              />
            </View>
            <View style={styles.formRow}>
              <Text style={[styles.formLabel, { color: '#6B7280' }]}>
                Tarih
              </Text>
              <TextInput
                style={[styles.input, { color: '#111827' }]}
                value={date}
                onChangeText={setDate}
              />
            </View>
            {subjects.map(sub => (
              <View key={sub.key} style={styles.subjectSection}>
                <Text style={[styles.subjectLabel, { color: '#374151', fontWeight: '700' }]}>
                  {sub.label}
                </Text>
                <View style={styles.inputsRow}>
                  {[['correct', 'Doğru'], ['incorrect', 'Yanlış'], ['empty', 'Boş']].map(([field, label]) => (
                    <View key={field} style={styles.inputCell}>
                      <Text style={[styles.inputCellLabel, { color: '#9CA3AF' }]}>{label}</Text>
                      <TextInput
                        style={[styles.smallInput, { color: '#111827' }]}
                        value={String((form[sub.key] as FormSection)[field as keyof FormSection])}
                        onChangeText={val => updateField(sub.key, field as 'correct' | 'incorrect' | 'empty', parseInt(val) || 0)}
                        keyboardType="numeric"
                      />
                    </View>
                  ))}
                </View>
              </View>
            ))}
            <TouchableOpacity style={[styles.saveButton, { backgroundColor: '#10B981' }]} onPress={handleSaveExam}>
              <Text style={[styles.saveButtonText, { color: '#FFFFFF' }]}>
                Kaydet & Net Hesapla
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Records List */}
        <View style={styles.recordsSection}>
          <Text style={[styles.sectionTitle, { color: '#374151', fontWeight: '800' }]}>
            Deneme Sınavı Geçmişi
          </Text>
          {examRecords.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color="#CBD5E1" />
              <Text style={[styles.emptyTitle, { color: '#6B7280' }]}>
                Henüz sınav kaydı yok
              </Text>
              <Text style={[styles.emptySubtitle, { color: '#9CA3AF' }]}>
                "+ Yeni Deneme" düğmesine basarak ilk deneme sınavı sonucunuzu kaydedin.
              </Text>
            </View>
          ) : (
            <FlatList
              data={examRecords}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.recordRow, { borderColor: '#E5E7EB' }]}
                  onPress={() => handleDelete(item.id)}
                >
                  <View style={styles.recordInfo}>
                    <Text style={[styles.recordName, { color: '#111827', fontWeight: '700' }]}>
                      {item.examName}
                    </Text>
                    <Text style={[styles.recordDate, { color: '#6B7280', fontSize: 12 }]}>
                      {item.date}
                    </Text>
                  </View>
                  <View style={styles.recordNet}>
                    <Text style={[styles.netValue, { color: '#10B981', fontWeight: '800', fontSize: 20 }]}>
                      {item.totalNet}
                    </Text>
                    <Text style={[styles.netLabel, { color: '#9CA3AF', fontSize: 12 }]}>
                      Net
                    </Text>
                  </View>
                  <Ionicons name="trash" size={20} color="#EF4444" style={styles.trashIcon} />
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
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
  summaryCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryItem: { alignItems: 'center' },
  summaryLabel: { fontSize: 13, marginBottom: 4 },
  summaryValue: { fontSize: 24 },
  summaryNote: { marginTop: 8 },
  summaryNoteText: { fontSize: 12 },
  formCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  formTitle: { marginBottom: 16 },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  formLabel: { fontSize: 13 },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginLeft: 10,
    minWidth: 120,
  },
  subjectSection: { marginBottom: 16 },
  subjectLabel: { marginBottom: 8 },
  inputsRow: { flexDirection: 'row', gap: 8 },
  inputCell: { flex: 1, alignItems: 'center' },
  inputCellLabel: { fontSize: 11, marginBottom: 4 },
  smallInput: {
    height: 36,
    width: 44,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    textAlign: 'center',
  },
  saveButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: { fontSize: 15, fontWeight: '700' },
  recordsSection: { marginHorizontal: 20 },
  sectionTitle: { marginBottom: 12 },
  listContent: { paddingBottom: 20 },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  recordInfo: { flex: 1 },
  recordName: { marginBottom: 2 },
  recordDate: { fontSize: 12 },
  recordNet: { alignItems: 'flex-end', minWidth: 70 },
  netValue: { marginBottom: 2 },
  netLabel: { fontSize: 11 },
  trashIcon: { marginLeft: 12 },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});