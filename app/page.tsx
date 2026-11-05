/*
 * Лендинг «Мистический Петербург» — версия «Дружелюбный нуар».
 * Земля — токены игры «Загадочный СПБ» (ночь #0f172a, синий, магия,
 * золото куполов, цвета классов), жизнь — подходы whimsy.joshwcomeau.com
 * (пилюли, пружины, рукописные пометки, звёзды и искры). Лор: магия
 * легальна с 1991 года, Минмаг, профсоюз водяных — тон Плоского мира.
 * Изображения — реальные ассеты игры из misterious-spb/packages/client/
 * public/assets (см. public/assets).
 *
 * Страница — только композиция секций; вёрстка и логика каждой секции
 * живут в components/<секция>/. Порядок импортов задаёт порядок CSS
 * в бандле — shared первым, дальше секции по порядку страницы.
 */
import shared from "@/components/shared.module.css";
import { FinaleSeam, Seam } from "@/components/decor";
import TopBar from "@/components/top-bar/TopBar";
import Hero from "@/components/hero/Hero";
import LoreLine from "@/components/lore/LoreLine";
import HowPlay from "@/components/how-play/HowPlay";
import Case from "@/components/case/Case";
import Demo from "@/components/demo/Demo";
import Chars from "@/components/chars/Chars";
import Audience from "@/components/audience/Audience";
import Faq from "@/components/faq/Faq";
import Finale from "@/components/finale/Finale";
import { WishlistProvider } from "@/components/wishlist/WishlistModal";

export default function LandingPage() {
  return (
    <main className={shared.page}>
      {/* Провайдер вишлиста: нативный <dialog> со скидкой −50% лежит
          в конце дерева; триггеры зовут useWishlist() из любой секции */}
      <WishlistProvider>
      {/* 00. ШАПКА */}
      <TopBar />
      {/* 01. ГЕРОЙ: набережная Мойки, звёзды, частицы */}
      <Hero />
      {/* Строка лора + радужный разделитель: дань whimsy */}
      <LoreLine />
      {/* 02. КАК ИГРАТЬ: станции на живом следе */}
      <HowPlay />
      {/* Швы-волны: дорога ведёт читателя, у каждого шва свой оттенок и фаза */}
      <Seam hue="var(--periwinkle)" variant={0} />
      {/* 03. СЦЕНАРИЙ: что внутри дела №1 — карта, улики, допросы */}
      <Case />
      <Seam hue="var(--pink)" variant={1} flip />
      {/* 04. ДЕМО: интерактивная панорама в горизонтальном телефоне */}
      <Demo />
      <Seam hue="var(--lavender)" variant={0} />
      {/* 05. СЫЩИКИ: полароиды из досье, приклеены к ночи */}
      <Chars />
      <Seam hue="var(--periwinkle)" variant={2} flip />
      {/* 06. ДЛЯ КОГО: четыре визитки — кому открывать дело */}
      <Audience />
      <Seam hue="var(--pink)" variant={0} />
      {/* 07. FAQ */}
      <Faq />
      {/* Последний шов крупнее остальных — дорога собралась в финал
          (по мотивам BigDivider whimsy, в нашем journey-градиенте) */}
      <FinaleSeam />
      {/* 08. ФИНАЛЬНЫЙ CTA */}
      <Finale />
      </WishlistProvider>
    </main>
  );
}
