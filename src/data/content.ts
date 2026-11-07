import type { FAQItem, GalleryItem, Master, Service, TimeSlot } from '../types/content';

export const asset = (name: string) => `${import.meta.env.BASE_URL}images/${name}.webp`;
export const money = (value: number) => `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;
export const services: Service[] = [
  {
    id: 'haircut',
    title: 'Мужская стрижка',
    shortDescription: 'Форма, мытьё и укладка по вашему ритму.',
    durationMinutes: 60,
    price: 2200,
    masterIds: ['artem', 'maxim', 'ilya', 'nikita'],
    category: 'Стрижки',
  },
  {
    id: 'haircut-beard',
    title: 'Стрижка + борода',
    shortDescription: 'Одна встреча — цельный образ.',
    durationMinutes: 90,
    price: 3200,
    masterIds: ['artem', 'maxim'],
    category: 'Комплексы',
  },
  {
    id: 'beard',
    title: 'Оформление бороды',
    shortDescription: 'Длина, контур и аккуратная форма.',
    durationMinutes: 45,
    price: 1500,
    masterIds: ['artem', 'maxim'],
    category: 'Борода',
  },
  {
    id: 'kids',
    title: 'Детская стрижка',
    shortDescription: 'Спокойное знакомство с новой формой.',
    durationMinutes: 45,
    price: 1700,
    masterIds: ['nikita'],
    category: 'Детям',
  },
  {
    id: 'long-hair',
    title: 'Стрижка на длинные волосы',
    shortDescription: 'Сохранить длину, выстроить силуэт.',
    durationMinutes: 75,
    price: 2600,
    masterIds: ['maxim'],
    category: 'Стрижки',
  },
  {
    id: 'buzz-cut',
    title: 'Стрижка машинкой',
    shortDescription: 'Короткая длина и чистые переходы.',
    durationMinutes: 30,
    price: 1300,
    masterIds: ['artem', 'ilya'],
    category: 'Стрижки',
  },
  {
    id: 'gray-blending',
    title: 'Камуфляж седины',
    shortDescription: 'Мягкая коррекция тона волос.',
    durationMinutes: 45,
    price: 1800,
    masterIds: ['maxim', 'ilya'],
    category: 'Уход',
  },
  {
    id: 'care',
    title: 'Уход за кожей головы',
    shortDescription: 'Очищение и подбор домашнего ухода.',
    durationMinutes: 30,
    price: 1200,
    masterIds: ['ilya'],
    category: 'Уход',
  },
];
export const packages: Service[] = [
  {
    id: 'precise',
    title: 'Точная форма',
    shortDescription: 'Стрижка + укладка. Время на детали и форму.',
    durationMinutes: 75,
    price: 2500,
    masterIds: ['artem', 'maxim', 'ilya', 'nikita'],
    category: 'Комплексы',
    isPackage: true,
  },
  {
    id: 'complete',
    title: 'Полный комплект',
    shortDescription: 'Стрижка + борода + уход. Всё за один визит.',
    durationMinutes: 110,
    price: 3900,
    masterIds: ['artem', 'maxim'],
    category: 'Комплексы',
    isPackage: true,
  },
  {
    id: 'regular',
    title: 'Регулярный визит',
    shortDescription:
      'Три стрижки по 2 200 ₽. Сейчас выбирается время первого визита, ещё два — отдельно. Без оплаты.',
    durationMinutes: 60,
    price: 6600,
    masterIds: ['artem', 'maxim', 'ilya', 'nikita'],
    category: 'Комплексы',
    isPackage: true,
  },
];
export const allServices = [...services, ...packages];

const dateString = (offset: number) => {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
export const dates = Array.from({ length: 7 }, (_, i) => dateString(i));
export const dateLabel = (date: string, compact = false) =>
  new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: compact ? 'short' : 'long' }).format(
    new Date(`${date}T12:00:00`),
  );
export const dayLabel = (date: string) =>
  new Intl.DateTimeFormat('ru-RU', { weekday: 'short' }).format(new Date(`${date}T12:00:00`));
export const slots: TimeSlot[] = ['artem', 'maxim', 'ilya', 'nikita'].flatMap((masterId, mi) =>
  dates.flatMap((date, di) => {
    if (di === 6) return [];
    const times = di === 0 ? ['19:30', '20:00'] : ['10:00', '12:00', '14:30', '17:00', '19:30'];
    return times.map((time, ti) => ({
      id: `${masterId}-${di}-${ti}`,
      masterId,
      date,
      time,
      available: (ti + mi + di) % 4 !== 3,
    }));
  }),
);
export const masters: Master[] = [
  {
    id: 'artem',
    name: 'Артём Волков',
    role: 'Барбер',
    specialties: [
      'haircut',
      'haircut-beard',
      'beard',
      'buzz-cut',
      'precise',
      'complete',
      'regular',
    ],
    description: 'Короткие формы, fade, классические стрижки',
    experience: '7 лет',
    image: asset('artem'),
    availableSlotIds: [],
  },
  {
    id: 'maxim',
    name: 'Максим Орлов',
    role: 'Старший барбер',
    specialties: [
      'haircut',
      'haircut-beard',
      'beard',
      'long-hair',
      'gray-blending',
      'precise',
      'complete',
      'regular',
    ],
    description: 'Борода, комплексы, длинные волосы',
    experience: '10 лет',
    image: asset('maxim'),
    availableSlotIds: [],
  },
  {
    id: 'ilya',
    name: 'Илья Серов',
    role: 'Барбер',
    specialties: ['haircut', 'buzz-cut', 'gray-blending', 'care', 'precise', 'regular'],
    description: 'Текстурные стрижки, машинка, уход',
    experience: '5 лет',
    image: asset('ilya'),
    availableSlotIds: [],
  },
  {
    id: 'nikita',
    name: 'Никита Лебедев',
    role: 'Барбер',
    specialties: ['haircut', 'kids', 'precise', 'regular'],
    description: 'Детские и классические стрижки',
    experience: '6 лет',
    image: asset('nikita'),
    availableSlotIds: [],
  },
].map((master) => ({
  ...master,
  specialties: master.specialties as Service['id'][],
  availableSlotIds: slots
    .filter((slot) => slot.masterId === master.id && slot.available)
    .map((slot) => slot.id),
}));
export const nearestFor = (masterId?: string, service?: Service) =>
  slots.find(
    (s) =>
      s.available &&
      (!masterId || s.masterId === masterId) &&
      (!service || service.masterIds.includes(s.masterId)),
  );
export const slotLabel = (slot?: TimeSlot) =>
  slot
    ? `${slot.date === dates[0] ? 'Сегодня' : dateLabel(slot.date, true)}, ${slot.time}`
    : 'Нет свободного времени';

export const gallery: GalleryItem[] = [
  {
    id: 'work-1',
    masterId: 'artem',
    serviceId: 'haircut',
    image: asset('work-1'),
    alt: 'Короткая мужская стрижка с плавным переходом на виске, вид сбоку',
    title: 'Чистый переход',
    category: 'Короткие стрижки',
  },
  {
    id: 'work-2',
    masterId: 'maxim',
    serviceId: 'long-hair',
    image: asset('work-2'),
    alt: 'Мужская стрижка средней длины с естественной волнистой текстурой',
    title: 'Естественная текстура',
    category: 'Средняя длина',
  },
  {
    id: 'work-3',
    masterId: 'maxim',
    serviceId: 'beard',
    image: asset('work-3'),
    alt: 'Аккуратно оформленная короткая борода в профиль',
    title: 'Контур и длина',
    category: 'Борода',
  },
  {
    id: 'work-4',
    masterId: 'ilya',
    serviceId: 'buzz-cut',
    image: asset('work-4'),
    alt: 'Короткая стрижка машинкой с мягким переходом на затылке',
    title: 'Короткая форма',
    category: 'Короткие стрижки',
  },
  {
    id: 'work-5',
    masterId: 'artem',
    serviceId: 'haircut-beard',
    image: asset('work-5'),
    alt: 'Мужская текстурная стрижка и короткая борода в три четверти',
    title: 'Цельный силуэт',
    category: 'Комплексы',
  },
  {
    id: 'work-6',
    masterId: 'nikita',
    serviceId: 'haircut',
    image: asset('work-6'),
    alt: 'Классическая мужская стрижка с боковым пробором, вид сзади и сбоку',
    title: 'Спокойная классика',
    category: 'Средняя длина',
  },
];
export const faq: FAQItem[] = [
  {
    id: 'choose',
    question: 'Как выбрать услугу, если я не знаю её название?',
    answer:
      'Ориентируйтесь на длину волос и желаемый результат. Для обычной смены формы подойдёт «Мужская стрижка». В реальном барбершопе состав услуги стоит уточнить до визита.',
  },
  {
    id: 'wash',
    question: 'Нужно ли мыть голову перед визитом?',
    answer:
      'В нашем демонстрационном сценарии мытьё входит в мужскую стрижку. У реального барбершопа состав услуги может отличаться.',
  },
  {
    id: 'reference',
    question: 'Можно ли показать фотографию желаемой стрижки?',
    answer:
      'Да, референс помогает обсудить длину и форму. В демонстрационном сценарии мастер сначала уточняет детали, а затем приступает к работе.',
  },
  {
    id: 'late',
    question: 'Что произойдёт при опоздании?',
    answer:
      'В концепции сервиса об опоздании предупреждают заранее и обсуждают перенос. Реальные условия определяет конкретный барбершоп.',
  },
  {
    id: 'change',
    question: 'Можно ли изменить или отменить демонстрационную запись?',
    answer:
      'До подтверждения вернитесь на любой пройденный шаг. После подтверждения нажмите «Записаться ещё раз». Настоящая запись не создаётся, отменять её не требуется.',
  },
  {
    id: 'duration',
    question: 'Сколько длится стрижка с бородой?',
    answer:
      'Демонстрационная услуга «Стрижка + борода» занимает 90 минут и стоит 3 200 ₽. Комплекс с дополнительным уходом — 110 минут и 3 900 ₽.',
  },
  {
    id: 'kids',
    question: 'Можно ли прийти с ребёнком?',
    answer:
      'В каталоге есть демонстрационная детская стрижка у Никиты Лебедева: 45 минут, 1 700 ₽. В реальном проекте возраст и условия нужно согласовать с барбершопом.',
  },
  {
    id: 'privacy',
    question: 'Отправляются ли данные из формы?',
    answer:
      'Нет. Форма работает только в браузере. Контакты не отправляются по сети и не сохраняются. После обновления страницы все введённые данные исчезают.',
  },
];
export const visitSteps = [
  { title: 'Выберите услугу', text: 'Цена и длительность видны заранее.' },
  { title: 'Покажите референс', text: 'Можно принести фотографию желаемой формы.' },
  { title: 'Обсудите детали', text: 'Длина, укладка и привычный уход — до начала работы.' },
  { title: 'Получите рекомендации', text: 'Короткие советы по поддержанию формы.' },
];
export const rules = [
  'Консультация перед началом',
  'Согласование длины и формы',
  'Чистое рабочее место и обработка инструмента',
  'Обсуждение опозданий и переноса',
  'Без навязанных дополнительных услуг',
];
export const navigation = [
  { href: '#services', label: 'Услуги' },
  { href: '#masters', label: 'Мастера' },
  { href: '#works', label: 'Работы' },
  { href: '#first-visit', label: 'Первый визит' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contacts', label: 'Контакты' },
];
