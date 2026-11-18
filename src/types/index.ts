export type ThemeMode = 'light' | 'dark' | 'oled';

export interface Subject {
  id: string;
  name: string;
  color: string;
  icon: string; // Ionicons name
  isCustom?: boolean;
}

export interface TimeBlock {
  id: string;
  subjectId: string;
  title: string;
  startTime: string; // "16:30"
  endTime: string;   // "17:15"
  date: string;      // "YYYY-MM-DD" or "general"
  dayOfWeek?: number; // 0 (Sun) - 6 (Sat)
  repeatType: 'once' | 'weekdays' | 'weekend' | 'custom';
  repeatDays?: number[]; // [1, 3, 5]
  isCompleted: boolean;
  notes?: string;
  notificationId?: string;
}

export interface RoutineTemplate {
  id: string;
  name: string;
  description: string;
  blocks: Omit<TimeBlock, 'id' | 'date' | 'isCompleted' | 'notificationId'>[];
}

export interface LgsExamRecord {
  id: string;
  examName: string; // Örn: "1. Kurumsal Deneme"
  date: string;
  turkce: { correct: number; incorrect: number; empty: number };
  matematik: { correct: number; incorrect: number; empty: number };
  fen: { correct: number; incorrect: number; empty: number };
  inkilap: { correct: number; incorrect: number; empty: number };
  din: { correct: number; incorrect: number; empty: number };
  ingilizce: { correct: number; incorrect: number; empty: number };
  totalNet: number;
}

export interface AppSettings {
  theme: ThemeMode;
  preNotificationMinutes: number; // 5 or 10 min before
  enableNotifications: boolean;
  studentName: string;
  targetHighSchool: string; // Örn: "Galatasaray Lisesi / Fen Lisesi"
  customReminderMessage?: string;
}

export type ActiveTab = 'daily' | 'weekly' | 'focus' | 'tracker' | 'settings';
