"use client";

import { Runner } from "../decor";
import shared from "../shared.module.css";
import { useReveal } from "../use-reveal";
import { useWishlist } from "../wishlist/WishlistModal";
import styles from "./finale.module.css";

/*
 * 07. ФИНАЛЬНЫЙ CTA — по образцу «Register Now!» whimsy: капитан выглядает
 * из-за заголовка (маскот), фланги-бегунки с пробегающим светом, золотое
 * «ждёт» — главная вещь страницы. Просто: звёзды, капитан, заголовок —
 * без декоративных огней.
 */
export default function Finale() {
  const playRef = useReveal<HTMLElement>();
  const openWishlist = useWishlist();

  return (
    <section className={styles.play} id="play" ref={playRef}>
      {/* В финале звёзды чуть выше и левее — .starsLow в shared */}
      <div className={`${shared.stars} ${shared.starsLow}`} aria-hidden="true" />
      <div className={`${styles.playInner} ${shared.rv}`}>
        {/*
         * Капитан полиции из игры (с трубкой: «распоряжение читал?»):
         * прозрачная вырезка — тёмный мундир сам растворяется в ночи,
         * скримы и затемнение не нужны. Заголовок накладывается сверху,
         * пряча жёсткий срез пояса за буквами.
         */}
        <div className={styles.mascot} aria-hidden="true">
          <img className={styles.mascotImg} src="/assets/captain.png" alt="" loading="lazy" />
        </div>
        <h2 className={styles.playH}>
          <Runner uid="finL" />
          <span className={styles.playHText}>
            Город <span className={styles.playHGold}>ждёт</span>
          </span>
          <Runner uid="finR" mirror />
        </h2>
        <p className={styles.playSub}>соберите своих — дело №1 уже почти на столе</p>
        {/*
         * Точка интеграции: пока игра собирается, финал ведёт в вишлист —
         * модалка «Распоряжение Минмага» со скидкой −50%; при подключении
         * бэкенда здесь будет запуск игры.
         */}
        <button className={`${shared.cta} ${styles.ctaPlay}`} type="button" onClick={openWishlist}>
          Купить
        </button>
      </div>
      <footer className={styles.footer}>
        <span className={styles.footerBrand}>Мистический Петербург</span>
        <span className={styles.footerBye}>до встречи в тумане</span>
        <span>59.93° N, 30.33° E · © 2026</span>
      </footer>
    </section>
  );
}
