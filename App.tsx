import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, Dimensions, Platform, StatusBar, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider, useApp } from './src/context/AppContext';
import { Sidebar } from './src/components/Sidebar';
import { ActiveTab } from './src/types';
import { DailyScheduleScreen } from './src/screens/DailyScheduleScreen';
import { WeeklyPlannerScreen } from './src/screens/WeeklyPlannerScreen';
import { FocusTimerScreen } from './src/screens/FocusTimerScreen';
import { TrackerScreen } from './src/screens/TrackerScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_TABLET = SCREEN_WIDTH >= 768;
const SIDEBAR_WIDTH = 280;

export default function App() {
  return (
    <AppProvider>
      <LgsApp />
    </AppProvider>
  );
}

function LgsApp() {
  const { settings } = useApp();
  const isDark = settings.theme === 'dark' || settings.theme === 'oled';
  const isOled = settings.theme === 'oled';

  const bgColor = isOled ? '#000000' : isDark ? '#121218' : '#F8F9FA';

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: bgColor }, styles.safeArea]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={bgColor} />
      {IS_TABLET ? <IpadLayout /> : <PhoneLayout />}
    </SafeAreaView>
  );
}

function IpadLayout() {
  const { activeTab, setActiveTab } = useApp();

  return (
    <View style={styles.ipadContainer}>
      <Sidebar />
      <View style={styles.contentArea}>
        <ScreenRouter tab={activeTab} setActiveTab={setActiveTab} />
      </View>
    </View>
  );
}

function PhoneLayout() {
  const { activeTab, setActiveTab } = useApp();
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <View style={styles.phoneContainer}>
      {showSidebar && (
        <Pressable style={styles.sidebarOverlay} onPress={() => setShowSidebar(false)} />
      )}
      <View style={[styles.sidebar, showSidebar && styles.sidebarOpen]}>
        <View style={styles.sidebarHeader}>
          <Pressable onPress={() => setShowSidebar(false)} style={styles.touchLight}>
            <Ionicons name="arrow-back" size={24} color="#339AF0" />
          </Pressable>
          <Text style={styles.sidebarTitle}>Menü</Text>
        </View>
        <Sidebar />
      </View>
      <View style={styles.contentArea}>
        <View style={styles.phoneHeader}>
          <Pressable onPress={() => setShowSidebar(true)} style={styles.touchLight}>
            <Ionicons name="menu" size={26} color="#339AF0" />
          </Pressable>
          <Text style={styles.phoneHeaderTitle}>LGS Asistanım</Text>
        </View>
        <ScreenRouter tab={activeTab} setActiveTab={setActiveTab} />
      </View>
    </View>
  );
}

function ScreenRouter({ tab, setActiveTab }: { tab: string; setActiveTab: (t: ActiveTab) => void }) {
  switch (tab) {
    case 'daily': return <DailyScheduleScreen />;
    case 'weekly': return <WeeklyPlannerScreen />;
    case 'focus': return <FocusTimerScreen />;
    case 'tracker': return <TrackerScreen />;
    case 'settings': return <SettingsScreen />;
    default: return <DailyScheduleScreen />;
  }
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  ipadContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  phoneContainer: {
    flex: 1,
    position: 'relative',
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 100,
    transform: [{ translateX: '-100%' }],
  },
  sidebarOpen: {
    transform: [{ translateX: '0%' }],
  },
  sidebarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 90,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
  },
  phoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  phoneHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
    flex: 1,
  },
  touchLight: { padding: 8 },
});