import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  Sofia_Sans,
  Neucha,
  Marck_Script,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";

/*
 * Шрифтовая система по образцу whimsy.joshwcomeau.com:
 * Wotfard → Sofia Sans (дружелюбный гротеск, кириллица),
 * Gochi Hand/Sriracha → Neucha (рукописные пометки),
 * Great Vibes → Marck Script (каллиграфические акценты),
 * Cartograph CF → JetBrains Mono (моно).
 */

const text = Sofia_Sans({
  subsets: ["latin", "cyrillic"],
  variable: "--f-text",
  display: "swap",
});

const hand = Neucha({
  weight: "400",
  subsets: ["latin", "cyrillic"],
  variable: "--f-hand",
  display: "swap",
});

const script = Marck_Script({
  weight: "400",
  subsets: ["latin", "cyrillic"],
  variable: "--f-script",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--f-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Мистический Петербург — кооперативный детектив в браузере",
  description:
    "Магия легальна с 1991 года. Соберите 1–4 сыщиков, откройте ссылку — и ночной Петербург с делами Минмага уже ждёт. 60–90 минут, одна тайна на всех.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ru">
      <body
        className={`${text.variable} ${hand.variable} ${script.variable} ${mono.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
