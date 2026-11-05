import { useEffect, useRef } from "react";

/*
 * Появление секции: IntersectionObserver ставит глобальный класс in,
 * дальше всеми .rv внутри секции управляет CSS (shared.module.css).
 * Одноразовое — наблюдатель отключается после первого входа.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.classList.add("in");
          io.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}
