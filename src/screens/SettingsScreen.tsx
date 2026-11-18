import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, TextInput, Alert, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { AppSettings, ThemeMode } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_TABLET = SCREEN_WIDTH >= 768;

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings, exportDataJson, importDataJson, resetAllData } = useApp();

  const theme = settings.theme;
  const isDark = theme === 'dark' || theme === 'oled';
  const isOled = theme === 'oled';

  const cardBg = isOled ? '#111111' : isDark ? '#1E1E28' : '#FFFFFF';
  const borderColor = isDark ? '#2D2D3F' : '#E5E7EB';
  const textColor = isDark ? '#E8EAED' : '#111827';
  const mutedColor = isDark ? '#9CA3AF' : '#6B7280';
  const bgColor = isOled ? '#000000' : isDark ? '#121218' : '#F8F9FA';
  const inputBg = isDark ? '#121218' : '#FFFFFF';

  const [customMessage, setCustomMessage] = useState(settings.customReminderMessage || '');

  const THEMES: { id: ThemeMode; label: string; icon: string; color: string }[] = [
    { id: 'light', label: 'Açık Mod', icon: 'sunny-outline', color: '#F59F00' },
    { id: 'dark', label: 'Koyu Mod', icon: 'moon-outline', color: '#339AF0' },
    { id: 'oled', label: 'Gece Modu (OLED Siyah)', icon: 'moon-outline', color: '#868E96' },
  ];

  const handleThemeChange = (id: ThemeMode) => {
    updateSettings({ theme: id });
  };

  const handleExport = () => {
    const json = exportDataJson();
    Alert.alert(
      'Yedek Oluşturuldu',
      'LGS Asistanım verileriniz JSON olarak hazırlandı. Kopyalayıp güvenli bir yere kaydedebilirsiniz.',
      [
        { text: 'Kopyala', onPress: () => { /* copy to clipboard could be added */ } },
        { text: 'Tamam', style: 'cancel' },
      ]
    );
    console.log('EXPORT JSON:', json);
  };

  const handleImport = () => {
    Alert.alert(
      'JSON İçe Aktarma',
      'Yedek JSON içeriğini yapıştırın:',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'İçe Aktar',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Bilgi', 'JSON içe aktarma için geliştirici konsolunu kullanın veya bir TextInput ekleyin.');
          },
        },
      ]
    );
  };

  const handleReset = () => {
    Alert.alert(
      'Tüm Verileri Sıfırla',
      'Bu işlem geri alınamaz. Tüm dersler, planlar ve kayıtlar silinecektir.',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Sıfırla', style: 'destructive', onPress: resetAllData },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollView: { flex: 1 },
    scrollContent: { paddingBottom: 100 },
    headerRow: {
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    headerTitle: { fontSize: 22, fontWeight: '800' },
    card: {
      marginHorizontal: 20,
      marginBottom: 16,
      padding: 18,
      borderRadius: 16,
      borderWidth: 1,
    },
    sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 14 },
    profileRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    profileAvatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: '#E7F5FF',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
    profileInfo: { flex: 1 },
    profileName: { marginBottom: 4 },
    profileTarget: { fontSize: 13, opacity: 0.8 },
    editFields: { gap: 10 },
    input: {
      height: 44,
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 12,
    },
    themeSelector: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    themeItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      gap: 8,
      minWidth: 140,
    },
    activeTheme: { borderWidth: 2 },
    themeLabel: { fontSize: 14 },
    toggleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },
    toggleLabel: { fontSize: 14, fontWeight: '600' },
    preMinSelector: {
      flexDirection: 'row',
      gap: 8,
    },
    preMinItem: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
    },
    activePreMin: {
      backgroundColor: '#E7F5FF',
      borderColor: '#339AF0',
    },
    preMinText: { fontSize: 14 },
    customMsgRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      marginBottom: 14,
    },
    saveMsgButton: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
    },
    saveMsgButtonText: { fontSize: 13, fontWeight: '700' },
    actionRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 10,
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
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 1,
    },
    infoLabel: { fontSize: 14 },
    infoValue: { fontSize: 14, fontWeight: '600' },
  });

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            Özelleştirme & Ayarlar
          </Text>
        </View>

        {/* Profile Card */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Öğrenci Profili
          </Text>
          <View style={styles.profileRow}>
            <View style={styles.profileAvatar}>
              <Ionicons name="person-circle" size={44} color="#339AF0" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: textColor, fontWeight: '800' }]}>
                {settings.studentName || '7. Sınıf Öğrencisi'}
              </Text>
              <Text style={[styles.profileTarget, { color: mutedColor }]}>
                Hedef Lise: {settings.targetHighSchool || 'Belirlenmedi'}
              </Text>
            </View>
          </View>
          <View style={styles.editFields}>
            <TextInput
              style={[styles.input, { color: textColor, backgroundColor: inputBg, borderColor }]}
              value={settings.studentName}
              onChangeText={t => updateSettings({ studentName: t })}
              placeholder="Öğrenci Adınız"
            />
            <TextInput
              style={[styles.input, { color: textColor, backgroundColor: inputBg, borderColor }]}
              value={settings.targetHighSchool}
              onChangeText={t => updateSettings({ targetHighSchool: t })}
              placeholder="Hedef Liseniz"
            />
          </View>
        </View>

        {/* Theme Selection */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Görünüm Teması
          </Text>
          <View style={styles.themeSelector}>
            {THEMES.map(t => (
              <TouchableOpacity
                key={t.id}
                style={[styles.themeItem, theme === t.id && styles.activeTheme, { borderColor: theme === t.id ? t.color : 'transparent', backgroundColor: theme === t.id ? '#E7F5FF' : 'transparent' }]}
                onPress={() => handleThemeChange(t.id)}
              >
                <Ionicons name={(t.icon as any)} size={22} color={theme === t.id ? t.color : mutedColor} />
                <Text style={[styles.themeLabel, { color: theme === t.id ? t.color : textColor, fontWeight: theme === t.id ? '800' : '600' }]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notifications */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Bildirim Ayarları
          </Text>
          <View style={styles.toggleRow}>
            <Text style={[styles.toggleLabel, { color: textColor }]}>
              Yerel Bildirimleri Etkinleştir
            </Text>
            <Switch
              value={settings.enableNotifications}
              onValueChange={v => updateSettings({ enableNotifications: v })}
              trackColor={{ false: borderColor, true: '#339AF0' }}
              thumbColor={settings.enableNotifications ? '#339AF0' : mutedColor}
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={[styles.toggleLabel, { color: textColor }]}>
              Ön Hatırlatma (dakika önce)
            </Text>
            <View style={styles.preMinSelector}>
              {[5, 10].map(min => (
                <TouchableOpacity
                  key={min}
                  style={[styles.preMinItem, settings.preNotificationMinutes === min && styles.activePreMin, { borderColor: settings.preNotificationMinutes === min ? '#339AF0' : borderColor }]}
                  onPress={() => updateSettings({ preNotificationMinutes: min })}
                >
                  <Text style={[styles.preMinText, { color: settings.preNotificationMinutes === min ? '#339AF0' : mutedColor, fontWeight: '700' }]}>
                    {min} dk
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.customMsgRow}>
            <Text style={[styles.toggleLabel, { color: textColor }]}>
              Özel Hatırlatma Mesajı
            </Text>
            <TextInput
              style={[styles.input, { color: textColor, backgroundColor: inputBg, borderColor }]}
              value={customMessage}
              onChangeText={setCustomMessage}
              placeholder="Örn: Çalışma vaktin geliyor, masanı hazırla!"
            />
            <TouchableOpacity
              style={[styles.saveMsgButton, { backgroundColor: '#339AF0' }]}
              onPress={() => updateSettings({ customReminderMessage: customMessage })}
            >
              <Text style={[styles.saveMsgButtonText, { color: '#FFFFFF' }]}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Data Management */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Veri Yedekleme
          </Text>
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#10B981' }]} onPress={handleExport}>
              <Ionicons name="cloud-upload" size={20} color="#FFFFFF" />
              <Text style={[styles.actionText, { color: '#FFFFFF' }]}>JSON Yedek Oluştur</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: isDark ? '#2D2D3F' : '#F3F4F6' }]} onPress={handleImport}>
              <Ionicons name="cloud-download" size={20} color={mutedColor} />
              <Text style={[styles.actionText, { color: textColor }]}>JSON İçe Aktar</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#EF4444', marginTop: 10 }]} onPress={handleReset}>
            <Ionicons name="trash" size={20} color="#FFFFFF" />
            <Text style={[styles.actionText, { color: '#FFFFFF' }]}>Tüm Verileri Sıfırla</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Hakkında
          </Text>
          <View style={[styles.infoRow, { borderBottomColor: borderColor }]}>
            <Text style={[styles.infoLabel, { color: mutedColor }]}>
              Uygulama Sürümü
            </Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              1.0.0
            </Text>
          </View>
          <View style={[styles.infoRow, { borderBottomColor: borderColor }]}>
            <Text style={[styles.infoLabel, { color: mutedColor }]}>
              Platform
            </Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              iPadOS / LGS Asistanım
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};