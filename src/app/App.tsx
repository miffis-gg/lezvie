import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { Masters, Services, Works } from '../components/Catalog';
import { FAQ, FirstVisit, Packages, ServiceRules } from '../components/Editorial';
import { BookingWizard } from '../components/BookingWizard';
import { Contacts, Footer } from '../components/Contacts';
import { useBooking } from '../hooks/useBooking';
import { allServices, masters, money, services } from '../data/content';
import type { ServiceId } from '../types/content';
import { trapDialogFocus } from '../lib/focus';
import s from './App.module.css';

export function App() {
  const booking = useBooking();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sticky, setSticky] = useState(false);
  const [pendingMaster, setPendingMaster] = useState('');
  const mismatch = useRef<HTMLDialogElement>(null);
  const service = allServices.find((v) => v.id === booking.data.serviceId);
  function goBooking() {
    requestAnimationFrame(() => {
      const target = document.getElementById('booking');
      target?.scrollIntoView({
        behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'instant' : 'smooth',
      });
      target?.querySelector<HTMLHeadingElement>('h3[tabindex]')?.focus({ preventScroll: true });
    });
  }
  function chooseService(id: ServiceId) {
    if (booking.status === 'submitting') return;
    booking.selectService(id);
    booking.setStep(1);
    goBooking();
  }
  function chooseMaster(id: string) {
    if (booking.status === 'submitting') return;
    if (service && !service.masterIds.includes(id)) {
      setPendingMaster(id);
      mismatch.current?.showModal();
      return;
    }
    if (!service) booking.selectService('haircut');
    booking.setData((d) => ({ ...d, masterId: id, slotId: '' }));
    booking.setStatus('editing');
    booking.setStep(2);
    goBooking();
  }
  useEffect(() => {
    const hero = document.getElementById('hero-region');
    const form = document.getElementById('booking');
    const footer = document.getElementById('footer');
    if (!hero || !form || !footer) return;
    const update = () => {
      const h = hero.getBoundingClientRect(),
        b = form.getBoundingClientRect(),
        f = footer.getBoundingClientRect();
      setSticky(h.bottom <= 76 && !(b.top < innerHeight && b.bottom > 0) && f.top >= innerHeight);
    };
    const observer = new IntersectionObserver(update, {
      threshold: 0,
      rootMargin: '-76px 0px 0px 0px',
    });
    [hero, form, footer].forEach((v) => observer.observe(v));
    update();
    return () => observer.disconnect();
  }, []);
  return (
    <>
      <Header onMenuChange={setMenuOpen} />
      <main id="main">
        <div id="hero-region">
          <Hero
            service={service || services[0]}
            onStart={() => chooseService(service?.id || 'haircut')}
          />
        </div>
        <Services onChoose={chooseService} />
        <Masters onChoose={chooseMaster} />
        <Works />
        <FirstVisit />
        <Packages onChoose={chooseService} />
        <ServiceRules />
        <FAQ />
        <BookingWizard booking={booking} />
        <Contacts />
      </main>
      <Footer />
      {sticky && !menuOpen && (
        <div className={s.mobileBar}>
          <div>
            <span>{service?.title || 'Выберите услугу'}</span>
            {service && <strong>{money(service.price)}</strong>}
          </div>
          <a className="button" href="#booking">
            Записаться
            <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </div>
      )}
      <dialog
        ref={mismatch}
        className={s.mismatch}
        aria-labelledby="mismatch-title"
        onKeyDown={trapDialogFocus}
      >
        <div className={s.mismatchTop}>
          <h2 id="mismatch-title">Выберите услугу мастера</h2>
          <button
            className="iconButton"
            onClick={() => mismatch.current?.close()}
            aria-label="Закрыть выбор услуги"
            autoFocus
          >
            <X aria-hidden="true" />
          </button>
        </div>
        <p>
          {masters.find((m) => m.id === pendingMaster)?.name} не выполняет услугу «{service?.title}
          ». Текущий выбор сохранён. Можно выбрать совместимую услугу:
        </p>
        <div className={s.compatible}>
          {allServices
            .filter((v) => v.masterIds.includes(pendingMaster))
            .map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  booking.selectService(v.id);
                  booking.setData((d) => ({ ...d, masterId: pendingMaster, slotId: '' }));
                  booking.setStep(2);
                  mismatch.current?.close();
                  goBooking();
                }}
              >
                {v.title}
                <strong>{money(v.price)}</strong>
              </button>
            ))}
        </div>
      </dialog>
    </>
  );
}
