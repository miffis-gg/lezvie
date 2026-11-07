import { useEffect, useRef, useState } from 'react';
import { allServices } from '../data/content';
import { changeService, emptyBooking } from '../lib/booking';
import type { BookingData, ServiceId } from '../types/content';

export function useBooking() {
  const [data, setData] = useState<BookingData>(emptyBooking);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<'editing' | 'submitting' | 'success'>('editing');
  const busy = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);
  function selectService(id: ServiceId) {
    if (busy.current) return;
    const service = allServices.find((s) => s.id === id);
    if (!service) return;
    setData((d) => changeService(d, service));
    setStatus('editing');
  }
  function reset() {
    clearTimeout(timer.current);
    busy.current = false;
    setData(emptyBooking());
    setStep(0);
    setStatus('editing');
  }
  function confirm() {
    if (busy.current) return;
    busy.current = true;
    setStatus('submitting');
    timer.current = setTimeout(() => {
      setData((d) => ({ ...d, name: '', phone: '', comment: '', consent: false }));
      setStatus('success');
      busy.current = false;
    }, 750);
  }
  return { data, setData, step, setStep, status, setStatus, selectService, reset, confirm };
}
export type BookingController = ReturnType<typeof useBooking>;
