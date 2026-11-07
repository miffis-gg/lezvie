import { useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Expand, X } from 'lucide-react';
import { gallery, masters, money, nearestFor, services, slotLabel } from '../data/content';
import type { ServiceId } from '../types/content';
import { trapDialogFocus } from '../lib/focus';
import s from './Catalog.module.css';

export function Services({ onChoose }: { onChoose: (id: ServiceId) => void }) {
  const [filter, setFilter] = useState('Все');
  const shown = services.filter((v) => filter === 'Все' || v.category === filter);
  return (
    <section
      id="services"
      className={`lightSection ${s.services}`}
      aria-labelledby="services-title"
    >
      <div className="container">
        <div className={s.priceLayout}>
          <div className={s.priceIntro}>
            <h2 id="services-title">Цены на&nbsp;услуги</h2>
            <p>
              Знаете, за&nbsp;чем пришли?
              <br />
              {' Сразу выбирайте своё.'}
            </p>
            <small>
              Демонстрационная стоимость фиксирована для интерфейса. В реальном проекте данные
              должны поступать от владельца бизнеса.
            </small>
          </div>
          <div className={s.priceContent}>
            <div className={s.filters} role="group" aria-label="Категории услуг">
              {['Все', 'Стрижки', 'Борода', 'Комплексы', 'Детям', 'Уход'].map((f) => (
                <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)}>
                  {f}
                </button>
              ))}
            </div>
            <div className={s.tableLabels} aria-hidden="true">
              <span>Услуга</span>
              <span>Время</span>
              <span>Цена</span>
              <span />
            </div>
            <div className={s.priceRows}>
              {shown.map((v) => (
                <article key={v.id} className={s.priceRow}>
                  <div className={s.serviceName}>
                    <h3>{v.title}</h3>
                    <p>{v.shortDescription}</p>
                  </div>
                  <span className={s.minutes}>{v.durationMinutes} мин</span>
                  <strong className={s.price}>{money(v.price)}</strong>
                  <button
                    className={s.choose}
                    aria-label={`Выбрать: ${v.title}`}
                    onClick={() => onChoose(v.id)}
                  >
                    <span>Выбрать</span>
                    <ArrowUpRight size={20} aria-hidden="true" />
                  </button>
                </article>
              ))}
            </div>
            {!shown.length && <p>В этой категории пока нет услуг. Выберите другую категорию.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Masters({ onChoose }: { onChoose: (id: string) => void }) {
  return (
    <section id="masters" className={s.masters} aria-labelledby="masters-title">
      <div className="container">
        <div className={s.sectionHeading}>
          <h2 id="masters-title">Выберите своего мастера</h2>
          <p>
            Разные специализации.
            <br />
            Один спокойный подход к&nbsp;делу.
          </p>
        </div>
        <div className={s.masterGrid}>
          {masters.map((m) => (
            <article className={s.master} key={m.id}>
              <div className={s.portrait}>
                <img
                  src={m.image}
                  width="600"
                  height="800"
                  loading="lazy"
                  alt={`${m.name}, демонстрационный барбер, за работой в мастерской`}
                />
                <span>Демонстрационный профиль</span>
              </div>
              <div className={s.masterTop}>
                <h3>{m.name}</h3>
                <span>{m.role}</span>
              </div>
              <p className={s.specialty}>{m.description}</p>
              <p className={s.experience}>Демонстрационный стаж: {m.experience}</p>
              <p className={s.availability}>
                <span aria-hidden="true" className={s.dot} />
                {slotLabel(nearestFor(m.id))}
                <span className="srOnly">, демонстрационное время</span>
              </p>
              <button className="button secondary" onClick={() => onChoose(m.id)}>
                Выбрать мастера
                <ArrowUpRight size={18} aria-hidden="true" />
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Works() {
  const [filter, setFilter] = useState('Все');
  const [active, setActive] = useState(gallery[0]);
  const dialog = useRef<HTMLDialogElement>(null);
  const source = useRef<HTMLButtonElement | null>(null);
  const shown = gallery.filter((v) => filter === 'Все' || v.category === filter);
  return (
    <section id="works" className={s.works} aria-labelledby="works-title">
      <div className="container">
        <div className={s.sectionHeading}>
          <h2 id="works-title">Работы и&nbsp;формы</h2>
          <p>Учебные работы для концептуального проекта. Это не портфолио реального барбершопа.</p>
        </div>
        <div className={`${s.filters} ${s.darkFilters}`} role="group" aria-label="Фильтры работ">
          {['Все', 'Короткие стрижки', 'Средняя длина', 'Борода', 'Комплексы'].map((f) => (
            <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
        <div className={`${s.gallery} ${filter !== 'Все' ? s.filtered : ''}`}>
          {shown.map((v, i) => (
            <figure key={v.id} className={filter === 'Все' && i === 0 ? s.featured : ''}>
              <button
                aria-label={`Увеличить: ${v.title}`}
                onClick={(e) => {
                  setActive(v);
                  source.current = e.currentTarget;
                  dialog.current?.showModal();
                }}
              >
                <img src={v.image} width="750" height="1000" loading="lazy" alt={v.alt} />
                <span className={s.expand}>
                  <Expand size={18} aria-hidden="true" />
                </span>
              </button>
              <figcaption>
                <span>{v.title}</span>
                <small>{masters.find((m) => m.id === v.masterId)?.name}</small>
              </figcaption>
            </figure>
          ))}
        </div>
        <dialog
          ref={dialog}
          className={s.lightbox}
          aria-labelledby="work-caption"
          onKeyDown={trapDialogFocus}
          onClick={(e) => {
            if (e.target === e.currentTarget) dialog.current?.close();
          }}
          onClose={() => source.current?.focus()}
        >
          <div className={s.lightboxInner}>
            <button
              className={`iconButton ${s.close}`}
              aria-label="Закрыть фотографию"
              onClick={() => dialog.current?.close()}
              autoFocus
            >
              <X aria-hidden="true" />
            </button>
            <img src={active.image} alt={active.alt} />
            <div className={s.lightboxCaption}>
              <div>
                <h3 id="work-caption">{active.title}</h3>
                <p>Учебное изображение · {masters.find((m) => m.id === active.masterId)?.name}</p>
              </div>
              <button
                className="iconButton"
                aria-label="Следующая работа"
                onClick={() =>
                  setActive(
                    gallery[(gallery.findIndex((v) => v.id === active.id) + 1) % gallery.length],
                  )
                }
              >
                <ArrowRight aria-hidden="true" />
              </button>
            </div>
          </div>
        </dialog>
      </div>
    </section>
  );
}
