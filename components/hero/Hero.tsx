"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, RefObject } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import styles from "./hero.module.css";
import shared from "../shared.module.css";

/*
 * Декорации-частицы — по мотивам спрайта whimsy-shapes, но свои, под лор:
 * месяц, ключ, искра. Три штуки — по бюджету whimsy: герой уже громкий,
 * небо не должно спорить с заголовком. У каждой — своя подпись движения.
 */
function Deco({
  className,
  variant,
}: {
  className: string;
  variant: "moon" | "key" | "rune" | "star" | "spark";
}) {
  return (
    <svg
      className={`${styles.deco} ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {variant === "moon" && (
        <path d="M20 14.5A8.5 8.5 0 019.7 3.6 8.5 8.5 0 1020 14.5Z" fill="currentColor" stroke="none" />
      )}
      {variant === "key" && (
        <>
          <circle cx="8" cy="8" r="4" />
          <path d="M11 11l9 9" />
          <path d="M17 17l2-2" />
          <path d="M20 20l1.5-1.5" />
        </>
      )}
      {variant === "rune" && (
        <>
          <path d="M12 3l8 16H4l8-16Z" />
          <circle cx="12" cy="14" r="2.2" fill="currentColor" stroke="none" />
        </>
      )}
      {variant === "star" && (
        <path
          d="M12 3l2.2 5.6 6 .5-4.6 3.9 1.4 5.8L12 15.6l-5 3.2 1.4-5.8L3.8 9.1l6-.5L12 3Z"
          fill="currentColor"
          stroke="none"
        />
      )}
      {variant === "spark" && (
        <path
          d="M12 0c.9 7 4.1 10.2 12 12-7.9 1.8-11.1 5-12 12-.9-7-4.1-10.2-12-12C7.9 10.2 11.1 7 12 0Z"
          fill="currentColor"
          stroke="none"
        />
      )}
    </svg>
  );
}

/*
 * Цепочка-выключатель, как на светильниках: свисает с кончика золотого
 * росчерка под «Петербургом». Дёргаешь — в кадре «проявляется» цвет,
 * дёргаешь ещё раз — ночь снова становится нуарной. Ручка из латуни;
 * когда цвет включён, ручка греется золотым свечением.
 *
 * Физика — верле-цепочка (метод Якобсена): 10 точек (кольцо + 8 бусин
 * + хват ручки), скорость неявная (позиция минус прошлая), гравитация
 * и лёгкий «ветер», связи-расстояния расслабляются итеративно каждый
 * шаг фиксированной длины. Бусины пишутся в svg-координатах каждый
 * кадр; «разворачивание» цепочки при входе — не анимация, а гравитация:
 * точки стартуют собранными у кольца и падают, раскрываясь.
 */
const CORD_REST = [5.5, 12.5, 21, 29.5, 38, 46.5, 55, 63.5, 72, 86];
const CORD_SEGS = [7, 8.5, 8.5, 8.5, 8.5, 8.5, 8.5, 8.5, 14];

function PullCord({
  lit,
  showHint,
  cordRef,
}: {
  lit: boolean;
  showHint: boolean;
  cordRef: RefObject<HTMLButtonElement | null>;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={lit}
      aria-label="Цвет"
      className={styles.cord}
      ref={cordRef}
    >
      {/* Рукописная подсказка исчезает после первого рывка */}
      {showHint && (
        <span className={styles.cordHint} aria-hidden="true">
          <svg viewBox="0 0 34 34" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M31 26 C 22 26, 12 20, 8 9" />
            <path d="M8 9 L6.7 16.4" />
            <path d="M8 9 L13.7 13.8" />
          </svg>
          дёрни
        </span>
      )}
      <svg className={styles.cordSvg} viewBox="0 0 24 112" aria-hidden="true">
        <defs>
          <linearGradient id="mp-cord-steel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dce6f2" />
            <stop offset="100%" stopColor="#7e93b3" />
          </linearGradient>
          <linearGradient id="mp-cord-brass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f6e2a4" />
            <stop offset="100%" stopColor="#b98f3e" />
          </linearGradient>
        </defs>
        {/* Кольцо-крепление цепляется за кончик росчерка (точка подвеса) */}
        <circle cx="12" cy="5.5" r="2.4" fill="none" stroke="#9db1cd" strokeWidth="1.6" />
        {/* Бусины стартуют собранными у кольца — физика их развесит */}
        {CORD_REST.slice(1, 9).map((_, i) => (
          <circle key={i} className={styles.cordBead} cx="12" cy="5.5" r="2.7" fill="url(#mp-cord-steel)" />
        ))}
        {/* Латунная ручка-капля: центр схвата в локальном нуле */}
        <g className={styles.cordHandleG} transform="translate(12 5.5)">
          <path
            className={styles.cordHandle}
            d="M0 0c3.4 0 4.6 2.3 4.35 6.1-.25 3.9-2.1 8.9-4.35 8.9s-4.1-5-4.35-8.9C-4.35 2.3 -3.4 0 0 0Z"
            fill="url(#mp-cord-brass)"
            stroke="#8a6b2a"
            strokeWidth="0.8"
          />
        </g>
      </svg>
    </button>
  );
}

/* Буквы заголовка: каждая — отдельный span, входит своей пружиной */
function Letters({ word, base = 0 }: { word: string; base?: number }) {
  return (
    <>
      {word.split("").map((ch, i) => (
        <span
          key={i}
          className={styles.h1Lt}
          style={{ "--i": base + i } as CSSProperties}
        >
          {ch}
        </span>
      ))}
    </>
  );
}

/*
 * Нижние «свупы» — волна по нижней кромке героя. Путь снят с whimsy
 * (BottomSwoops, viewBox 0 0 2036 268): заливка режет край секции волной,
 * штрих едет по кривой на скролл-таймлайне.
 */
const SWOOP_PATH =
  "M 2026 132.5 C 2026 132.5 1985.5 33.5 1857.5 23 C 1729.5 12.5 1705.5 125 1676 132.5 C 1646.5 140 1595 59.5 1481 82.5 C 1367 105.5 1353.5 163.8 1342 162 C 1330.5 160.2 1342.5 105 1219.5 82.5 C 1096.5 60 1098 168 1061.5 168 C 1025 168 991 118.5 882.5 117 C 774 115.5 714 168 692.5 168 C 671 168 635 104.5 559 105 C 483 105.5 453 168 427 168 C 401 168 390.5 22.5 248 11 C 105.5 -0.5 0 135.5 0 135.5";

function Swoops() {
  return (
    <div className={styles.swoops} aria-hidden="true">
      <svg viewBox="0 0 2036 268" preserveAspectRatio="none">
        {/* Заливка: режет низ героя волной в цвет земли */}
        <path className={styles.swoopFiller} d={`${SWOOP_PATH} L 0 269 L 2036 269 Z`} />
        {/* Штрихи едут по кромке, когда страница скроллится */}
        <path className={styles.swoop} pathLength={100} d={SWOOP_PATH} />
        <path
          className={`${styles.swoop} ${styles.swoopBack}`}
          pathLength={100}
          d={SWOOP_PATH}
          transform="translate(0 30)"
        />
      </svg>
    </div>
  );
}

/* Герой: набережная Мойки, звёзды, частицы, параллакс слоёв */
export default function Hero() {
  const heroRef = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const yBg = useTransform(scrollYProgress, [0, 1], [0, 64]);
  const yMist = useTransform(scrollYProgress, [0, 1], [0, 96]);
  const yTitle = useTransform(scrollYProgress, [0, 1], [0, 30]);

  /*
   * Параллакс: при поддержке CSS scroll-таймлайнов motion отключается,
   * движением управляет hero.module.css (@supports (animation-timeline: scroll())).
   * Проверка после монтирования: SSR и гидратация рендерят одинаково,
   * значения обеих систем совпадают, поэтому переключение незаметно.
   */
  const [cssTimeline, setCssTimeline] = useState(false);
  useEffect(() => {
    setCssTimeline(
      typeof CSS !== "undefined" &&
        typeof CSS.supports === "function" &&
        CSS.supports("animation-timeline: scroll()"),
    );
  }, []);
  const parallax = (y: typeof yBg) =>
    reduce || cssTimeline ? undefined : { y };

  /*
   * Цепочка-выключатель: кадр рождается нуарным, рывок цепочки
   * «включает свет» — цвет проявляется. Физика — верле-интегрирование
   * с дистанционными связями (метод Якобсена): гравитация, лёгкий
   * сквозняк, курсор «задевает» бусины, за ручку можно схватиться и
   * дёрнуть — цепочка над рукой живёт по-настоящему, бросок при
   * отпускании получается сам. Переключает рывок >11 svg-единиц или
   * короткий тап; Enter/Space — хлыст ручкой вниз.
   */
  const [lit, setLit] = useState(false);
  const [pulled, setPulled] = useState(false);
  const cordRef = useRef<HTMLButtonElement | null>(null);
  const toggleLit = useCallback(() => {
    setLit((v) => !v);
    setPulled(true);
  }, []);

  useEffect(() => {
    const btn = cordRef.current;
    const svg = btn?.querySelector<SVGSVGElement>(`svg.${styles.cordSvg}`);
    if (!btn || !svg) return;

    const beads = Array.from(
      svg.querySelectorAll<SVGCircleElement>(`circle.${styles.cordBead}`),
    );
    const handleG = svg.querySelector<SVGGElement>(`g.${styles.cordHandleG}`);

    /* Покой движения: цепочка в позе покоя, переключает только клик */
    if (reduce || !handleG) {
      beads.forEach((b, i) => {
        b.setAttribute("cx", "12");
        b.setAttribute("cy", String(CORD_REST[i + 1]));
      });
      handleG?.setAttribute("transform", `translate(12 ${CORD_REST[9]})`);
      const onClick = () => toggleLit();
      btn.addEventListener("click", onClick);
      return () => btn.removeEventListener("click", onClick);
    }

    /*
     * Верле-цепочка. Точки: x/y — позиция, ox/oy — прошлая позиция,
     * скорость неявная (x − ox). Фиксированный шаг DT обязательна —
     * верле без него непредсказуем. Связи — расстояния между соседями,
     * расслабляются ITER раз за шаг: цепочка шариковая, почти нерастяжимая.
     * Старт — сжатая вертикальная стопка у кольца: солвер растягивает её
     * ВНИЗ по гравитации, цепочка раскрывается мягко, без бокового взрыва.
     */
    const pts = CORD_REST.map((_, i) => ({
      x: 12 + (i % 2 === 0 ? -0.12 : 0.12),
      y: 5.5 + i * 1.2,
      ox: 12 + (i % 2 === 0 ? -0.12 : 0.12),
      oy: 5.5 + i * 1.2,
    })); // стопка без начальной скорости: единица скорости шага — это 120 ед/с
    const grab = { i: -1, x: 12, y: 86 };
    // курсор-«щётка»: толчок только от ДВИЖУЩЕГОСЯ курсора — подведённая
    // и замершая рука цепочку не расталкивает, за конец можно взяться
    const cursor = { on: false, x: 12, y: -40, ux: 0, uy: 0, speed: 0, t: 0 };

    const DT = 1 / 120;
    const MAX_STEPS = 6;
    const G = 1500; // svg-единиц/с² — маятник ~1.4с
    const DAMP = 0.995; // сопротивление воздуха: вход утихает за ~1.5с
    const ITER = 14;
    const R_BRUSH = 12; // радиус «щётки» курсора, svg-единиц (~15px)
    /*
     * Посадочное гнездо: цепочка СКОЛЬЗИТ сквозь кольцо, якорь (P0)
     * подпружинен к дому. Висящая с одной точки цепь всегда натянута —
     * рывок вниз «берёт ход» именно у якоря: вся цепь проезжает вниз,
     * пружина возвращает. Без этого дёрнуть конец вниз было бы нельзя.
     */
    const K_PIN = 900; // жёсткость пружины гнезда, с⁻²
    const PIN_DAMP = 0.85; // якорь гасится сильнее бусин

    let acc = 0, last = 0, raf = 0, running = false, simT = 0;
    let started = false, visible = true;
    let downAt = 0, maxMove = 0;
    let pointerToggleAt = 0;
    let startTimer = 0 as unknown as ReturnType<typeof setTimeout>;

    const solve = () => {
      for (let k = 0; k < ITER; k++) {
        for (let i = 0; i < CORD_SEGS.length; i++) {
          const a = pts[i];
          const b = pts[i + 1];
          let dx = b.x - a.x;
          let dy = b.y - a.y;
          let d = Math.hypot(dx, dy);
          if (d < 1e-6) {
            dx = 0;
            dy = 1;
            d = 1;
          }
          const diff = (d - CORD_SEGS[i]) / d;
          // веса: якорь «тяжёлый» (пружина гнезда), захваченная точка
          // прибита к руке, бусины равны между собой
          const wA = i === 0 ? 0.15 : grab.i === i ? 0 : 1;
          const wB = grab.i === i + 1 ? 0 : 1;
          const tw = wA + wB;
          if (!tw) continue;
          a.x += dx * diff * (wA / tw);
          a.y += dy * diff * (wA / tw);
          b.x -= dx * diff * (wB / tw);
          b.y -= dy * diff * (wB / tw);
        }
      }
    };

    const step = () => {
      simT += DT;
      // сквозняк: два несовпадающих синуса — цепочка едва «дышит»
      const wind = Math.sin(simT * 1.1) * 10 + Math.sin(simT * 0.37 + 1.7) * 4;
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        if (i === grab.i) {
          // захваченная точка ведётся курсором — бросок получится сам
          p.ox = p.x;
          p.oy = p.y;
          p.x = grab.x;
          p.y = grab.y;
          continue;
        }
        const damp = i === 0 ? PIN_DAMP : DAMP;
        const vx = (p.x - p.ox) * damp;
        const vy = (p.y - p.oy) * damp;
        p.ox = p.x;
        p.oy = p.y;
        if (i === 0) {
          // якорь гнезда: пружина к дому, без гравитации — гнездо в Росчерке
          p.x += vx + (12 - p.x) * K_PIN * DT * DT;
          p.y += vy + (5.5 - p.y) * K_PIN * DT * DT;
          // кольцо-направляющая и упор гнезда: якорь ходит только по вертикали
          if (p.x < 9.5) p.x = 9.5;
          else if (p.x > 14.5) p.x = 14.5;
          if (p.y < 4.5) p.y = 4.5;
          else if (p.y > 24) p.y = 24;
          continue;
        }
        p.x += vx + wind * DT * DT;
        p.y += vy + G * DT * DT;
        // курсор «задевает» бусины — но только ДВИЖУЩИЙСЯ: подведённая и
        // замершая рука ничего не толкает, за конец можно спокойно взяться
        if (
          cursor.on &&
          cursor.speed > 50 &&
          performance.now() - cursor.t < 60
        ) {
          const dx = p.x - cursor.x;
          const dy = p.y - cursor.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < R_BRUSH * R_BRUSH) {
            const f =
              (1 - Math.sqrt(d2) / R_BRUSH) *
              Math.min(cursor.speed / 480, 1.3) *
              0.6;
            p.x += cursor.ux * f;
            p.y += cursor.uy * f;
          }
        }
      }
      solve();
    };

    const render = () => {
      for (let i = 1; i <= 8; i++) {
        beads[i - 1].setAttribute("cx", pts[i].x.toFixed(2));
        beads[i - 1].setAttribute("cy", pts[i].y.toFixed(2));
      }
      const p8 = pts[8];
      const p9 = pts[9];
      const ang = (Math.atan2(p9.y - p8.y, p9.x - p8.x) * 180) / Math.PI - 90;
      handleG.setAttribute(
        "transform",
        `translate(${p9.x.toFixed(2)} ${p9.y.toFixed(2)}) rotate(${ang.toFixed(1)})`,
      );
    };

    const frame = (t: number) => {
      raf = 0;
      if (!last) last = t;
      acc += Math.min((t - last) / 1000, 0.1);
      last = t;
      let n = 0;
      while (acc >= DT && n < MAX_STEPS) {
        step();
        acc -= DT;
        n++;
      }
      if (acc > DT * MAX_STEPS) acc = 0;
      render();
      if (started && visible) raf = requestAnimationFrame(frame);
      else running = false;
    };
    const wake = () => {
      if (running || !started || !visible) return;
      running = true;
      last = 0;
      acc = 0;
      raf = requestAnimationFrame(frame);
    };

    const toSvg = (clientX: number, clientY: number) => {
      const m = svg.getScreenCTM();
      if (!m) return null;
      return new DOMPoint(clientX, clientY).matrixTransform(m.inverse());
    };

    /*
     * Щелчок без драга: дёргаем цепочку градиентно — низ сильнее верха,
     * смещение + скорость. Одну точку солвер «размазал» бы по связям,
     * а так вниз уезжает вся цепь и пружина гнезда её возвращает.
     */
    const yankChain = (base: number) => {
      for (let i = 1; i < pts.length; i++) {
        const f = 0.35 + (i / pts.length) * 0.75;
        pts[i].y += base * f;
        pts[i].oy += base * f * 0.45;
      }
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const p = toSvg(e.clientX, e.clientY);
      if (!p) return;
      // берём ближайшую точку (кольцо не срываем — оно прибито);
      // ручке — бонус захвата: нажатие по латунной капле берёт её,
      // даже если бусина формально чуть ближе
      let best = 9;
      let bd = Infinity;
      for (let i = 1; i < pts.length; i++) {
        const w = i === 9 ? 0.35 : 1;
        const d2 =
          ((pts[i].x - p.x) ** 2 + (pts[i].y - p.y) ** 2) * w;
        if (d2 < bd) {
          bd = d2;
          best = i;
        }
      }
      grab.i = best;
      grab.x = pts[best].x;
      grab.y = pts[best].y;
      downAt = performance.now();
      maxMove = 0;
      btn.setPointerCapture(e.pointerId);
      btn.classList.add(styles.cordGrab);
      wake();
    };
    const onMove = (e: PointerEvent) => {
      const p = toSvg(e.clientX, e.clientY);
      if (!p) return;
      const now = performance.now();
      const mdt = Math.max((now - cursor.t) / 1000, 1e-3);
      const mvx = (p.x - cursor.x) / mdt;
      const mvy = (p.y - cursor.y) / mdt;
      const msp = Math.hypot(mvx, mvy);
      cursor.ux = msp > 1e-3 ? mvx / msp : 0;
      cursor.uy = msp > 1e-3 ? mvy / msp : 0;
      cursor.speed = Math.min(msp, 650);
      cursor.t = now;
      cursor.on = true;
      cursor.x = p.x;
      cursor.y = p.y;
      if (grab.i > 0) {
        /*
         * Рука — сырой курсор, тянуть можно на 360°: поле широкое
         * (−48..72 × 4..122), радиального клампа нет. Кламп вокруг якоря
         * делал «мёртвую зону» — цепь висела на длине покоя, якорь не ехал,
         * ручка застревала. Теперь предел честный: упор гнезда и длина
         * связей — рука чувствует сопротивление механизма.
         */
        const gx = Math.max(-48, Math.min(72, p.x));
        const gy = Math.max(4, Math.min(122, p.y));
        grab.x = gx;
        grab.y = gy;
        maxMove = Math.max(
          maxMove,
          Math.hypot(pts[grab.i].x - 12, pts[grab.i].y - CORD_REST[grab.i]),
        );
      }
    };
    const onUp = () => {
      if (grab.i < 0) return;
      const g = pts[grab.i];
      const disp = Math.hypot(g.x - 12, g.y - CORD_REST[grab.i]);
      const anchorPull = pts[0].y - 5.5; // ход пружины гнезда = «щелчок»
      const quick = performance.now() - downAt < 250 && maxMove < 4;
      btn.classList.remove(styles.cordGrab);
      if (anchorPull > 5.5 || disp > 11 || quick) {
        pointerToggleAt = performance.now();
        toggleLit();
        if (quick) {
          // простой клик: цепочка дёргается вниз градиентно и отпружинивает
          yankChain(12);
        } else {
          g.oy += 3.5; // щелчок после натяжения: отскок вверх
        }
      }
      grab.i = -1;
      wake();
    };
    const onLeave = () => {
      cursor.on = false;
    };
    const onClick = () => {
      // pointer-путь уже переключил — синтетический клик гасим (приходит
      // в той же задаче после pointerup, 200мс с запасом)
      if (performance.now() - pointerToggleAt < 200) return;
      toggleLit();
      // клавиатурный «рывок»: цепь дёргается вниз градиентно
      yankChain(12);
      wake();
    };

    // Вход: после отрисовки росчерка цепочка падает из кольца и раскрывается
    startTimer = setTimeout(() => {
      started = true;
      wake();
    }, 1900);

    // вне вьюпорта симуляция спит (IO), на экране — снова дышит
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible) wake();
    });
    io.observe(btn);

    btn.addEventListener("pointerdown", onDown);
    btn.addEventListener("pointermove", onMove);
    btn.addEventListener("pointerup", onUp);
    btn.addEventListener("pointercancel", onUp);
    btn.addEventListener("pointerleave", onLeave);
    btn.addEventListener("click", onClick);
    return () => {
      clearTimeout(startTimer);
      cancelAnimationFrame(raf);
      io.disconnect();
      btn.removeEventListener("pointerdown", onDown);
      btn.removeEventListener("pointermove", onMove);
      btn.removeEventListener("pointerup", onUp);
      btn.removeEventListener("pointercancel", onUp);
      btn.removeEventListener("pointerleave", onLeave);
      btn.removeEventListener("click", onClick);
    };
  }, [reduce, toggleLit]);

  return (
    <section
      className={lit ? `${styles.hero} ${styles.heroLit}` : styles.hero}
      id="top"
      ref={heroRef}
    >
      <motion.div className={styles.heroBg} style={parallax(yBg)}>
        {/* Фон героя: кадр из игры — набережная Мойки вечером */}
        <div className={styles.slotCity}>
          <img
            src="/assets/hero.jpg"
            alt=""
            fetchPriority="high"
            decoding="async"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        {/*
         * Видео-включение: ascii-анимация ложится поверх кадра, когда
         * цепочка включила цвет. Живёт в heroBg — под dim и туманом,
         * чтобы заголовок оставался читаемым. 5 секунд, цикл.
         */}
        {lit && (
          <video
            className={styles.slotVideo}
            src="/assets/ascii-animation.mp4"
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
          />
        )}
      </motion.div>
      {/* Небольшое затемнение: фото остаётся видно, текст читается */}
      <div className={styles.dim} aria-hidden="true" />
      <motion.div className={styles.mistLayer} style={parallax(yMist)} aria-hidden="true" />
      <div className={shared.stars} aria-hidden="true" />
      {/* Декорации-частицы: месяц, ключ, искра — три, не шесть */}
      <Deco className={styles.decoMoon} variant="moon" />
      <Deco className={styles.decoKey} variant="key" />
      <Deco className={styles.decoSpark1} variant="spark" />
      <motion.div className={styles.heroContent} style={parallax(yTitle)}>
        <h1 className={styles.h1}>
          <span className={shared.srOnly}>Мистический Петербург</span>
          <span className={styles.h1Line} aria-hidden="true">
            <Letters word="Мистический" />
          </span>
          <span className={styles.h1Line2} aria-hidden="true">
            {/*
             * Город — svg-текст с градиентной заливкой, как заголовок whimsy:
             * fill="url(#…)" не зависит от background-clip и анимаций.
             */}
            <svg className={styles.h1CitySvg}>
              <defs>
                {/*
                 * Градиент города — фиолетовый в белый, 45° (вектор снизу-слева
                 * вверх-вправо). Нижний пол ограничен #8f39f9: темнее —
                 * контраст к ночи #0f172a падает ниже 3:1 (крупный текст).
                 */}
                <linearGradient id="mp-city-grad" x1="0" y1="1" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8f39f9" />
                  <stop offset="5%" stopColor="#9b42fa" />
                  <stop offset="10%" stopColor="#a446fb" />
                  <stop offset="14%" stopColor="#ac4bfb" />
                  <stop offset="19%" stopColor="#b44ffc" />
                  <stop offset="23%" stopColor="#bc53fd" />
                  <stop offset="27%" stopColor="#c458fd" />
                  <stop offset="31%" stopColor="#cb5dfe" />
                  <stop offset="35%" stopColor="#d466ff" />
                  <stop offset="39%" stopColor="#d875ff" />
                  <stop offset="43%" stopColor="#de85ff" />
                  <stop offset="47%" stopColor="#e294ff" />
                  <stop offset="51%" stopColor="#e79eff" />
                  <stop offset="56%" stopColor="#ecadff" />
                  <stop offset="60%" stopColor="#f0bdff" />
                  <stop offset="65%" stopColor="#f3c7ff" />
                  <stop offset="70%" stopColor="#f6d6ff" />
                  <stop offset="75%" stopColor="#fae6ff" />
                  <stop offset="83%" stopColor="#fcf0ff" />
                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
              </defs>
              <text
                className={styles.h1City}
                x="50%"
                y="0.78em"
                textAnchor="middle"
                fill="url(#mp-city-grad)"
              >
                Петербург
              </text>
            </svg>
            <svg className={styles.h1Under} viewBox="0 0 440 26" preserveAspectRatio="none">
              <path pathLength={100} d="M6 14 C 110 26, 250 2, 434 12" />
            </svg>
          </span>
          {/*
           * Цепочка-выключатель висит на кончике росчерка. Живёт в h1,
           * но ВНЕ aria-hidden строк: кнопка доступна фокусу и скринридеру.
           */}
          <PullCord
            lit={lit}
            showHint={!pulled}
            cordRef={cordRef}
          />
        </h1>
        <p className={`${styles.sub} ${styles.a2}`}>
          Браузер. <b className={styles.subB}>Друзья.</b> Один вечер.{" "}
          <b className={styles.subP}>Одна тайна.</b>
        </p>
        <div className={`${styles.ctaRow} ${styles.a3}`}>
          <a className={shared.cta} href="#play">Играть</a>
          <a className={shared.ctaGhost} href="#case">Что внутри</a>
        </div>
        {/* Рукописная пометка: куда нажать (приём whimsy) */}
        <div className={`${styles.anno} ${styles.a4}`} aria-hidden="true">
          <svg className={styles.annoArrow} viewBox="0 0 34 34" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M31 28 C 20 28, 8 20, 5 7" />
            <path d="M5 7 L2.8 14.2" />
            <path d="M5 7 L10.1 12.5" />
          </svg>
          <span>начните с дела №1</span>
        </div>
      </motion.div>
      {/* Волна-свуп по нижней кромке героя (путь снят с whimsy) */}
      <Swoops />
    </section>
  );
}
