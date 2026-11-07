import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Clock3, Menu, X } from 'lucide-react';
import { navigation } from '../data/content';
import { trapDialogFocus } from '../lib/focus';
import s from './Header.module.css';

export function Header({ onMenuChange }: { onMenuChange: (open: boolean) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    onMenuChange(open);
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open, onMenuChange]);
  useEffect(() => {
    const m = matchMedia('(min-width: 1100px)');
    const listener = () => {
      if (m.matches) dialog.current?.close();
    };
    m.addEventListener('change', listener);
    return () => m.removeEventListener('change', listener);
  }, []);
  const close = () => {
    dialog.current?.close();
  };
  return (
    <>
      <a className="skipLink" href="#main">
        К содержимому
      </a>
      <div className={s.notice}>
        Концептуальный проект для портфолио. Барбершоп, мастера, цены и свободное время вымышлены.
      </div>
      <header className={s.header}>
        <div className={`container ${s.inner}`}>
          <a className={s.logo} href="#top" aria-label="Лезвие — наверх">
            ЛЕЗВИЕ<span aria-hidden="true">/</span>
          </a>
          <nav className={s.desktop} aria-label="Основная навигация">
            {navigation.map((n) => (
              <a key={n.href} href={n.href}>
                {n.label}
              </a>
            ))}
          </nav>
          <span className={s.hours}>
            <Clock3 size={18} aria-hidden="true" />
            Ежедневно
            <br />
            10:00–22:00
          </span>
          <a className={`button ${s.cta}`} href="#booking">
            Записаться
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
          <button
            className={s.menuButton}
            ref={trigger}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => {
              dialog.current?.showModal();
              setOpen(true);
            }}
          >
            <Menu aria-hidden="true" />
            <span className="srOnly">Открыть меню</span>
          </button>
        </div>
      </header>
      <dialog
        id="mobile-menu"
        ref={dialog}
        className={s.mobileMenu}
        aria-labelledby="menu-title"
        onKeyDown={trapDialogFocus}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        onClose={() => {
          setOpen(false);
          trigger.current?.focus();
        }}
      >
        <div className={s.menuContent}>
          <div className={s.menuTop}>
            <span id="menu-title" className={s.logo}>
              ЛЕЗВИЕ
            </span>
            <button className="iconButton" onClick={close} aria-label="Закрыть меню">
              <X aria-hidden="true" />
            </button>
          </div>
          <nav aria-label="Мобильная навигация">
            {navigation.map((n) => (
              <a key={n.href} href={n.href} onClick={close}>
                {n.label}
                <ArrowUpRight size={20} aria-hidden="true" />
              </a>
            ))}
          </nav>
          <p>Ежедневно, 10:00–22:00</p>
          <a className="button" href="#booking" onClick={close}>
            Записаться
          </a>
          <small>Все данные демонстрационные.</small>
        </div>
      </dialog>
    </>
  );
}
