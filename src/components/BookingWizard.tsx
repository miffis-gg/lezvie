import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, LoaderCircle } from 'lucide-react';
import type { BookingController } from '../hooks/useBooking';
import {
  allServices,
  dateLabel,
  dates,
  dayLabel,
  masters,
  money,
  nearestFor,
  slotLabel,
  slots,
} from '../data/content';
import { validSelection, validateContacts } from '../lib/booking';
import type { ContactErrors } from '../types/content';
import s from './BookingWizard.module.css';

const steps = ['Услуга', 'Мастер', 'Дата и время', 'Контакты'];
export function BookingWizard({ booking: b }: { booking: BookingController }) {
  const { data, step, status } = b;
  const service = allServices.find((v) => v.id === data.serviceId);
  const master = masters.find((v) => v.id === data.masterId);
  const slot = slots.find((v) => v.id === data.slotId);
  const [day, setDay] = useState(dates[0]);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [selectionError, setSelectionError] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  const success = useRef<HTMLHeadingElement>(null);
  const area = useRef<HTMLFormElement>(null);
  const previousStep = useRef(step);
  useEffect(() => {
    if (previousStep.current !== step) {
      heading.current?.focus({ preventScroll: true });
      heading.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }
    previousStep.current = step;
    setSelectionError('');
  }, [step]);
  useEffect(() => {
    if (status === 'success') {
      success.current?.focus({ preventScroll: true });
      success.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  }, [status]);
  useEffect(() => {
    if (slot) setDay(slot.date);
  }, [slot]);
  const patch = (field: 'name' | 'phone' | 'comment' | 'consent', value: string | boolean) => {
    b.setData((d) => ({ ...d, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };
  const selections = [
    service?.title,
    master?.name,
    slot ? `${dateLabel(slot.date, true)}, ${slot.time}` : undefined,
  ];
  function advance() {
    const missing =
      step === 0
        ? !service
        : step === 1
          ? !master || !service?.masterIds.includes(master.id)
          : !slot?.available || slot.masterId !== master?.id;
    if (missing) {
      setSelectionError(
        ['Выберите услугу.', 'Выберите подходящего мастера.', 'Выберите доступное время.'][step],
      );
      area.current?.querySelector<HTMLInputElement>('input[type=radio]:not(:disabled)')?.focus();
      return;
    }
    b.setStep(Math.min(step + 1, 3));
  }
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'submitting') return;
    if (!validSelection(data, allServices, slots)) {
      b.setStep(!service ? 0 : !master ? 1 : 2);
      setSelectionError('Проверьте услугу, мастера и время.');
      return;
    }
    const nextErrors = validateContacts(data);
    setErrors(nextErrors);
    const first = Object.keys(nextErrors)[0];
    if (first) {
      requestAnimationFrame(() => document.getElementById(`contact-${first}`)?.focus());
      return;
    }
    b.confirm();
  }
  const errorProps = (field: keyof ContactErrors) => ({
    'aria-invalid': !!errors[field],
    'aria-describedby': errors[field] ? `${field}-error` : undefined,
  });
  return (
    <section id="booking" className={s.section} aria-labelledby="booking-title">
      <div className="container">
        <div className={s.intro}>
          <h2 id="booking-title">Соберите запись за&nbsp;четыре шага</h2>
          <p>
            Демонстрационный сценарий: форма работает только в браузере и никуда не отправляет
            данные.
          </p>
        </div>
        {status === 'success' ? (
          <div className={s.success} role="status">
            <Check size={40} aria-hidden="true" />
            <h3 ref={success} tabIndex={-1}>
              Демонстрационная запись собрана
            </h3>
            <p>
              Данные не были отправлены или сохранены. В реальном проекте на этом этапе заявка
              передавалась бы в систему записи.
            </p>
            <div className={s.successDetail}>
              {service?.title} · {master?.name}
              <br />
              {slot && `${dateLabel(slot.date)}, ${slot.time}`} · {service && money(service.price)}
            </div>
            <button
              className="button"
              onClick={() => {
                b.reset();
                setErrors({});
                setDay(dates[0]);
                requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
              }}
            >
              Записаться ещё раз
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <>
            <ol className={s.stepper} aria-label="Шаги записи">
              {steps.map((label, i) => (
                <li key={label}>
                  <button
                    type="button"
                    aria-current={step === i ? 'step' : undefined}
                    disabled={
                      status === 'submitting' ||
                      (i > step &&
                        !(i === 1 && service) &&
                        !(i === 2 && master) &&
                        !(i === 3 && slot))
                    }
                    onClick={() => b.setStep(i)}
                  >
                    <span className={s.stepNumber}>
                      {i < step ? <Check size={17} aria-hidden="true" /> : i + 1}
                    </span>
                    <span>
                      {label}
                      <small>{selections[i] || (i === 3 ? 'Ваши данные' : 'Сделайте выбор')}</small>
                    </span>
                    <span className="srOnly">
                      {i < step ? 'Завершён' : i === step ? 'Текущий шаг' : ''}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
            <form
              ref={area}
              className={s.form}
              onSubmit={submit}
              noValidate
              aria-busy={status === 'submitting'}
            >
              <div className={s.workspace}>
                <h3 ref={heading} tabIndex={-1} className={s.stepTitle}>
                  {
                    [
                      'Какую услугу выбираете?',
                      'К кому запишемся?',
                      'Когда вам удобно?',
                      'Как к вам обращаться?',
                    ][step]
                  }
                </h3>
                {selectionError && (
                  <p className={s.error} role="alert">
                    {selectionError}
                  </p>
                )}
                {step === 0 && (
                  <fieldset>
                    <legend className="srOnly">Выберите услугу или пакет</legend>
                    <div className={s.serviceOptions}>
                      {allServices.map((v) => (
                        <label
                          key={v.id}
                          className={`${s.option} ${data.serviceId === v.id ? s.selected : ''}`}
                        >
                          <input
                            type="radio"
                            name="service"
                            value={v.id}
                            checked={data.serviceId === v.id}
                            onChange={() => {
                              b.selectService(v.id);
                              setSelectionError('');
                            }}
                          />
                          <span>
                            <b>{v.title}</b>
                            <small>
                              {v.isPackage ? 'Демонстрационное предложение · ' : ''}
                              {v.id === 'regular'
                                ? '60 мин — первый визит'
                                : `${v.durationMinutes} мин`}
                            </small>
                          </span>
                          <strong>{money(v.price)}</strong>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )}
                {step === 1 && (
                  <fieldset>
                    <legend className="srOnly">Выберите мастера</legend>
                    <div className={s.masterOptions}>
                      {masters
                        .filter((m) => service?.masterIds.includes(m.id))
                        .map((m) => (
                          <label
                            key={m.id}
                            className={`${s.option} ${data.masterId === m.id ? s.selected : ''}`}
                          >
                            <input
                              type="radio"
                              name="master"
                              checked={data.masterId === m.id}
                              value={m.id}
                              onChange={() => {
                                b.setData((d) => ({ ...d, masterId: m.id, slotId: '' }));
                                setSelectionError('');
                                setDay(dates[0]);
                              }}
                            />
                            <img src={m.image} width="72" height="88" loading="lazy" alt="" />
                            <span>
                              <b>{m.name}</b>
                              <small>{m.description}</small>
                              <small>{slotLabel(nearestFor(m.id, service))} · демовремя</small>
                              <small>Демонстрационный профиль</small>
                            </span>
                          </label>
                        ))}
                    </div>
                    <button
                      className={s.anyMaster}
                      type="button"
                      onClick={() => {
                        const first = nearestFor(undefined, service);
                        if (first) {
                          b.setData((d) => ({ ...d, masterId: first.masterId, slotId: first.id }));
                          setSelectionError('');
                        }
                      }}
                    >
                      Подобрать любого доступного мастера
                      <ArrowRight size={16} aria-hidden="true" />
                    </button>
                    <p className={s.hint}>
                      Выберем мастера с первым совместимым демонстрационным слотом. Его имя и время
                      появятся в итоге.
                    </p>
                  </fieldset>
                )}
                {step === 2 && (
                  <>
                    <p className={s.hint}>
                      Демонстрационные даты и время, часовой пояс устройства.
                    </p>
                    <fieldset>
                      <legend>Выберите день</legend>
                      <div className={s.days}>
                        {dates.map((d) => (
                          <label key={d} className={day === d ? s.selected : ''}>
                            <input
                              type="radio"
                              name="day"
                              value={d}
                              checked={day === d}
                              onChange={() => {
                                setDay(d);
                                b.setData((v) => ({ ...v, slotId: '' }));
                                setSelectionError('');
                              }}
                            />
                            <span>{dayLabel(d)}</span>
                            <b>{dateLabel(d, true)}</b>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <fieldset className={s.timeGroup}>
                      <legend>Свободное время</legend>
                      <div className={s.times}>
                        {slots
                          .filter((v) => v.masterId === data.masterId && v.date === day)
                          .map((v) => (
                            <label
                              key={v.id}
                              className={`${!v.available ? s.unavailable : ''} ${data.slotId === v.id ? s.selected : ''}`}
                            >
                              <input
                                type="radio"
                                name="time"
                                disabled={!v.available}
                                checked={data.slotId === v.id}
                                value={v.id}
                                onChange={() => {
                                  b.setData((d) => ({ ...d, slotId: v.id }));
                                  setSelectionError('');
                                }}
                              />
                              <span>{v.time}</span>
                              <small>
                                {!v.available
                                  ? 'Занято'
                                  : data.slotId === v.id
                                    ? 'Выбрано'
                                    : 'Свободно'}
                              </small>
                            </label>
                          ))}
                      </div>
                      {!slots.some(
                        (v) => v.masterId === data.masterId && v.date === day && v.available,
                      ) && (
                        <p className={s.empty}>
                          На этот день нет демонстрационных слотов. Выберите другой день или
                          вернитесь к выбору мастера.
                        </p>
                      )}
                    </fieldset>
                  </>
                )}
                {step === 3 && (
                  <fieldset disabled={status === 'submitting'} className={s.contacts}>
                    <legend className="srOnly">Контактные данные</legend>
                    <div className={s.fields}>
                      <label htmlFor="contact-name">
                        Имя<span>От 2 до 60 символов</span>
                        <input
                          id="contact-name"
                          autoComplete="off"
                          value={data.name}
                          onChange={(e) => patch('name', e.target.value)}
                          {...errorProps('name')}
                          required
                        />
                        {errors.name && (
                          <small id="name-error" className={s.error}>
                            Ошибка: {errors.name}
                          </small>
                        )}
                      </label>
                      <label htmlFor="contact-phone">
                        Телефон<span>От 10 до 15 цифр</span>
                        <input
                          id="contact-phone"
                          type="tel"
                          inputMode="tel"
                          autoComplete="off"
                          placeholder="+7 (___) ___-__-__"
                          value={data.phone}
                          onChange={(e) => patch('phone', e.target.value)}
                          {...errorProps('phone')}
                          required
                        />
                        {errors.phone && (
                          <small id="phone-error" className={s.error}>
                            Ошибка: {errors.phone}
                          </small>
                        )}
                      </label>
                    </div>
                    <label htmlFor="contact-comment">
                      Комментарий <span>Необязательно · {data.comment.length}/500</span>
                      <textarea
                        id="contact-comment"
                        rows={3}
                        value={data.comment}
                        onChange={(e) => patch('comment', e.target.value)}
                        {...errorProps('comment')}
                      />
                      {errors.comment && (
                        <small id="comment-error" className={s.error}>
                          Ошибка: {errors.comment}
                        </small>
                      )}
                    </label>
                    <label className={s.consent}>
                      <input
                        id="contact-consent"
                        type="checkbox"
                        checked={data.consent}
                        onChange={(e) => patch('consent', e.target.checked)}
                        {...errorProps('consent')}
                        required
                      />
                      <span>Я понимаю, что это демоформа и данные никуда не отправляются</span>
                    </label>
                    {errors.consent && (
                      <small id="consent-error" className={s.error}>
                        Ошибка: {errors.consent}
                      </small>
                    )}
                  </fieldset>
                )}
              </div>
              <aside className={s.summary} aria-label="Итог записи" aria-live="polite">
                <h3>Ваш выбор</h3>
                <dl>
                  <div>
                    <dt>Услуга</dt>
                    <dd>{service?.title || 'Не выбрана'}</dd>
                  </div>
                  <div>
                    <dt>Мастер</dt>
                    <dd>{master?.name || 'Не выбран'}</dd>
                  </div>
                  <div>
                    <dt>Дата и время</dt>
                    <dd>{slot ? `${dateLabel(slot.date, true)}, ${slot.time}` : 'Не выбраны'}</dd>
                  </div>
                  <div>
                    <dt>Длительность</dt>
                    <dd>
                      {service
                        ? `${service.durationMinutes} мин${service.id === 'regular' ? ' · первый визит' : ''}`
                        : '—'}
                    </dd>
                  </div>
                </dl>
                <div className={s.total}>
                  <span>{service?.id === 'regular' ? 'Стоимость трёх визитов' : 'Итого'}</span>
                  <strong>{service ? money(service.price) : '—'}</strong>
                </div>
                <p>Демонстрационные цены и слоты. Оплата не требуется.</p>
              </aside>
              <div className={s.controls}>
                {step > 0 && (
                  <button
                    className="button secondary"
                    type="button"
                    disabled={status === 'submitting'}
                    onClick={() => b.setStep(step - 1)}
                  >
                    <ArrowLeft size={17} aria-hidden="true" />
                    Назад
                  </button>
                )}
                {step < 3 ? (
                  <button className="button" type="button" onClick={advance}>
                    {['Выбрать мастера', 'Выбрать время', 'Указать контакты'][step]}
                    <ArrowRight size={18} aria-hidden="true" />
                  </button>
                ) : (
                  <button className="button" type="submit" disabled={status === 'submitting'}>
                    {status === 'submitting' ? (
                      <>
                        <LoaderCircle className={s.spinner} size={18} aria-hidden="true" />
                        Обработка…
                      </>
                    ) : (
                      <>
                        Показать подтверждение
                        <ArrowRight size={18} aria-hidden="true" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </>
        )}
        <p className={s.disclaimer}>
          Концептуальный проект. Форма не отправляет и не сохраняет персональные данные.
        </p>
      </div>
    </section>
  );
}
