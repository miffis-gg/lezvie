import { useState } from 'react';
import { ArrowUp, ArrowUpRight, MapPin } from 'lucide-react';
import { navigation } from '../data/content';
import s from './Contacts.module.css';

export function Contacts() {
  const [message, setMessage] = useState(false);
  return (
    <section id="contacts" className={`lightSection ${s.section}`} aria-labelledby="contacts-title">
      <div className={`container ${s.grid}`}>
        <div>
          <h2 id="contacts-title">Встретимся в&nbsp;городе</h2>
          <p className={s.address}>
            Демонстрационный адрес:
            <br />
            Центральный район,
            <br />
            улица Примерная, 18
          </p>
          <dl className={s.info}>
            <div>
              <dt>Время работы</dt>
              <dd>Ежедневно, 10:00–22:00</dd>
            </div>
            <div>
              <dt>Демонстрационные контакты</dt>
              <dd>
                +7 (000) 000-00-00
                <br />
                hello@example.invalid
              </dd>
            </div>
          </dl>
          <button className="button secondary" onClick={() => setMessage(true)}>
            Построить маршрут
            <ArrowUpRight size={18} aria-hidden="true" />
          </button>
          {message && (
            <p className={s.message} role="status">
              Недоступно в концептуальном проекте. Это вымышленный адрес.
            </p>
          )}
        </div>
        <div
          className={s.map}
          role="img"
          aria-label="Демонстрационная схема-заглушка без реальной географии"
        >
          <svg
            className={s.streets}
            viewBox="0 0 600 500"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <path
              d="M-10 90H610M-10 240H610M-10 420H610M120-10V510M350-10V510M500-10V510"
              stroke="#c5c5bc"
              strokeWidth="24"
              fill="none"
            />
            <path
              d="M-10 90H610M-10 240H610M-10 420H610M120-10V510M350-10V510M500-10V510"
              stroke="#e9e8df"
              strokeWidth="20"
              fill="none"
            />
          </svg>
          <div className={s.mapLabel}>
            <MapPin size={34} strokeWidth={1.5} aria-hidden="true" />
            <strong>ЛЕЗВИЕ</strong>
            <span>Демонстрационная схема</span>
            <small>Реального адреса здесь нет</small>
          </div>
          <span className={s.mapNote}>Концептуальный проект · карта-заглушка</span>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer id="footer" className={s.footer}>
      <div className="container">
        <div className={s.footerTop}>
          <a href="#top" className={s.logo}>
            ЛЕЗВИЕ<span aria-hidden="true">/</span>
          </a>
          <nav aria-label="Навигация в подвале">
            {navigation.map((v) => (
              <a href={v.href} key={v.href}>
                {v.label}
              </a>
            ))}
          </nav>
          <a href="#top" className={s.toTop}>
            Наверх
            <ArrowUp size={18} aria-hidden="true" />
          </a>
        </div>
        <div className={s.footerBottom}>
          <p>
            © {new Date().getFullYear()} «Лезвие»
            <br />
            Учебный проект для портфолио frontend-разработчика
          </p>
          <div>
            <p>Концептуальный проект. Форма не отправляет и не сохраняет персональные данные.</p>
            <p>
              Барбершоп, мастера, работы, цены, адрес и свободное время являются демонстрационными.
              Форма не отправляет и не сохраняет персональные данные.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
