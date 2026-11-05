"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./top-bar.module.css";
import shared from "../shared.module.css";

/*
 * Росчерк ссылки шапки — геометрия заголовочных сквигглов (рецепт №1),
 * но рисуется по ховеру/фокусу и держится на текущем разделе
 * (data-current ставит scroll-spy ниже). Трек — переиспользуем .sqTrack.
 */
function NavSquiggle() {
  const d = "M0 4 Q7.5 0.6 15 4 T30 4 T45 4 T60 4 T75 4 T90 4 T105 4 T120 4";
  return (
    <svg
      className={styles.navSq}
      viewBox="0 0 120 8"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path className={shared.sqTrack} pathLength={100} d={d} />
      <path className={styles.navSqLine} pathLength={100} d={d} />
    </svg>
  );
}

/*
 * Шапка-остров: логотипа нет — имя страницы носит герой. На десктопе
 * пункты меню и CTA живут в плавающей плашке-линзе liquid glass по
 * центру (blur+saturate, спекулярный рант, диагональный блик). На
 * мобиле меню сворачивается в бургер: плашка = только бургер — CTA
 * и разделитель десктопные, CSS их прячет. Ссылки — в маленькой
 * стеклянной карте под линзой (тот же nav-элемент,
 * CSS переключает форму). data-open на плашке — JS только флипает
 * атрибут, движением владеет CSS (подход whimsy §5.3). Scroll-spy:
 * секция в средней полосе кадра подсвечивает свою ссылку —
 * data-current, росчерк под ней остаётся нарисованным.
 */
export default function TopBar() {
  const navRef = useRef<HTMLElement | null>(null);
  const topRef = useRef<HTMLElement | null>(null);
  const pillRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const links = Array.from(
      nav.querySelectorAll<HTMLAnchorElement>("a[href^='#']"),
    );
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("main > section[id]"),
    );
    if (!links.length || !sections.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const id = `#${(e.target as HTMLElement).id}`;
          links.forEach((l) =>
            l.getAttribute("href") === id
              ? l.setAttribute("data-current", "")
              : l.removeAttribute("data-current"),
          );
        }
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  /*
   * Состояние стекла: над героем плашка чуть прозрачнее, после первых
   * пикселей скролла — плотнее, компактнее, тень глубже. JS только
   * переключает data-scrolled, внешним видом владеет CSS
   * (подход whimsy §5.3); тик в rAF, слушатель пассивный.
   */
  useEffect(() => {
    const el = topRef.current;
    if (!el) return;
    let raf = 0;
    const sync = () => {
      el.toggleAttribute("data-scrolled", window.scrollY > 10);
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        sync();
      });
    };
    sync();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  /*
   * Меню мобилки закрывается: тапом мимо плашки (карта меню — её дитя,
   * тапы внутри не считаются «мимо»), Escape и переходом по ссылке.
   * Слушатели живут только пока меню открыто.
   */
  useEffect(() => {
    if (!open) return;
    const pill = pillRef.current;
    const onPointerDown = (e: PointerEvent) => {
      if (pill && !pill.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <header className={styles.top} ref={topRef}>
      <div
        className={styles.glassPill}
        ref={pillRef}
        data-open={open || undefined}
      >
        {/*
         * Бургер — только мобилка (на десктопе display: none). Полоски
         * схлопываются в крест пружиной, состояние — data-open плашки.
         */}
        <button
          type="button"
          className={styles.burger}
          aria-label="Разделы страницы"
          aria-expanded={open}
          aria-controls="topMenu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className={styles.burgerIcon} aria-hidden="true" />
        </button>
        {/*
         * Ссылки с волнистым росчерком: на десктопе — ряд в плашке,
         * на мобиле — карта под ней. Клик по ссылке закрывает карту.
         */}
        <nav
          className={styles.topNav}
          id="topMenu"
          aria-label="Разделы страницы"
          ref={navRef}
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a")) setOpen(false);
          }}
        >
          <a href="#how">Как играть<NavSquiggle /></a>
          <a href="#case">Сценарий<NavSquiggle /></a>
          <a href="#chars">Сыщики<NavSquiggle /></a>
          <a href="#faq">Вопросы<NavSquiggle /></a>
        </nav>
        <span className={styles.pillDivider} aria-hidden="true" />
        <a className={styles.topCta} href="#play">Играть</a>
      </div>
    </header>
  );
}
