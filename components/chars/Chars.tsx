"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import { Squiggle } from "../decor";
import shared from "../shared.module.css";
import { useReveal } from "../use-reveal";
import styles from "./chars.module.css";

/*
 * Сыщики — персонажи игры (портреты из её ассетов). Цвет ленты (--cc, живой)
 * и цвет подписи на бумаге (--ccd, глубокий) — цвета классов из игры.
 * Портреты-полароиды: бумага досье, лента скотча цвета класса, наклон.
 */
const CHARS = [
  {
    name: "Борис",
    img: "/assets/boris.jpg",
    cls: "детектив",
    color: "var(--c-detective)",
    deep: "var(--cd-detective)",
    bio: "Отдел особых дел Минмага. Ложь слышит раньше, чем её договорят.",
    ability: "«Дополнительные вопросы»",
    abilityNote: "при допросах",
  },
  {
    name: "Алина",
    img: "/assets/alina.jpg",
    cls: "ведьма",
    color: "var(--c-witch)",
    deep: "var(--cd-witch)",
    bio: "Славянская магия, лицензия категории Б. Наговоры — строго по расписанию.",
    ability: "«Мистический взгляд»",
    abilityNote: "видит скрытые улики",
  },
  {
    name: "Елена",
    img: "/assets/elena.jpg",
    cls: "криминалист",
    color: "var(--c-criminalist)",
    deep: "var(--cd-criminalist)",
    bio: "Академическая школа, МГУ. Верит только результату экспертизы.",
    ability: "«Экспресс-экспертиза»",
    abilityNote: "без траты хода",
  },
  {
    name: "Дмитрий",
    img: "/assets/dmitrii.jpg",
    cls: "вор",
    color: "var(--c-thief)",
    deep: "var(--cd-thief)",
    bio: "Техномаг на удалёнке. Знает в городе каждую запертую дверь лично.",
    ability: "«Вскрытие замков»",
    abilityNote: "без отмычек",
  },
];

/* 05. СЫЩИКИ: полароиды из досье, приклеены к ночи */
export default function Chars() {
  const charRef = useReveal<HTMLElement>();

  /*
   * Наклон полароидов за курсором (бюджетная версия рецептов whimsy
   * №12/13): снимок качается на ленте скотча. JS только меряет геометрию
   * и лерпит --rx/--ry на transform-свойствах; движением владеет CSS
   * (transform-origin стоит у ленты, над карточкой). Включается лишь на
   * точных указателях и без prefers-reduced-motion.
   */
  const rosterRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const roster = rosterRef.current;
    if (!roster) return;
    if (
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const cards = Array.from(
      roster.querySelectorAll<HTMLElement>(`.${styles.pol}`),
    );
    if (!cards.length) return;

    const MAX_X = 5; // градусы: край под курсором тянется к зрителю
    const MAX_Y = 10;
    const st = cards.map(() => ({ rx: 0, ry: 0, tx: 0, ty: 0 }));
    let raf = 0;

    const loop = () => {
      let busy = false;
      cards.forEach((el, i) => {
        const s = st[i];
        s.rx += (s.tx - s.rx) * 0.16;
        s.ry += (s.ty - s.ry) * 0.16;
        if (Math.abs(s.tx - s.rx) > 0.02 || Math.abs(s.ty - s.ry) > 0.02) {
          busy = true;
        } else {
          s.rx = s.tx;
          s.ry = s.ty;
        }
        el.style.setProperty("--rx", `${s.rx.toFixed(2)}deg`);
        el.style.setProperty("--ry", `${s.ry.toFixed(2)}deg`);
      });
      raf = busy ? requestAnimationFrame(loop) : 0;
    };

    const wake = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      cards.forEach((el, i) => {
        const s = st[i];
        const r = el.getBoundingClientRect();
        const inside =
          e.clientX >= r.left &&
          e.clientX <= r.right &&
          e.clientY >= r.top &&
          e.clientY <= r.bottom;
        if (!inside) {
          s.tx = 0;
          s.ty = 0;
          return;
        }
        const dx = Math.max(
          -1,
          Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)),
        );
        const dy = Math.max(
          -1,
          Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2)),
        );
        s.tx = dy * MAX_X;
        s.ty = -dx * MAX_Y;
      });
      wake();
    };

    const onLeave = () => {
      st.forEach((s) => {
        s.tx = 0;
        s.ty = 0;
      });
      wake();
    };

    roster.addEventListener("pointermove", onMove);
    roster.addEventListener("pointerleave", onLeave);
    return () => {
      roster.removeEventListener("pointermove", onMove);
      roster.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className={shared.section} id="chars" ref={charRef}>
      <div className={shared.wrap}>
        <header className={`${shared.secHead} ${shared.rv}`}>
          <h2 className={shared.h2}>
            <span className={shared.squiggle}>За кого играть<Squiggle /></span>
          </h2>
          <p className={shared.secSub}>
            Четыре сыщика. У каждого своя способность.
          </p>
        </header>
        <div className={styles.roster} ref={rosterRef}>
          {CHARS.map((c, i) => (
            <article
              className={`${styles.pol} ${i % 2 === 1 ? styles.polDown : ""} ${shared.rv}`}
              key={c.name}
              style={
                {
                  "--cc": c.color,
                  "--ccd": c.deep,
                  transitionDelay: `${i * 90}ms`,
                } as CSSProperties
              }
            >
              {/* Статья .pol — неподвижная зона ховера (бокс не двигается,
                  курсор у края не «роняет» ховер); вся жизнь снимка —
                  на внутреннем .polIn */}
              <div className={styles.polIn}>
                <span className={styles.tape} aria-hidden="true" />
                {/* Портрет-полароид: персонаж игры, 4:5, бумага досье */}
                <div className={`${shared.slot} ${shared.slotPaper} ${styles.pshot}`}>
                  <img
                    src={c.img}
                    alt={`Портрет сыщика: ${c.name}, ${c.cls}`}
                    loading="lazy"
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 20%" }}
                  />
                </div>
                <h3 className={styles.pname}>{c.name}</h3>
                <p className={styles.prole}>{c.cls}</p>
                <p className={styles.pbio}>{c.bio}</p>
                <p className={styles.pability}>
                  {c.ability} <span>— {c.abilityNote}</span>
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
