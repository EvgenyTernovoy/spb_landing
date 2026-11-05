import styles from "./lore.module.css";

/* Строка лора + радужный разделитель: дань whimsy */
export default function LoreLine() {
  return (
    <div className={styles.dividerWrap}>
      <p className={styles.lore} aria-hidden="true">магия легальна с 1991 года</p>
      <div className={styles.divider} aria-hidden="true" />
    </div>
  );
}
