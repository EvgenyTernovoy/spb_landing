# Слоты под изображения

Лендинг один — «Дружелюбный нуар». Все слоты **закрыты реальными ассетами
игры** (источник: `misterious-spb/packages/client/public/assets`, копия в
`public/assets`):

| Слот | Файл | Источник | Пропорция |
|---|---|---|---|
| Город в герое | `public/assets/hero.jpg` | `slides/hero-1.jpg` — набережная Мойки вечером, тёплые окна | 16:9, cover, сверху лёгкое затемнение |
| Панорама | `public/assets/pano.jpg` | `panoramas/L01.webp` — разгромленная квартира подрядчика | 5:2 → кроп 3:1, cover |
| Портреты x4 | `public/assets/{alina,boris,elena,dmitrii}.jpg` | `characters/*_thumb.png` | 1:1 → кроп 4:5, cover |
| Улики демо x3 | `public/assets/items/{E01,E16,E17}.webp` | карточки улик дела №1 | квадрат, cover |

Классы слотов живут в `components/shared.module.css` (`slot`, `slotPaper`,
`slotPortrait`); герой использует `slotCity` из `components/hero/hero.module.css`.

Шаблон подмены (если слот снова станет заглушкой):

```tsx
<div className={`${shared.slot} ${shared.slotPortrait}`}>
  <img src="..." alt="..." style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
</div>
```

## Общие требования

- Город в герое: ориентир кадра 21:9 и шире, от 2400 px по ширине, cover.
- Панорама места происшествия: полоса 3:1 и шире, от 2400 px, три склейки.
- Портреты: 3:4, от 900 px по высоте, персонаж по центру, лицо в верхней
  трети (ниже идёт текст карточки).
- Обработка под версию обязательна: «натуральный» сток не подходит.
