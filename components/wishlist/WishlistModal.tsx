"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import styles from "./wishlist.module.css";

/*
 * Модалка вишлиста: пока игра собирается, финальный CTA открывает не
 * запуск, а «Распоряжение Минмага» — лист дела на ночном тумане со
 * штампом «−50%» (см. wishlist.module.css за хореографией).
 *
 * Провайдер держит нативный <dialog>: showModal()/close() дают фокус-трап,
 * Escape и top layer бесплатно; JS только зовёт эти два метода и снимок
 * фокуса, состоянием владеет атрибут [open] (подход whimsy §5.3).
 * Ссылки триггеров раскиданы по дереву через контекст: useWishlist().
 */

const WishlistContext = createContext<(() => void) | null>(null);

export function useWishlist() {
  const open = useContext(WishlistContext);
  if (!open) {
    throw new Error("useWishlist нужно звать внутри <WishlistProvider>");
  }
  return open;
}

/* Волна росчерка — та же геометрия, что у Squiggle в decor.tsx */
const SQ_D = "M0 4 Q7.5 0.6 15 4 T30 4 T45 4 T60 4 T75 4 T90 4 T105 4 T120 4";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const [sent, setSent] = useState(false);
  const headingId = useId();
  const bodyId = useId();
  const emailId = useId();

  const openWishlist = useCallback(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    restoreFocus.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    dlg.showModal();
    /* ночь под туманом не скроллится. Фокус намеренно не переводим
     * на поле: на мобильных автофокус сразу поднимает клавиатуру
     * и заслоняет лист; showModal() сам фокусирует <dialog>, поле
     * достижимо табом */
    document.documentElement.style.overflow = "hidden";
  }, []);

  const closeWishlist = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  /* close (и Esc, и кодом): вернуть скролл и фокус тому, кто открыл */
  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    const onClose = () => {
      document.documentElement.style.overflow = "";
      restoreFocus.current?.focus();
      restoreFocus.current = null;
    };
    dlg.addEventListener("close", onClose);
    return () => dlg.removeEventListener("close", onClose);
  }, []);

  return (
    <WishlistContext.Provider value={openWishlist}>
      {children}
      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby={headingId}
        aria-describedby={bodyId}
        onClick={(e) => {
          /* клик мимо листа (по подложке) закрывает */
          if (e.target === e.currentTarget) closeWishlist();
        }}
      >
        <div className={styles.card}>
          <span className={styles.tape} aria-hidden="true" />
          <button
            type="button"
            className={styles.close}
            aria-label="Закрыть"
            onClick={closeWishlist}
          >
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M2 2 L12 12 M12 2 L2 12" />
            </svg>
          </button>
          <div className={styles.cardIn}>
            <p className={styles.eyebrow}>
              Министерство магии · распоряжение № 50/1991
            </p>
            <div className={styles.head}>
              <div className={styles.headText}>
                <h2 id={headingId} className={styles.h}>
                  Дело{" "}
                  <span className={styles.hSq}>
                    в производстве
                    <svg
                      className={styles.hSqSvg}
                      viewBox="0 0 120 8"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <path className={styles.sqTrackInk} pathLength={100} d={SQ_D} />
                      <path className={styles.sqLineInk} pathLength={100} d={SQ_D} />
                    </svg>
                  </span>
                </h2>
                <p className={styles.hand}>а скидка уже подписана…</p>
              </div>
              <div className={styles.stampWrap}>
                <div className={styles.stamp}>
                  <span className={styles.stampTop}>скидка вишлиста</span>
                  <span className={styles.stampNum}>−50%</span>
                  <span className={styles.stampSub}>при релизе</span>
                </div>
                <span
                  className={`${styles.spark} ${styles.sparkGold}`}
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M12 0C13 7 17 11 24 12C17 13 13 17 12 24C11 17 7 13 0 12C7 11 11 7 12 0Z" />
                  </svg>
                </span>
                <span
                  className={`${styles.spark} ${styles.sparkBlue}`}
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M12 0C13 7 17 11 24 12C17 13 13 17 12 24C11 17 7 13 0 12C7 11 11 7 12 0Z" />
                  </svg>
                </span>
              </div>
            </div>
            <p id={bodyId} className={styles.body}>
              Игра ещё собирается: сценарий дела №1 дописан, панорамы
              проявляются, домовые дали первые показания. Запишитесь
              в вишлист — и, когда город откроет двери, дело №1 достанется
              вам <b>за полцены</b>.
            </p>
            <div className={styles.cut} aria-hidden="true">
              <span className={styles.scissors}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <circle cx="6" cy="6" r="2.7" />
                  <circle cx="6" cy="18" r="2.7" />
                  <path d="M8.4 7.7 20 16.6" />
                  <path d="M8.4 16.3 20 7.4" />
                </svg>
              </span>
            </div>
            <div className={styles.ticket}>
              {/*
               * Заявка-корешок: поле «на бланке» — почта, куда прийти
               * скидке. Точка интеграции: сабмит уйдёт на бэкенд
               * (подписка/промокод), пока — оптимистичное «Принято».
               */}
              {sent ? (
                <div
                  className={styles.done}
                  ref={doneRef}
                  role="status"
                  tabIndex={-1}
                >
                  <span className={styles.doneStamp} aria-hidden="true">
                    принято
                  </span>
                  <p className={styles.doneNote}>
                    скидка −50% закреплена за вами — ждите письмо к релизу
                  </p>
                </div>
              ) : (
                <form
                  className={styles.form}
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSent(true);
                    requestAnimationFrame(() => doneRef.current?.focus());
                  }}
                >
                  <label className={styles.label} htmlFor={emailId}>
                    Куда прислать −50%?
                  </label>
                  <div className={styles.formRow}>
                    <input
                      id={emailId}
                      className={styles.input}
                      type="email"
                      name="email"
                      required
                      autoComplete="email"
                      inputMode="email"
                      placeholder="ваша@почта.ру"
                    />
                    <button type="submit" className={styles.wish}>
                      Получить
                    </button>
                  </div>
                </form>
              )}
              <div className={styles.ticketFoot}>
                <p className={styles.meta}>
                  промокод придёт письмом к релизу · скидка действует 7 дней
                </p>
                <button type="button" className={styles.later} onClick={closeWishlist}>
                  Позже
                </button>
              </div>
            </div>
          </div>
        </div>
      </dialog>
    </WishlistContext.Provider>
  );
}
