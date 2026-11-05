"use client";

import { useState } from "react";
import styles from "./faq.module.css";
import shared from "../shared.module.css";
import { useReveal } from "../use-reveal";

const FAQS = [
  {
    q: "Нужно ли что-то скачивать?",
    a: "Нет. Всё работает в браузере: телефон, планшет, ноутбук. Открыли ссылку — и играете. Справок Минмага не потребуется.",
  },
  {
    q: "Как пригласить друзей?",
    a: "Создайте игру и отправьте одну ссылку в любой мессенджер. Друзья открывают её и сразу за вашим столом.",
  },
  {
    q: "Сколько нужно игроков?",
    a: "От 1 до 4 сыщиков. Обсуждать версии может вся компания, хоть шесть человек за одним столом.",
  },
  {
    q: "Сколько длится игра?",
    a: "60–90 минут. Один эпизод, один вечер, одна развязка.",
  },
  {
    q: "На каких устройствах можно играть?",
    a: "Телефон, планшет, компьютер. Нужен современный браузер и интернет для синхронизации с друзьями.",
  },
];

/* 06. FAQ — аккордеон на grid-template-rows */
export default function Faq() {
  const faqRef = useReveal<HTMLElement>();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className={`${shared.section} ${shared.band} ${styles.faqSec}`} id="faq" ref={faqRef}>
      <div className={`${shared.wrap} ${styles.qaWrap}`}>
        <h2 className={`${shared.h2} ${styles.qaH2} ${shared.rv}`}>Вопросы</h2>
        <div className={styles.qa}>
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div className={`${styles.qaItem} ${isOpen ? styles.qaOpen : ""}`} key={f.q}>
                <button
                  className={styles.qaBtn}
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span className={styles.qaQ}>{f.q}</span>
                  <span className={styles.qaPlus} aria-hidden="true">+</span>
                </button>
                <div className={styles.qaAns}>
                  <div className={styles.qaAnsInner}>
                    <p>{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
