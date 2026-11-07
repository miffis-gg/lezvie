export type ServiceId =
  | 'haircut'
  | 'haircut-beard'
  | 'beard'
  | 'kids'
  | 'long-hair'
  | 'buzz-cut'
  | 'gray-blending'
  | 'care'
  | 'precise'
  | 'complete'
  | 'regular';
export type Category = 'Стрижки' | 'Борода' | 'Комплексы' | 'Детям' | 'Уход';
export interface Service {
  id: ServiceId;
  title: string;
  shortDescription: string;
  durationMinutes: number;
  price: number;
  masterIds: string[];
  category: Category;
  isPackage?: boolean;
}
export interface Master {
  id: string;
  name: string;
  role: string;
  specialties: ServiceId[];
  description: string;
  experience: string;
  image: string;
  availableSlotIds: string[];
}
export interface TimeSlot {
  id: string;
  masterId: string;
  date: string;
  time: string;
  available: boolean;
}
export interface GalleryItem {
  id: string;
  masterId: string;
  serviceId: ServiceId;
  image: string;
  alt: string;
  title: string;
  category: 'Короткие стрижки' | 'Средняя длина' | 'Борода' | 'Комплексы';
}
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}
export interface BookingData {
  serviceId: ServiceId | '';
  masterId: string;
  slotId: string;
  name: string;
  phone: string;
  comment: string;
  consent: boolean;
}
export type ContactErrors = Partial<Record<'name' | 'phone' | 'comment' | 'consent', string>>;
