import type { BookingData, ContactErrors, Service, TimeSlot } from '../types/content';
export const emptyBooking = (): BookingData => ({
  serviceId: '',
  masterId: '',
  slotId: '',
  name: '',
  phone: '',
  comment: '',
  consent: false,
});
export function changeService(data: BookingData, service: Service): BookingData {
  const compatible = service.masterIds.includes(data.masterId);
  return { ...data, serviceId: service.id, masterId: compatible ? data.masterId : '', slotId: '' };
}
export function validateContacts(data: BookingData): ContactErrors {
  const errors: ContactErrors = {};
  const length = data.name.trim().length;
  if (length < 2 || length > 60) errors.name = 'Укажите имя: от 2 до 60 символов.';
  const phoneLength = data.phone.replace(/\D/g, '').length;
  if (phoneLength < 10 || phoneLength > 15) errors.phone = 'Укажите телефон: от 10 до 15 цифр.';
  if (data.comment.length > 500) errors.comment = 'Сократите комментарий до 500 символов.';
  if (!data.consent) errors.consent = 'Подтвердите, что понимаете условия демоформы.';
  return errors;
}
export function validSelection(data: BookingData, services: Service[], slots: TimeSlot[]): boolean {
  const service = services.find((s) => s.id === data.serviceId);
  const slot = slots.find((s) => s.id === data.slotId);
  return (
    !!service &&
    service.masterIds.includes(data.masterId) &&
    !!slot?.available &&
    slot.masterId === data.masterId
  );
}
