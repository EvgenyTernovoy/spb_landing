"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import styles from "./how-play.module.css";
import shared from "../shared.module.css";
import { Squiggle } from "../decor";
import { useReveal } from "../use-reveal";

const STEPS = [
  {
    n: "01",
    t: "Получаете ссылку",
    d: "Сценарий — в сообщении. Открыли — и игра пошла.",
    icon: (
      /* 📩 конверт со ссылкой на сценарий */
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" pathLength={100} />
        <path d="M4.5 8.2l7.5 5.4 7.5-5.4" pathLength={100} />
      </svg>
    ),
  },
  {
    n: "02",
    t: "Расследуете",
    d: "Выберите роль → осматривайте комнаты → находите улики → проводите допросы.",
    icon: (
      /* 🔍 лупа сыщика */
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10.5 3.5a7 7 0 1 0 0 14 7 7 0 0 0 0-14z" pathLength={100} />
        <path d="M10.5 7.3v6.4M7.3 10.5h6.4" pathLength={100} />
        <path d="M15.7 15.7l4.8 4.8" pathLength={100} />
      </svg>
    ),
  },
  {
    n: "03",
    t: "Проверка",
    d: "По истечении времени называете убийцу и мотив.",
    icon: (
      /* ⚖️ весы правосудия */
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 4.5v15.7M8.2 20.2h7.6" pathLength={100} />
        <path d="M4.5 7.6h15" pathLength={100} />
        <path d="M4.5 7.6L2 15c.9.66 1.65 1 2.5 1s1.6-.34 2.5-1L4.5 7.6zM19.5 7.6L17 15c.9.66 1.65 1 2.5 1s1.6-.34 2.5-1l-2.5-7.4z" pathLength={100} />
      </svg>
    ),
  },
];

/* Цвет шага — из триады палитры (синий → магия → золото), инлайном:
 * шаги живут в общем контейнере с svg-следом и искрой, :nth-child
 * тут ненадёжен */
const TINTS = ["var(--periwinkle)", "var(--pink)", "var(--lavender)"];

/*
 * 02. КАК ИГРАТЬ — «след сыщика». Один образ на всю секцию: три шага
 * стоят станциями на пунктирном следе, туман медленно ползёт по ночи,
 * а золотая искра-фонарик летит по следу за курсором. Смещений нет —
 * строгая вертикаль; тексты и крупные буквы прежние.
 */
export default function HowPlay() {
  const howRef = useReveal<HTMLElement>();

  /*
   * «Как играть» — живой след. Путь между станциями строится по факту
   * (центры колец измеряются после монтирования, геометрия вместо
   * нарисованного ассета — принцип whimsy §5.5), штрих дорисовывает себя
   * на скролле (view-таймлайн в CSS). Искра-фонарик летит по следу за
   * курсором с инерцией (лерп-петля, рецепт №12) и без курсора держится
   * точки скролла. Всё гаснет при prefers-reduced-motion, а без JS след
   * просто нарисован целиком (запасной растягиваемый d).
   */
  const stepsRef = useRef<HTMLDivElement | null>(null);
  const trailSvgRef = useRef<SVGSVGElement | null>(null);
  const trailLineRef = useRef<SVGPathElement | null>(null);
  const trailTrackRef = useRef<SVGPathElement | null>(null);
  const sparkRef = useRef<HTMLSpanElement | null>(null);
  const endDotRef = useRef<HTMLSpanElement | null>(null);
  const nodeRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const steps = stepsRef.current;
    const svg = trailSvgRef.current;
    const line = trailLineRef.current;
    const track = trailTrackRef.current;
    const spark = sparkRef.current;
    if (!steps || !svg || !line || !track || !spark) return;

    const nodes = nodeRefs.current.filter((n): n is HTMLSpanElement => !!n);
    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");

    let samples: { x: number; y: number }[] = [];

    /* Центр элемента в координатах .steps — по цепочке offsetParent:
     * не зависит от transform входа (.rv) и position шагов */
    const centerOf = (el: HTMLElement) => {
      let x = el.offsetLeft + el.offsetWidth / 2;
      let y = el.offsetTop + el.offsetHeight / 2;
      let p = el.offsetParent as HTMLElement | null;
      while (p && p !== steps) {
        x += p.offsetLeft;
        y += p.offsetTop;
        p = p.offsetParent as HTMLElement | null;
      }
      return { x, y };
    };

    /*
     * Волна следа: между станциями мягкая S-образная дуга — направляющие
     * прижаты к станциям по вертикали и чуть разведены по горизонтали,
     * чередуя сторону. Никаких петель: развод не больше трети колонки.
     */
    const build = () => {
      const w = svg.clientWidth;
      const h = svg.clientHeight;
      if (!w || !h || nodes.length === 0) return;
      const pts = nodes.map(centerOf);
      if (endDotRef.current) pts.push(centerOf(endDotRef.current));
      pts.sort((a, b) => a.y - b.y);
      if (pts.length < 2) return;
      const wave = Math.min(24, Math.max(10, w * 0.2));
      let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1];
        const b = pts[i];
        const dy = b.y - a.y;
        const s = i % 2 === 1 ? 1 : -1;
        const c1 = `${(a.x + s * wave).toFixed(1)} ${(a.y + dy * 0.42).toFixed(1)}`;
        const c2 = `${(b.x + s * wave).toFixed(1)} ${(b.y - dy * 0.42).toFixed(1)}`;
        d += ` C ${c1} ${c2} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
      }
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      line.setAttribute("d", d);
      track.setAttribute("d", d);
      const total = line.getTotalLength();
      const N = 72;
      samples = [];
      for (let i = 0; i <= N; i++) {
        const p = line.getPointAtLength((i / N) * total);
        samples.push({ x: p.x, y: p.y });
      }
      const p0 = samples[0];
      if (p0) spark.style.transform = `translate3d(${p0.x}px, ${p0.y}px, 0)`;
    };

    build();
    const ro = new ResizeObserver(build);
    ro.observe(steps);

    let ptr: { x: number; y: number } | null = null;
    let running = false;
    let raf = 0;
    const cur = { p: 0 };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") {
        ptr = null;
        return;
      }
      const r = steps.getBoundingClientRect();
      ptr = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onLeave = () => {
      ptr = null;
    };

    const nearestP = (qx: number, qy: number) => {
      let best = 0;
      let bd = Infinity;
      for (let i = 0; i < samples.length; i++) {
        const s = samples[i];
        const d = (s.x - qx) * (s.x - qx) + (s.y - qy) * (s.y - qy);
        if (d < bd) {
          bd = d;
          best = i;
        }
      }
      return samples.length > 1 ? best / (samples.length - 1) : 0;
    };

    const at = (p: number) => {
      if (samples.length < 2) return { x: 0, y: 0 };
      const f = Math.min(1, Math.max(0, p)) * (samples.length - 1);
      const i = Math.min(samples.length - 2, Math.floor(f));
      const t = f - i;
      const a = samples[i];
      const b = samples[i + 1];
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    };

    /* Без курсора искра привязана к прогрессу скролла через секцию */
    const scrollP = () => {
      const r = steps.getBoundingClientRect();
      const p = (window.innerHeight - r.top) / (window.innerHeight + r.height);
      return Math.min(0.98, Math.max(0.02, p));
    };

    const tick = () => {
      if (!running) return;
      if (samples.length > 1) {
        const target = ptr ? nearestP(ptr.x, ptr.y) : scrollP();
        cur.p += (target - cur.p) * 0.08;
        const pt = at(cur.p);
        spark.style.transform = `translate3d(${pt.x.toFixed(1)}px, ${pt.y.toFixed(1)}px, 0)`;
        if (spark.dataset.on !== "1") spark.dataset.on = "1";
      }
      raf = requestAnimationFrame(tick);
    };

    /* Петля живёт, только пока секция рядом с кадром */
    const start = () => {
      if (running || reduceMq.matches) return;
      running = true;
      tick();
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) start();
        else running = false;
      },
      { rootMargin: "160px 0px" },
    );
    io.observe(steps);

    const onReduceChange = () => {
      if (reduceMq.matches) {
        running = false;
        delete spark.dataset.on;
      } else {
        start();
      }
    };
    reduceMq.addEventListener("change", onReduceChange);

    steps.addEventListener("pointermove", onMove);
    steps.addEventListener("pointerleave", onLeave);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      reduceMq.removeEventListener("change", onReduceChange);
      steps.removeEventListener("pointermove", onMove);
      steps.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <section className={`${shared.section} ${styles.how}`} id="how" ref={howRef}>
      {/*
       * Фон секции: сеть-карта из svg-паттерна (крестики и точки,
       * как миллиметровка картотеки Минмага) и два медленных облачка
       * тумана — эмбиент на экран, герой уже громкий.
       */}
      <div className={styles.howSky} aria-hidden="true">
        <svg className={styles.howNet}>
          <defs>
            <pattern id="mp-how-net" width="56" height="56" patternUnits="userSpaceOnUse">
              <path d="M28 23.5v9M23.5 28h9" stroke="#60a5fa" strokeWidth="1" strokeLinecap="round" opacity="0.16" />
              <circle cx="0" cy="0" r="1.1" fill="#a78bfa" opacity="0.2" />
              <circle cx="56" cy="56" r="1.1" fill="#a78bfa" opacity="0.2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mp-how-net)" />
        </svg>
        <span className={styles.howFogA} />
        <span className={styles.howFogB} />
      </div>
      <div className={`${shared.wrap} ${styles.howWrap}`}>
        <header className={`${shared.secHead} ${shared.rv}`}>
          <h2 className={shared.h2}>
            Как <span className={shared.squiggle}>играть<Squiggle /></span>
          </h2>
          <p className={shared.secSub}>
            От ссылки до развязки — один вечер.{" "}
            <span className={shared.subHand}>Ничего устанавливать не нужно.</span>
          </p>
        </header>
        {/*
         * Вход — одним блоком: пока станции съезжают по отдельным
         * пружинам, они промахиваются мимо измеренного следа.
         * След: путь строится по факту из центров колец (JS выше),
         * стартовый d — растягиваемый запасной вариант для no-JS,
         * штрих дорисовывает себя на скролле (view-таймлайн в CSS).
         */}
        <div className={`${styles.steps} ${shared.rv}`} ref={stepsRef}>
          <svg
            className={styles.trail}
            ref={trailSvgRef}
            viewBox="0 0 100 300"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="mp-trail-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="52%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#e8c87a" />
              </linearGradient>
            </defs>
            <path
              className={styles.trailTrack}
              ref={trailTrackRef}
              pathLength={100}
              fill="none"
              d="M 50 4 C 58 90, 42 200, 50 296"
            />
            <path
              className={styles.trailLine}
              ref={trailLineRef}
              pathLength={100}
              fill="none"
              d="M 50 4 C 58 90, 42 200, 50 296"
            />
          </svg>
          {/* Искра-фонарик: летит по следу за курсором, координаты — JS */}
          <span className={styles.spark} ref={sparkRef} aria-hidden="true" />
          {STEPS.map((s, i) => (
            <article
              className={styles.step}
              key={s.n}
              style={{ "--tint": TINTS[i] } as CSSProperties}
            >
              {/* Станция: кольцо на следе, иконка внутри */}
              <span
                className={styles.stepNode}
                ref={(el) => {
                  nodeRefs.current[i] = el;
                }}
              >
                <span className={styles.stepIcon} aria-hidden="true">{s.icon}</span>
              </span>
              <div className={styles.stepBody}>
                <span className={styles.stepNum}>шаг {s.n}</span>
                <h3 className={styles.stepTitle}>{s.t}</h3>
                <p className={styles.stepText}>{s.d}</p>
              </div>
            </article>
          ))}
          {/* Конечная станция следа — развязка */}
          <div className={styles.trailEnd} aria-hidden="true">
            <span className={styles.trailEndDot} ref={endDotRef} />
            <span className={styles.trailEndLabel}>развязка</span>
          </div>
        </div>
      </div>
    </section>
  );
}
