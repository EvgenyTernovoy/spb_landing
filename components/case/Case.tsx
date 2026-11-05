"use client";

import type { CSSProperties } from "react";
import { Squiggle } from "../decor";
import shared from "../shared.module.css";
import { useReveal } from "../use-reveal";
import styles from "./case.module.css";

/*
 * Данные карты — настоящие: 6 узлов стоят на mapPosition локаций
 * сценария «Васильский» (misterious-spb/…/vasilievsky/locations.json),
 * ещё шесть — дворы и парадные того же квартала. Итого 12 точек.
 */

const MAP_DOTS: { x: number; y: number; real?: boolean }[] = [
  { x: 38.1, y: 70.8, real: true }, // L01 Квартира Громова
  { x: 62.6, y: 59.6, real: true }, // L02 Кухня коммуналки
  { x: 51.1, y: 23.0, real: true }, // L03 Магазин «Артефакты»
  { x: 30.0, y: 25.0, real: true }, // L04 СПбГУ, кабинет
  { x: 68.5, y: 41.3, real: true }, // L05 Лавка «Старый маг»
  { x: 33.5, y: 55.4, real: true }, // L06 Минмаг
  { x: 12, y: 14 },
  { x: 84, y: 20 },
  { x: 89, y: 70 },
  { x: 59, y: 85 },
  { x: 24, y: 88 },
  { x: 8, y: 48 },
];

/* Улицы-каналы квартала — спокойные кривые панорамы (viewBox 100×34) */
const MAP_STREETS = [
  "M0 6 C 30 4, 70 9, 100 5.5",
  "M0 17.5 C 35 15, 65 20, 100 17",
  "M0 28 C 40 26, 60 30, 100 27.5",
  "M14 0 C 12 12, 18 24, 14 34",
  "M50 0 C 47 10, 55 25, 50 34",
  "M78 0 C 82 14, 74 22, 80 34",
  "M4 2 C 35 14, 65 20, 96 32",
];

/* Маршрут дознания — через семь точек (y реальных × 0.34) */
const MAP_ROUTE =
  "M8 16.3 C 16 12, 24 9.4, 30 8.5 C 37 7.7, 45 8.2, 51.1 7.8 " +
  "C 58 7.7, 64 10.9, 68.5 14 C 73 17, 68 18.7, 62.6 20 " +
  "C 56 21.6, 46 21.6, 38.1 23.7 C 33 25.5, 28 27.7, 24 29.9";

/* Штрих-глифы тайлов — язык иконок «Как играть», обводку рисует скролл */
function Glyph({ kind }: { kind: "clues" | "crew" | "time" | "party" }) {
  return (
    <span className={styles.glyph} aria-hidden="true">
      {kind === "clues" && (
        /* лупа сыщика */
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="10.5" cy="10.5" r="7" pathLength={100} />
          <path d="M15.7 15.7l4.8 4.8" pathLength={100} />
        </svg>
      )}
      {kind === "crew" && (
        /* речевой пузырь допроса */
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h9A2.5 2.5 0 0 1 18 6.5v5a2.5 2.5 0 0 1-2.5 2.5H10l-4 3.5v-3.5A2.5 2.5 0 0 1 4 11.5z" pathLength={100} />
          <path d="M14 19.5h3.5a2.5 2.5 0 0 0 2.5-2.5v-4" pathLength={100} />
        </svg>
      )}
      {kind === "time" && (
        /* секундомер */
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="13.6" r="7.4" pathLength={100} />
          <path d="M9.6 2.6h4.8" pathLength={100} />
          <path d="M12 4.2v1.8" pathLength={100} />
          <path d="M12 13.6l3.2-3" pathLength={100} />
        </svg>
      )}
      {kind === "party" && (
        /* два сыщика */
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="7.5" r="3" pathLength={100} />
          <path d="M3.5 19.5c0-3.2 2.4-5.3 5.5-5.3 1.5 0 2.8.5 3.8 1.4" pathLength={100} />
          <circle cx="16.8" cy="9.5" r="2.4" pathLength={100} />
          <path d="M15.5 14.6c.4-.1.8-.1 1.3-.1 2.4 0 4.2 1.7 4.2 5" pathLength={100} />
        </svg>
      )}
    </span>
  );
}

/*
 * 03. СЦЕНАРИЙ — «Что внутри». Одна широкая карта-панорама ночного
 * квартала — единственный образ секции — и четыре тихих тайла цифр.
 * Ни ярлыков, ни ростера: меньше чтения, больше воздуха. Интерактив
 * страницы остался демо-панораме ниже.
 */
export default function Case() {
  const caseRef = useReveal<HTMLElement>();

  return (
    <section className={shared.section} id="case" ref={caseRef}>
      <div className={shared.wrap}>
        <header className={`${shared.secHead} ${shared.rv}`}>
          <h2 className={shared.h2}>
            Что внутри{" "}
            <span className={shared.squiggle}>
              сценария<Squiggle />
            </span>
          </h2>
        </header>

        <div className={styles.board}>
          {/* ОСМОТР — ночная карта квартала, панорамой на всю ширину.
              Паттерн — чертёжная сетка: миллиметровка плана квартала */}
          <article
            className={`${styles.card} ${styles.cardMap} ${shared.patternGrid} ${shared.rv}`}
            style={{ "--tint": "var(--periwinkle)", "--rv": "0ms", "--pop": "160ms" } as CSSProperties}
          >
            <div className={styles.mapText}>
              <span className={styles.label}>осмотр</span>
              <p className={styles.numRow}>
                <b className={styles.num}>12</b>
                <span className={styles.unit}>локаций</span>
              </p>
              <p className={styles.sub}>для осмотра</p>
              <span className={styles.mapNote} aria-hidden="true">
                дело №1 — Васильевский
              </span>
            </div>
            <svg
              className={styles.mapSvg}
              viewBox="0 0 100 34"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {MAP_STREETS.map((d) => (
                <path className={styles.mapStreet} d={d} key={d} />
              ))}
              <path className={styles.mapRouteTrack} d={MAP_ROUTE} />
              <path className={styles.mapRoute} pathLength={100} d={MAP_ROUTE} />
              {MAP_DOTS.map((d, i) => (
                <g key={`${d.x}-${d.y}`}>
                  {d.real && (
                    <circle
                      className={styles.mapHalo}
                      cx={d.x}
                      cy={d.y * 0.34}
                      r={2.6}
                      style={{ "--d": `${(i % 5) * 1.1}s` } as CSSProperties}
                    />
                  )}
                  <circle
                    className={styles.mapDot}
                    cx={d.x}
                    cy={d.y * 0.34}
                    r={d.real ? 1.4 : 1.05}
                    style={{ "--i": i } as CSSProperties}
                  />
                </g>
              ))}
            </svg>
          </article>

          {/* ВЕЩДОКИ — паттерн-горошек: рассыпанные по столу улики */}
          <article
            className={`${styles.card} ${styles.cardClues} ${shared.patternDots} ${shared.rv}`}
            style={{ "--tint": "var(--pink)", "--rv": "90ms", "--pop": "260ms" } as CSSProperties}
          >
            <div className={styles.cardHead}>
              <span className={styles.label}>вещдоки</span>
              <Glyph kind="clues" />
            </div>
            <p className={styles.numRow}>
              <b className={styles.num}>20+</b>
              <span className={styles.unit}>улик</span>
            </p>
            <p className={styles.sub}>
              одни ведут к правде, другие — ложный след
            </p>
          </article>

          {/* ДОПРОС — штриховка: свет настольной лампы сквозь жалюзи */}
          <article
            className={`${styles.card} ${styles.cardCrew} ${shared.patternHatch} ${shared.rv}`}
            style={{ "--tint": "var(--steel)", "--rv": "180ms", "--pop": "360ms" } as CSSProperties}
          >
            <div className={styles.cardHead}>
              <span className={styles.label}>допрос</span>
              <Glyph kind="crew" />
            </div>
            <p className={styles.numRow}>
              <b className={styles.num}>8</b>
              <span className={styles.unit}>персонажей</span>
            </p>
            <p className={styles.sub}>у каждого свои секреты и ложь</p>
          </article>

          {/* ХРОНОМЕТРАЖ — лучи: веер прожектора над ночным кварталом */}
          <article
            className={`${styles.card} ${styles.cardTime} ${shared.patternRays} ${shared.rv}`}
            style={{ "--tint": "var(--lavender)", "--rv": "270ms", "--pop": "460ms" } as CSSProperties}
          >
            <div className={styles.cardHead}>
              <span className={styles.label}>хронометраж</span>
              <Glyph kind="time" />
            </div>
            <p className={styles.numRow}>
              <b className={styles.num}>60–90</b>
              <span className={styles.unit}>минут игры</span>
            </p>
            <p className={styles.sub}>время расследования ограничено</p>
          </article>

          {/* ЭКИПАЖ — паттерн-горошек: конфетти собранной команды */}
          <article
            className={`${styles.card} ${styles.cardParty} ${shared.patternDots} ${shared.rv}`}
            style={{ "--tint": "var(--periwinkle)", "--rv": "360ms", "--pop": "560ms" } as CSSProperties}
          >
            <div className={styles.cardHead}>
              <span className={styles.label}>экипаж</span>
              <Glyph kind="party" />
            </div>
            <p className={styles.numRow}>
              <b className={styles.num}>1–4</b>
              <span className={styles.unit}>игрока</span>
            </p>
            <p className={styles.sub}>solo или с друзьями по ссылке</p>
            <a className={styles.play} href="#chars">Собрать экипаж</a>
          </article>
        </div>
      </div>
    </section>
  );
}
