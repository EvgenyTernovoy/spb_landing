import type { CSSProperties } from "react";
import shared from "./shared.module.css";

/*
 * Волнистое подчёркивание заголовков — рецепт whimsy №1 (draw-on-scroll):
 * тусклый трек виден сразу, поверх него штрих рисует себя при входе
 * в кадр (view-timeline в CSS; pathLength=100 — dashes в нормированных
 * единицах, как росчерк под городом).
 */
export function Squiggle() {
  const d = "M0 4 Q7.5 0.6 15 4 T30 4 T45 4 T60 4 T75 4 T90 4 T105 4 T120 4";
  return (
    <svg
      className={shared.squiggleSvg}
      viewBox="0 0 120 8"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path className={shared.sqTrack} pathLength={100} d={d} />
      <path className={shared.sqLine} pathLength={100} d={d} />
    </svg>
  );
}

/*
 * Шов между секциями — волна-росчерк через всю ширину (система переходов
 * «дороги»: у каждого шва свой оттенок и фаза). Механика та же, что у
 * сквиггла заголовков: тусклый трек виден сразу, линию рисует view-timeline
 * (pathLength=100). Три пути — ленивые волны разной фазы, hand-placed,
 * не механическая синусоида; viewBox 1440×48 при высоте полосы ~48 —
 * y-масштаб ≈ 1, толщина штриха не плывёт.
 */
const SEAM_PATHS = [
  "M0 26 C170 7 340 7 510 25 C680 43 850 44 1020 27 C1150 13 1330 11 1440 22",
  "M0 33 C150 47 310 46 470 29 C630 12 790 11 950 26 C1110 41 1290 43 1440 24",
  "M0 24 C130 22 230 13 350 15 C490 17 560 39 700 38 C840 37 920 13 1060 14 C1200 15 1300 33 1440 25",
];

export function Seam({
  hue,
  variant = 0,
  flip = false,
  journey = false,
}: {
  hue: string;
  variant?: 0 | 1 | 2;
  flip?: boolean;
  journey?: boolean;
}) {
  const d = SEAM_PATHS[variant];
  return (
    <div
      className={shared.seam}
      style={{ "--wave": hue, ...(flip ? { transform: "scaleX(-1)" } : {}) } as CSSProperties}
      aria-hidden="true"
    >
      <svg className={shared.seamSvg} viewBox="0 0 1440 48" preserveAspectRatio="none">
        {journey && (
          <defs>
            {/* Последний шов несут все три hue — весь путь стекает в финал */}
            <linearGradient id="seamJourney" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1440" y2="0">
              <stop offset="0" stopColor="var(--periwinkle)" />
              <stop offset="0.55" stopColor="var(--pink)" />
              <stop offset="1" stopColor="var(--lavender)" />
            </linearGradient>
          </defs>
        )}
        <path className={shared.seamTrack} pathLength={100} d={d} />
        <path
          className={shared.seamLine}
          pathLength={100}
          d={d}
          {...(journey ? { stroke: "url(#seamJourney)" } : {})}
        />
      </svg>
    </div>
  );
}

/*
 * Бегунок-сквиггл (рецепт whimsy №2, masked-runner) — фланг финального
 * заголовка, как «Register Now!» у whimsy. Волна — белый штрих внутри
 * mask; под ним два прямоугольника: постель с градиентом пути
 * (periwinkle→pink→lavender — цвета дороги, которую несёт последний шов)
 * и световой вэйв, раз в 5 секунд пробегающий по волне. Бегунок стоит
 * на паузе, пока секция не получила .in (useReveal) и пока пользователь
 * не попросил движение; статичный конец — градиентная постель.
 * Путь генерируется, а не рисуется руками (подход whimsy: measured
 * geometry) — Q-волна с чередующимся наклоном.
 */
function runnerPath(width = 120, wave = 10): string {
  let d = "M0,5";
  let up = true;
  for (let x = wave; x <= width; x += wave) {
    d += ` Q${x - wave / 2},${up ? 0 : 10} ${x},5`;
    up = !up;
  }
  return d;
}

const RUNNER_D = runnerPath();

export function Runner({ uid, mirror = false }: { uid: string; mirror?: boolean }) {
  return (
    <span
      className={`${shared.runner}${mirror ? ` ${shared.runnerFlip}` : ""}`}
      aria-hidden="true"
    >
      <svg className={shared.runnerSvg} viewBox="0 0 120 10" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`${uid}-bed`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="120" y2="0">
            <stop offset="0" stopColor="var(--periwinkle)" />
            <stop offset="0.5" stopColor="var(--pink)" />
            <stop offset="1" stopColor="var(--lavender)" />
          </linearGradient>
          <linearGradient id={`${uid}-sweep`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="hsl(0 0% 100% / 0.95)" />
            <stop offset="1" stopColor="hsl(0 0% 100% / 0)" />
          </linearGradient>
          <mask id={`${uid}-mask`}>
            <path d={RUNNER_D} stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" />
          </mask>
        </defs>
        <g mask={`url(#${uid}-mask)`}>
          <rect x="-12" width="144" height="100%" fill={`url(#${uid}-bed)`} />
          <rect
            className={shared.runnerSweep}
            x="-12"
            width="60"
            height="100%"
            rx="10"
            fill={`url(#${uid}-sweep)`}
          />
        </g>
      </svg>
    </span>
  );
}

/* Сложность дела: закрашенные и пустые точки */
export function Dots({ level }: { level: number }) {
  return (
    <span className={shared.dots} aria-hidden="true">
      {"●".repeat(level)}
      <i>{"○".repeat(4 - level)}</i>
    </span>
  );
}
