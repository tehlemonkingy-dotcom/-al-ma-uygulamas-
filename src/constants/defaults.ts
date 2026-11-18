import { Subject, RoutineTemplate } from '../types';

export const DEFAULT_SUBJECTS: Subject[] = [
  { id: 'turkce', name: 'Türkçe', color: '#FF6B6B', icon: 'book-outline' },
  { id: 'matematik', name: 'Matematik', color: '#339AF0', icon: 'calculator-outline' },
  { id: 'fen', name: 'Fen Bilimleri', color: '#51CF66', icon: 'flask-outline' },
  { id: 'sosyal', name: 'Sosyal Bilgiler / İnkılap', color: '#FF922B', icon: 'globe-outline' },
  { id: 'din', name: 'Din Kültürü', color: '#CC5DE8', icon: 'heart-outline' },
  { id: 'ingilizce', name: 'İngilizce', color: '#20C997', icon: 'chatbubbles-outline' },
  { id: 'paragraf', name: 'Paragraf Çözümü', color: '#F06595', icon: 'document-text-outline', isCustom: true },
  { id: 'deneme', name: 'Deneme Sınavı', color: '#748FFC', icon: 'trophy-outline', isCustom: true },
  { id: 'kitap', name: 'Kitap Okuma', color: '#FCC419', icon: 'book-sharp', isCustom: true },
  { id: 'mola', name: 'Dinlenme Molası', color: '#868E96', icon: 'cafe-outline', isCustom: true },
];

export const DEFAULT_TEMPLATES: RoutineTemplate[] = [
  {
    id: 'after-school',
    name: 'Okul Sonrası LGS Rutini',
    description: 'Eve dönüş, dinlenme ve temel LGS hazırlık blokları',
    blocks: [
      { subjectId: 'mola', title: 'Eve Dönüş & Dinlenme', startTime: '15:30', endTime: '16:15', repeatType: 'weekdays' },
      { subjectId: 'paragraf', title: 'Günlük 20 Soru Paragraf', startTime: '16:15', endTime: '16:45', repeatType: 'weekdays' },
      { subjectId: 'matematik', title: 'Matematik Yeni Nesil Soru Çözümü', startTime: '17:00', endTime: '18:15', repeatType: 'weekdays' },
      { subjectId: 'mola', title: 'Akşam Yemeği & Aile Molası', startTime: '18:15', endTime: '19:15', repeatType: 'weekdays' },
      { subjectId: 'fen', title: 'Fen Bilimleri Konu Tekrarı & Soru', startTime: '19:30', endTime: '20:30', repeatType: 'weekdays' },
      { subjectId: 'kitap', title: '15 Dakika Kitap Okuma', startTime: '20:45', endTime: '21:15', repeatType: 'weekdays' },
    ],
  },
  {
    id: 'weekend-study',
    name: 'Hafta Sonu Yoğun Kamp',
    description: 'Deneme analizi, Türkçe ve sosyal odaklı cumartesi programı',
    blocks: [
      { subjectId: 'deneme', title: 'LGS Deneme Sınavı Çözümü', startTime: '10:00', endTime: '12:00', repeatType: 'weekend' },
      { subjectId: 'mola', title: 'Öğle Molası & Dinlenme', startTime: '12:00', endTime: '13:30', repeatType: 'weekend' },
      { subjectId: 'turkce', title: 'Türkçe Sözel Mantık & Soru', startTime: '13:30', endTime: '15:00', repeatType: 'weekend' },
      { subjectId: 'sosyal', title: 'Sosyal Bilgiler & Din Kültürü', startTime: '15:15', endTime: '16:30', repeatType: 'weekend' },
    ],
  },
];
