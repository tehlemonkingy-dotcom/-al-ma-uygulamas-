import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Subject, 
  TimeBlock, 
  RoutineTemplate, 
  LgsExamRecord, 
  AppSettings, 
  ActiveTab,
  ThemeMode 
} from '../types';
import { DEFAULT_SUBJECTS, DEFAULT_TEMPLATES } from '../constants/defaults';
import { requestNotificationPermissions, scheduleBlockNotification, cancelBlockNotification } from '../services/notifications';

interface AppContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  subjects: Subject[];
  timeBlocks: TimeBlock[];
  templates: RoutineTemplate[];
  examRecords: LgsExamRecord[];
  settings: AppSettings;
  streak: number;
  selectedDate: string; // YYYY-MM-DD
  setSelectedDate: (date: string) => void;
  
  // Actions
  addBlock: (block: Omit<TimeBlock, 'id' | 'isCompleted' | 'notificationId'>) => Promise<void>;
  updateBlock: (id: string, updates: Partial<TimeBlock>) => Promise<void>;
  deleteBlock: (id: string) => Promise<void>;
  toggleBlockCompletion: (id: string) => Promise<void>;
  
  addSubject: (subject: Omit<Subject, 'id' | 'isCustom'>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  
  addExamRecord: (record: Omit<LgsExamRecord, 'id' | 'totalNet'>) => Promise<void>;
  deleteExamRecord: (id: string) => Promise<void>;
  
  applyTemplate: (templateId: string, targetDate: string) => Promise<void>;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  
  exportDataJson: () => string;
  importDataJson: (jsonStr: string) => boolean;
  resetAllData: () => Promise<void>;
}

const STORAGE_KEYS = {
  SUBJECTS: '@lgs_subjects',
  BLOCKS: '@lgs_time_blocks',
  TEMPLATES: '@lgs_templates',
  EXAMS: '@lgs_exam_records',
  SETTINGS: '@lgs_settings',
  STREAK: '@lgs_streak',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('daily');
  const [subjects, setSubjects] = useState<Subject[]>(DEFAULT_SUBJECTS);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [templates, setTemplates] = useState<RoutineTemplate[]>(DEFAULT_TEMPLATES);
  const [examRecords, setExamRecords] = useState<LgsExamRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'light',
    preNotificationMinutes: 5,
    enableNotifications: true,
    studentName: '7. Sınıf Başarı Yıldızı',
    targetHighSchool: 'Fen Lisesi / Proje Okulu',
    customReminderMessage: '',
  });
  const [streak, setStreak] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Load data on mount
  useEffect(() => {
    loadStoredData();
    requestNotificationPermissions();
  }, []);

  const loadStoredData = async () => {
    try {
      const [storedSubjects, storedBlocks, storedTemplates, storedExams, storedSettings, storedStreak] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.SUBJECTS),
        AsyncStorage.getItem(STORAGE_KEYS.BLOCKS),
        AsyncStorage.getItem(STORAGE_KEYS.TEMPLATES),
        AsyncStorage.getItem(STORAGE_KEYS.EXAMS),
        AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
        AsyncStorage.getItem(STORAGE_KEYS.STREAK),
      ]);

      if (storedSubjects) setSubjects(JSON.parse(storedSubjects));
      if (storedBlocks) setTimeBlocks(JSON.parse(storedBlocks));
      if (storedTemplates) setTemplates(JSON.parse(storedTemplates));
      if (storedExams) setExamRecords(JSON.parse(storedExams));
      if (storedSettings) setSettings(JSON.parse(storedSettings));
      if (storedStreak) setStreak(JSON.parse(storedStreak));

      // If no blocks exist, pre-load sample blocks for today!
      if (!storedBlocks || JSON.parse(storedBlocks).length === 0) {
        const todayStr = new Date().toISOString().split('T')[0];
        const sampleBlocks: TimeBlock[] = DEFAULT_TEMPLATES[0].blocks.map((b, idx) => ({
          ...b,
          id: `sample-${idx}-${Date.now()}`,
          date: todayStr,
          isCompleted: false,
        }));
        setTimeBlocks(sampleBlocks);
        await AsyncStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(sampleBlocks));
      }
    } catch (error) {
      console.error('Veriler yüklenirken hata:', error);
    }
  };

  const saveToStorage = async (key: string, value: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Veri kaydedilirken hata:', error);
    }
  };

  // Block Actions
  const addBlock = async (blockData: Omit<TimeBlock, 'id' | 'isCompleted' | 'notificationId'>) => {
    const newId = `block-${Date.now()}`;
    const subject = subjects.find(s => s.id === blockData.subjectId);
    let notificationId: string | undefined = undefined;

    if (settings.enableNotifications) {
      notificationId = await scheduleBlockNotification(
        { ...blockData, id: newId, isCompleted: false },
        subject?.name || 'Ders',
        settings.preNotificationMinutes
      );
    }

    const newBlock: TimeBlock = {
      ...blockData,
      id: newId,
      isCompleted: false,
      notificationId,
    };

    const updated = [...timeBlocks, newBlock];
    setTimeBlocks(updated);
    await saveToStorage(STORAGE_KEYS.BLOCKS, updated);
  };

  const updateBlock = async (id: string, updates: Partial<TimeBlock>) => {
    const updated = await Promise.all(
      timeBlocks.map(async block => {
        if (block.id !== id) return block;
        
        const merged = { ...block, ...updates };
        // Handle notification reschedule if time changed
        if (updates.startTime || updates.subjectId) {
          await cancelBlockNotification(block.notificationId);
          if (settings.enableNotifications) {
            const subject = subjects.find(s => s.id === merged.subjectId);
            merged.notificationId = await scheduleBlockNotification(
              merged,
              subject?.name || 'Ders',
              settings.preNotificationMinutes
            );
          }
        }
        return merged;
      })
    );
    setTimeBlocks(updated);
    await saveToStorage(STORAGE_KEYS.BLOCKS, updated);
  };

  const deleteBlock = async (id: string) => {
    const block = timeBlocks.find(b => b.id === id);
    if (block?.notificationId) {
      await cancelBlockNotification(block.notificationId);
    }
    const updated = timeBlocks.filter(b => b.id !== id);
    setTimeBlocks(updated);
    await saveToStorage(STORAGE_KEYS.BLOCKS, updated);
  };

  const toggleBlockCompletion = async (id: string) => {
    const block = timeBlocks.find(b => b.id === id);
    if (!block) return;

    const nextState = !block.isCompleted;
    await updateBlock(id, { isCompleted: nextState });

    // Update streak if completed
    if (nextState) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      await saveToStorage(STORAGE_KEYS.STREAK, newStreak);
    }
  };

  // Subject Actions
  const addSubject = async (subjectData: Omit<Subject, 'id' | 'isCustom'>) => {
    const newSubject: Subject = {
      ...subjectData,
      id: `subj-${Date.now()}`,
      isCustom: true,
    };
    const updated = [...subjects, newSubject];
    setSubjects(updated);
    await saveToStorage(STORAGE_KEYS.SUBJECTS, updated);
  };

  const deleteSubject = async (id: string) => {
    const updated = subjects.filter(s => s.id !== id);
    setSubjects(updated);
    await saveToStorage(STORAGE_KEYS.SUBJECTS, updated);
  };

  // Exam Record Actions
  const addExamRecord = async (recordData: Omit<LgsExamRecord, 'id' | 'totalNet'>) => {
    const calcNet = (sec: { correct: number; incorrect: number }) => sec.correct - sec.incorrect / 4;
    const totalNet = Number((
      calcNet(recordData.turkce) +
      calcNet(recordData.matematik) +
      calcNet(recordData.fen) +
      calcNet(recordData.inkilap) +
      calcNet(recordData.din) +
      calcNet(recordData.ingilizce)
    ).toFixed(2));

    const newRecord: LgsExamRecord = {
      ...recordData,
      id: `exam-${Date.now()}`,
      totalNet,
    };

    const updated = [newRecord, ...examRecords];
    setExamRecords(updated);
    await saveToStorage(STORAGE_KEYS.EXAMS, updated);
  };

  const deleteExamRecord = async (id: string) => {
    const updated = examRecords.filter(e => e.id !== id);
    setExamRecords(updated);
    await saveToStorage(STORAGE_KEYS.EXAMS, updated);
  };

  // Template Application
  const applyTemplate = async (templateId: string, targetDate: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const newBlocks: TimeBlock[] = template.blocks.map((b, idx) => ({
      ...b,
      id: `tpl-${Date.now()}-${idx}`,
      date: targetDate,
      isCompleted: false,
    }));

    // Schedule notifications for template blocks
    const scheduledBlocks = await Promise.all(
      newBlocks.map(async block => {
        const subject = subjects.find(s => s.id === block.subjectId);
        let notificationId = undefined;
        if (settings.enableNotifications) {
          notificationId = await scheduleBlockNotification(
            block,
            subject?.name || 'Ders',
            settings.preNotificationMinutes
          );
        }
        return { ...block, notificationId };
      })
    );

    const updated = [...timeBlocks, ...scheduledBlocks];
    setTimeBlocks(updated);
    await saveToStorage(STORAGE_KEYS.BLOCKS, updated);
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await saveToStorage(STORAGE_KEYS.SETTINGS, updated);
  };

  const exportDataJson = (): string => {
    return JSON.stringify({
      subjects,
      timeBlocks,
      templates,
      examRecords,
      settings,
      streak,
    }, null, 2);
  };

  const importDataJson = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.subjects) setSubjects(data.subjects);
      if (data.timeBlocks) setTimeBlocks(data.timeBlocks);
      if (data.templates) setTemplates(data.templates);
      if (data.examRecords) setExamRecords(data.examRecords);
      if (data.settings) setSettings(data.settings);
      if (data.streak) setStreak(data.streak);
      
      saveToStorage(STORAGE_KEYS.SUBJECTS, data.subjects || subjects);
      saveToStorage(STORAGE_KEYS.BLOCKS, data.timeBlocks || timeBlocks);
      saveToStorage(STORAGE_KEYS.TEMPLATES, data.templates || templates);
      saveToStorage(STORAGE_KEYS.EXAMS, data.examRecords || examRecords);
      saveToStorage(STORAGE_KEYS.SETTINGS, data.settings || settings);
      saveToStorage(STORAGE_KEYS.STREAK, data.streak || streak);
      return true;
    } catch (e) {
      console.error('JSON içe aktarma hatası:', e);
      return false;
    }
  };

  const resetAllData = async () => {
    await AsyncStorage.clear();
    setSubjects(DEFAULT_SUBJECTS);
    setTimeBlocks([]);
    setTemplates(DEFAULT_TEMPLATES);
    setExamRecords([]);
    setStreak(0);
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        subjects,
        timeBlocks,
        templates,
        examRecords,
        settings,
        streak,
        selectedDate,
        setSelectedDate,
        addBlock,
        updateBlock,
        deleteBlock,
        toggleBlockCompletion,
        addSubject,
        deleteSubject,
        addExamRecord,
        deleteExamRecord,
        applyTemplate,
        updateSettings,
        exportDataJson,
        importDataJson,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
