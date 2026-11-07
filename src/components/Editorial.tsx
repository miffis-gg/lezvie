import { useState } from 'react';
import { ArrowUpRight, Check, Minus, Plus } from 'lucide-react';
import { asset, faq, money, packages, rules, visitSteps } from '../data/content';
import type { ServiceId } from '../types/content';
import s from './Editorial.module.css';

export function FirstVisit() {
  return (
    <section id="first-visit" className={`lightSection ${s.visit}`} aria-labelledby="visit-title">
      <div className="container">
        <div className={s.visitHead}>
          <h2 id="visit-title">Первый визит по&nbsp;шагам</h2>
          <p>
            Не нужно знать названия техник.
            <br />
            Начнём с того, что удобно вам.
          </p>
        </div>
        <ol className={s.steps}>
          {visitSteps.map((v, i) => (
            <li key={v.title}>
              <span className={s.number}>{String(i + 1).padStart(2, '0')}</span>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </li>
          ))}
        </ol>
        <p className={s.fine}>
          Описание отражает демонстрационный сценарий сервиса и не является обещанием реального
          бизнеса.
        </p>
      </div>
    </section>
  );
}

export function Packages({ onChoose }: { onChoose: (id: ServiceId) => void }) {
  return (
    <section
      id="packages"
      className={`lightSection ${s.packages}`}
      aria-labelledby="packages-title"
    >
      <div className="container">
        <div className={s.packageHead}>
          <h2 id="packages-title">Больше времени на&nbsp;себя</h2>
          <p>
            Готовые сочетания услуг.
            <br />
            Без скрытых дополнений.
          </p>
        </div>
        <div className={s.offers}>
          {packages.map((p) => (
            <article className={s.offer} key={p.id}>
              <span className={s.offerTag}>Демонстрационное предложение</span>
              <h3>{p.title}</h3>
              <p>{p.shortDescription}</p>
              <div className={s.offerBottom}>
                <span>
                  {p.id === 'regular' ? '60 мин · первый визит' : `${p.durationMinutes} мин`}
                </span>
                <strong>{money(p.price)}</strong>
              </div>
              <button className="button secondary" onClick={() => onChoose(p.id)}>
                Выбрать пакет
                <ArrowUpRight size={18} aria-hidden="true" />
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ServiceRules() {
  return (
    <section id="service" className={s.rules} aria-labelledby="rules-title">
      <div className="container">
        <div className={s.rulesTop}>
          <h2 id="rules-title">Спокойно, точно, по&nbsp;времени</h2>
          <div>
            <p className={s.rulesLead}>Хороший визит начинается с&nbsp;разговора.</p>
            <p>
              В нашей концепции важны понятные договорённости и внимание к деталям. Без спешки и
              лишнего шума.
            </p>
          </div>
        </div>
        <img
          className={s.interior}
          src={asset('interior')}
          width="1536"
          height="1024"
          loading="lazy"
          alt="Свет от большого окна в городской мастерской с чёрными барберскими креслами и деревянной столешницей"
        />
        <div className={s.rulesBottom}>
          <p>
            Концепция сервиса.
            <br />
            Не правила реального бизнеса.
          </p>
          <ul>
            {rules.map((v) => (
              <li key={v}>
                <Check size={18} strokeWidth={1.5} aria-hidden="true" />
                {v}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function FAQ() {
  const [open, setOpen] = useState<string[]>([]);
  return (
    <section id="faq" className={`lightSection ${s.faq}`} aria-labelledby="faq-title">
      <div className={`container ${s.faqGrid}`}>
        <div>
          <h2 id="faq-title">До визита</h2>
          <p className={s.faqHint}>
            Коротко о том,
            <br />
            что обычно спрашивают.
          </p>
        </div>
        <div>
          {faq.map((v) => {
            const expanded = open.includes(v.id);
            return (
              <div className={s.faqItem} key={v.id}>
                <h3>
                  <button
                    id={`question-${v.id}`}
                    aria-expanded={expanded}
                    aria-controls={`answer-${v.id}`}
                    onClick={() =>
                      setOpen((o) => (expanded ? o.filter((id) => id !== v.id) : [...o, v.id]))
                    }
                  >
                    {v.question}
                    {expanded ? (
                      <Minus size={20} aria-hidden="true" />
                    ) : (
                      <Plus size={20} aria-hidden="true" />
                    )}
                  </button>
                </h3>
                <div
                  id={`answer-${v.id}`}
                  role="region"
                  aria-labelledby={`question-${v.id}`}
                  hidden={!expanded}
                >
                  <p>{v.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
