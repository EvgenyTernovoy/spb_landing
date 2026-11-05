"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import styles from "./demo.module.css";
import panoStyles from "./pano.module.css";
import shared from "../shared.module.css";
import { Squiggle } from "../decor";
import { useReveal } from "../use-reveal";
import type { PanoSpot } from "./Pano360";

/*
 * Демо — интерактивная 360°-панорама локации L01 «Квартира Громова»
 * из сценария «Васильевский»: эквидистантный кадр локации игры
 * (pano.jpg) на сфере three.js — вращается drag'ом, как в самой игре.
 * Улики настоящие (E01, E17, E16 + мистическая E21). Игра блокирует
 * ориентацию в landscape (useLandscapeLock), поэтому телефон лежит
 * горизонтально. Yaw/pitch меток — на сфере; left/top — fallback.
 */

/* Панорама 360° — three.js грузится отдельным чанком, только в браузере */
const Pano360 = dynamic(() => import("./Pano360"), {
  ssr: false,
  loading: () => <div className={panoStyles.panoLoad} />,
});

type Spot = PanoSpot & {
  card: {
    id: string;
    name: string;
    text: string;
    img: string | null;
  };
};

const SPOTS: Spot[] = [
  {
    id: "evidence_candle",
    yaw: -79,
    pitch: -43,
    left: 28,
    top: 74,
    name: "Обугленные остатки свечи",
    card: {
      id: "E01",
      name: "Обугленные остатки свечи",
      text: "Плавленный воск с характерным душком. Свечка для ритуала стабилизации, но сгорела как спичка.",
      img: "/assets/items/E01.webp",
    },
  },
  {
    id: "evidence_receipt",
    yaw: -22,
    pitch: -52,
    left: 44,
    top: 86,
    name: "Обрывок расписки",
    card: {
      id: "E17",
      name: "Обрывок расписки",
      text: "Обгорелый клочок. Читается: «…Борис Невский… вернуть… 50 000… до 1 октября…»",
      img: "/assets/items/E17.webp",
    },
  },
  {
    id: "evidence_broach",
    yaw: 86,
    pitch: -43,
    left: 74,
    top: 74,
    name: "Заколка с камеей",
    card: {
      id: "E16",
      name: "Заколка с камеей",
      text: "Изящная вещичка. На обороте гравировка: «Е.К. — В.Г., навсегда».",
      img: "/assets/items/E16.webp",
    },
  },
  {
    id: "evidence_mystic",
    yaw: 58,
    pitch: 36,
    left: 66,
    top: 30,
    mystic: true,
    name: "Мистический след на стене",
    card: {
      id: "E21",
      name: "Мистический след на стене",
      text: "Фиолетовое марево, видное только ведьме. Остатки тёмного ритуала — кто-то пытался подавить защиту квартиры извне.",
      img: null,
    },
  },
];

/*
 * 04. ДЕМО: «Место происшествия» — 360°-панорама на сфере (three.js),
 * вращается drag'ом. Улики открываются карточкой, гаснут на сфере.
 */
export default function Demo() {
  const demoRef = useReveal<HTMLElement>();

  const [seen, setSeen] = useState<number[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [dragged, setDragged] = useState(false);

  /* Клик по метке: показать карточку улики, метку — погасить */
  const openSpot = (i: number) => {
    setActive(i);
    setSeen((s) => (s.includes(i) ? s : [...s, i]));
  };

  /* Первое вращение: погасить подсказку и закрыть карточку */
  const onPanoDrag = () => {
    setDragged(true);
    setActive(null);
  };

  return (
    <section className={`${shared.section} ${shared.band}`} id="demo" ref={demoRef}>
      <div className={`${shared.wrap} ${styles.previewGrid}`}>
        <div className={`${styles.previewText} ${shared.rv}`}>
          <h2 className={shared.h2}>
            Место <span className={shared.squiggle}>происшествия<Squiggle /></span>
          </h2>
          <p className={styles.previewPara}>
            В этой комнате — <b className={styles.markPeri}>четыре улики</b>{" "}
            настоящего дела №1: три найдёт каждый.{" "}
            <b className={styles.markPink}>Четвёртую увидит только ведьма.</b>
          </p>
          <span className={styles.handNote} aria-hidden="true">
            тяните панораму
            <svg viewBox="0 0 44 30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 4 C 16 2, 30 8, 38 20" />
              <path d="M38 20 L31 19.5" />
              <path d="M38 20 L36.8 13.6" />
            </svg>
          </span>
        </div>
        <div className={`${styles.phoneWrap} ${shared.rv}`} style={{ transitionDelay: "110ms" }}>
          <div className={styles.lamp} aria-hidden="true" />
          <div className={styles.phoneL}>
            <div className={styles.screen}>
              {/* 360°-панорама локации L01: сфера three.js, вращение drag'ом */}
              <Pano360
                src="/assets/pano.jpg"
                spots={SPOTS}
                seen={seen}
                onSpotClick={openSpot}
                onDragStart={onPanoDrag}
              />

              <span className={styles.gHint} data-hide={dragged} aria-hidden="true">тяните кадр</span>

              {/* Карточка улики: бумага досье на ночном кадре */}
              {active !== null && (
                  <div className={styles.clueCard} key={active} role="dialog" aria-label={SPOTS[active].card.name}>
                    <div className={styles.clueHead}>
                      {SPOTS[active].mystic && (
                        <i className={styles.clueWitch}>только ведьме</i>
                      )}
                      <button
                        className={styles.clueClose}
                        aria-label="Закрыть карточку улики"
                        onClick={() => setActive(null)}
                      >
                        ×
                      </button>
                    </div>
                    <div className={styles.clueRow}>
                      {SPOTS[active].card.img ? (
                        <img className={styles.clueThumb} src={SPOTS[active].card.img!} alt="" draggable={false} />
                      ) : (
                        <span className={`${styles.clueThumb} ${styles.clueThumbM}`} aria-hidden="true">✨</span>
                      )}
                      <div>
                        <h4 className={styles.clueTitle}>{SPOTS[active].card.name}</h4>
                        <p className={styles.clueText}>{SPOTS[active].card.text}</p>
                      </div>
                    </div>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
