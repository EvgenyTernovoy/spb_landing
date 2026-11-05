"use client";

import type { CSSProperties, ReactNode } from "react";
import { Squiggle } from "../decor";
import shared from "../shared.module.css";
import { useReveal } from "../use-reveal";
import styles from "./audience.module.css";

/*
 * Данные блока — копирайт пользователя (кому + слоган в кавычках).
 * Эмодзи из таблички переписаны штриховыми иконками в цвете карточки:
 * сердце с лупой, маска, наушники, тройка. Каждая иконка — рецепт
 * whimsy №1 в миниатюре: штрихи рисуют себя на скролле (pathLength=100).
 */
const AUDIENCE = [
  {
    icon: "pair",
    tint: "var(--pink)",
    who: "Парам",
    pitch: "«Свидание-расследование вместо сериала»",
  },
  {
    icon: "party",
    tint: "var(--lavender)",
    who: "Компаниям",
    pitch: "«Игра всегда под рукой»",
  },
  {
    icon: "fans",
    tint: "var(--periwinkle)",
    who: "True crime фанатам",
    pitch: "«Из слушателя — в детектива»",
  },
  {
    icon: "team",
    tint: "var(--steel)",
    who: "Коллегам",
    pitch: "«Никто не взял настолки? Не проблема»",
  },
] as const;

/* Штриховые иконки 24×24: stroke 1.6, round caps — как секундомер «Сценария» */
const ICONS: Record<(typeof AUDIENCE)[number]["icon"], ReactNode> = {
  /* Сердце + лупа: любовь под расследованием */
  pair: (
    <>
      <path
        pathLength={100}
        d="M10.6 18.8C7 16.1 3.4 13 3.4 9.4C3.4 7 5.3 5.4 7.4 5.4C8.8 5.4 9.9 6.1 10.6 7.2C11.3 6.1 12.4 5.4 13.8 5.4C15.9 5.4 17.8 7 17.8 9.4C17.8 13 14.2 16.1 10.6 18.8Z"
      />
      <circle pathLength={100} cx="16.6" cy="16.6" r="4.2" />
      <path pathLength={100} d="M19.7 19.7L22.7 22.7" />
    </>
  ),
  /* Маска: вечеринка, где у каждого своя интрига */
  party: (
    <>
      <path
        pathLength={100}
        d="M3 9.3C3 7.3 5.1 6.3 7.5 6.8C9.4 7.2 10.7 8.7 12 8.7C13.3 8.7 14.6 7.2 16.5 6.8C18.9 6.3 21 7.3 21 9.3C21 12.1 18.5 14.1 15.6 14.1C13.9 14.1 13 12.8 12 12.8C11 12.8 10.1 14.1 8.4 14.1C5.5 14.1 3 12.1 3 9.3Z"
      />
      <circle pathLength={100} cx="7.6" cy="9.8" r="1.75" />
      <circle pathLength={100} cx="16.4" cy="9.8" r="1.75" />
    </>
  ),
  /* Наушники подкастера: слушал дело — теперь ведёт его */
  fans: (
    <>
      <path pathLength={100} d="M4.4 13.4V11.6a7.6 7.6 0 0 1 15.2 0v1.8" />
      <rect pathLength={100} x="3" y="13.2" width="4.5" height="6.5" rx="2.25" />
      <rect pathLength={100} x="16.5" y="13.2" width="4.5" height="6.5" rx="2.25" />
    </>
  ),
  /* Тройка: команда за одним столом */
  team: (
    <>
      <circle pathLength={100} cx="10" cy="7.4" r="3.7" />
      <path pathLength={100} d="M3.2 20.6C4.1 17 6.6 15.2 10 15.2C13.4 15.2 15.9 17 16.8 20.6" />
      <circle pathLength={100} cx="17.3" cy="9" r="2.9" />
      <path pathLength={100} d="M22.8 20.4C22.2 17.6 20.4 16 17.8 15.9" />
    </>
  ),
};

/*
 * 06. ДЛЯ КОГО — четыре визитки на столе сыщика. Тихий фильтр перед
 * FAQ: ни кликов, ни rAF — пружины входа, саморисующиеся иконки
 * и рукописные слоганы в цвете карточки.
 */
export default function Audience() {
  const audienceRef = useReveal<HTMLElement>();

  return (
    <section className={shared.section} id="audience" ref={audienceRef}>
      <div className={shared.wrap}>
        <header className={`${shared.secHead} ${shared.rv}`}>
          <h2 className={shared.h2}>
            Для{" "}
            <span className={shared.squiggle}>
              кого<Squiggle />
            </span>
          </h2>
          <p className={shared.secSub}>
            Один квартал, одно дело — а поводов открыть его четыре.{" "}
            <span className={shared.subHand}>выбирайте свой</span>
          </p>
        </header>

        <div className={styles.deck}>
          {AUDIENCE.map((a, i) => (
            <article
              className={`${styles.card} ${shared.rv}`}
              key={a.who}
              style={{ "--tint": a.tint, "--rv": `${i * 90}ms` } as CSSProperties}
            >
              {/* Статья .card — неподвижная зона ховера и носитель входа
                  (задержка каскада живёт только здесь, ховеров на ней
                  нет); вся жизнь визитки — на внутреннем .cardIn */}
              <div className={styles.cardIn}>
                <span className={styles.icon} aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {ICONS[a.icon]}
                  </svg>
                </span>
                <h3 className={styles.who}>{a.who}</h3>
                <p className={styles.pitch}>{a.pitch}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
