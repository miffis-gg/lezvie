import { ArrowDown, ArrowUpRight, CalendarDays, Clock3 } from 'lucide-react';
import { asset, money, nearestFor, slotLabel } from '../data/content';
import type { Service } from '../types/content';
import s from './Hero.module.css';

export function Hero({ service, onStart }: { service: Service; onStart: () => void }) {
  return (
    <>
      <section id="top" className={s.hero} aria-labelledby="hero-title">
        <div className={s.heroInner}>
          <div className={s.copy}>
            <p className={s.kicker}>Городской барбершоп · концептуальный проект</p>
            <h1 id="hero-title">Стрижка без лишних слов</h1>
            <p className={s.lead}>Понятная цена. Подходящий мастер. Удобное время.</p>
            <div className={s.actions}>
              <a className="button" href="#booking">
                Записаться
                <ArrowUpRight size={21} aria-hidden="true" />
              </a>
              <a className={s.priceLink} href="#services">
                Смотреть цены
                <ArrowDown size={17} aria-hidden="true" />
              </a>
            </div>
            <p className={s.caption}>
              Стрижки, борода и уход — по предварительной демонстрационной записи.
            </p>
          </div>
          <div className={s.photo}>
            <img
              src={asset('hero')}
              srcSet={`${asset('hero-480')} 480w, ${asset('hero')} 1440w`}
              sizes="(max-width: 767px) 100vw, 59vw"
              width="1536"
              height="1024"
              alt="Барбер аккуратно подравнивает волосы клиента машинкой у виска"
              loading="eager"
              {...{ fetchpriority: 'high' }}
            />
            <span className={s.photoLabel}>Форма начинается с деталей</span>
          </div>
        </div>
      </section>
      <section className={s.nearest} aria-label="Ближайшая демонстрационная запись">
        <div className={`container ${s.bookingStrip}`}>
          <div className={s.next}>
            <CalendarDays size={28} strokeWidth={1.5} aria-hidden="true" />
            <div>
              <span className={s.label}>Ближайшая запись</span>
              <strong>{slotLabel(nearestFor(undefined, service))}</strong>
            </div>
          </div>
          <div className={s.service}>
            <span className={s.label}>Услуга</span>
            <b>{service.title}</b>
          </div>
          <span className={s.duration}>
            <Clock3 size={20} aria-hidden="true" />
            {service.durationMinutes} мин
          </span>
          <strong className={s.price}>{money(service.price)}</strong>
          <button className="button" onClick={onStart}>
            Выбрать мастера
            <ArrowUpRight size={19} aria-hidden="true" />
          </button>
          <p className={s.demo}>Время и стоимость указаны для демонстрации интерфейса.</p>
        </div>
      </section>
    </>
  );
}
