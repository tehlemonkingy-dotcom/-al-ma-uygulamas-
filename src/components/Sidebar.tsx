import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';

interface SidebarItem {
  id: ActiveTab;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const ITEMS: SidebarItem[] = [
  { id: 'daily', title: 'Günlük Program', icon: 'today-outline' },
  { id: 'weekly', title: 'Haftalık Planlayıcı', icon: 'calendar-outline' },
  { id: 'focus', title: 'Odak & Pomodoro', icon: 'timer-outline' },
  { id: 'tracker', title: 'Soru & Net Takibi', icon: 'stats-chart-outline' },
  { id: 'settings', title: 'Ayarlar & Profil', icon: 'settings-outline' },
];

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, streak, settings } = useApp();

  const isOled = settings.theme === 'oled';
  const isDark = settings.theme === 'dark' || isOled;

  const bgStyle = isOled ? '#000000' : isDark ? '#181824' : '#F8F9FA';
  const borderStyle = isDark ? '#2D2D3F' : '#E9ECEF';
  const textStyle = isDark ? '#F1F3F5' : '#212529';
  const mutedStyle = isDark ? '#909296' : '#6C757D';

  return (
    <View style={[styles.container, { backgroundColor: bgStyle, borderRightColor: borderStyle }]}>
      {/* App Header / Brand */}
      <View style={[styles.brandContainer, { borderBottomColor: borderStyle }]}>
        <View style={styles.logoBadge}>
          <Ionicons name="rocket" size={24} color="#FFF" />
        </View>
        <View style={styles.brandTextContainer}>
          <Text style={[styles.brandTitle, { color: textStyle }]}>LGS Asistanım</Text>
          <Text style={[styles.brandSubtitle, { color: mutedStyle }]}>7. Sınıf Başarı Kampı</Text>
        </View>
      </View>

      {/* Navigation Items */}
      <ScrollView contentContainerStyle={styles.navContainer}>
        {ITEMS.map(item => {
          const isActive = activeTab === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.navItem,
                isActive && { backgroundColor: isDark ? '#2D2D3F' : '#E7F5FF' },
              ]}
              onPress={() => setActiveTab(item.id)}
            >
              <Ionicons
                name={item.icon}
                size={22}
                color={isActive ? '#339AF0' : mutedStyle}
              />
              <Text
                style={[
                  styles.navText,
                  { color: isActive ? '#339AF0' : textStyle, fontWeight: isActive ? '700' : '500' },
                ]}
              >
                {item.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Streak Badge Footer */}
      <View style={[styles.streakCard, { backgroundColor: isDark ? '#252536' : '#FFF3BF', borderColor: isDark ? '#3D3D56' : '#FFE066' }]}>
        <View style={styles.streakRow}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <View>
            <Text style={[styles.streakTitle, { color: textStyle }]}>Günlük Seri</Text>
            <Text style={[styles.streakCount, { color: '#F59F00' }]}>{streak} Gün Kesintisiz!</Text>
          </View>
        </View>
        <Text style={[styles.targetText, { color: mutedStyle }]} numberOfLines={1}>
          🎯 {settings.targetHighSchool}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
    borderRightWidth: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#339AF0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#339AF0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  brandTextContainer: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  brandSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  navContainer: {
    paddingHorizontal: 12,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 6,
  },
  navText: {
    fontSize: 15,
    marginLeft: 14,
  },
  streakCard: {
    margin: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  streakEmoji: {
    fontSize: 28,
    marginRight: 10,
  },
  streakTitle: {
    fontSize: 12,
    opacity: 0.8,
  },
  streakCount: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  targetText: {
    fontSize: 11,
    marginTop: 4,
  },
});
