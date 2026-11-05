import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import * as THREE from "three";
import styles from "./pano.module.css";

/*
 * Интерактивная 360°-панорама — как PanoramaViewer игры
 * (packages/client): эквидистантная текстора натянута на сферу,
 * камера в центре, drag вращает обзор (lon/lat), с инерцией после
 * отпускания. Метки улик — DOM-кнопки, проецируемые из 3D каждый кадр
 * (аналог @react-three/drei Html в игре). Рендер по требованию:
 * кадр рисуется только когда камера движется.
 */

export type PanoSpot = {
  id: string;
  /* Позиция на сфере, градусы */
  yaw: number;
  pitch: number;
  /* Fallback (без WebGL): позиция на плоском кадре, % */
  left: number;
  top: number;
  mystic?: boolean;
  name: string;
};

type Props = {
  src: string;
  spots: PanoSpot[];
  seen: number[];
  onSpotClick: (i: number) => void;
  onDragStart: () => void;
};

const R = 500;
const FOV = 62;
const MAX_PITCH = 55;

export default function Pano360({ src, spots, seen, onSpotClick, onDragStart }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      setFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.className = styles.panoCanvas;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 1100);

    const geometry = new THREE.SphereGeometry(R, 64, 40);
    geometry.scale(-1, 1, 1); // смотрим изнутри сферы
    const material = new THREE.MeshBasicMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const loader = new THREE.TextureLoader();
    loader.load(src, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      material.map = tex;
      material.needsUpdate = true;
      dirty = true;
    });

    /* Камера: lon/lat в градусах, старт — рабочий стол подрядчика */
    let lon = -70;
    let lat = -18;
    let vlon = 0;
    let vlat = 0;
    let dragging = false;
    let dirty = true;
    let raf = 0;

    const reduce =
      typeof matchMedia === "function" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;

    const target = new THREE.Vector3();
    const applyCamera = () => {
      const phi = THREE.MathUtils.degToRad(90 - lat);
      const theta = THREE.MathUtils.degToRad(lon);
      target.set(
        R * Math.sin(phi) * Math.cos(theta),
        R * Math.cos(phi),
        R * Math.sin(phi) * Math.sin(theta),
      );
      camera.lookAt(target);
    };

    /* Проекция меток: кнопка ставится в экранную точку направления (yaw, pitch) */
    const v = new THREE.Vector3();
    const placeButtons = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      spots.forEach((s, i) => {
        const btn = btnRefs.current[i];
        if (!btn) return;
        const phi = THREE.MathUtils.degToRad(90 - s.pitch);
        const theta = THREE.MathUtils.degToRad(s.yaw);
        v.set(
          R * Math.sin(phi) * Math.cos(theta),
          R * Math.cos(phi),
          R * Math.sin(phi) * Math.sin(theta),
        );
        v.project(camera);
        const inFront = v.z < 1;
        if (!inFront || Math.abs(v.x) > 1.15 || Math.abs(v.y) > 1.15) {
          btn.style.visibility = "hidden";
          return;
        }
        btn.style.visibility = "visible";
        btn.style.transform = `translate(${((v.x * 0.5 + 0.5) * w).toFixed(1)}px, ${((-v.y * 0.5 + 0.5) * h).toFixed(1)}px) translate(-50%, -50%)`;
      });
    };

    const frame = () => {
      raf = 0;
      if (!dragging && (Math.abs(vlon) > 0.005 || Math.abs(vlat) > 0.005)) {
        lon += vlon;
        lat += vlat;
        vlon *= 0.93;
        vlat *= 0.93;
        lat = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, lat));
        dirty = true;
      }
      if (!dirty) return;
      dirty = false;
      applyCamera();
      renderer.render(scene, camera);
      placeButtons();
    };
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    /* Размер под контейнер (телефон меняет ширину на брейкпоинтах) */
    const resize = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      dirty = true;
      wake();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    /* Вращение перетаскиванием — как обзор в игре */
    const canvas = renderer.domElement;
    let px = 0;
    let py = 0;
    const onDown = (e: PointerEvent) => {
      dragging = true;
      vlon = vlat = 0;
      px = e.clientX;
      py = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - px;
      const dy = e.clientY - py;
      px = e.clientX;
      py = e.clientY;
      const k = 0.12;
      lon -= dx * k;
      lat += dy * k;
      lat = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, lat));
      vlon = -dx * k;
      vlat = dy * k;
      dirty = true;
      onDragStart();
      wake();
    };
    const onUp = () => {
      dragging = false;
      if (reduce) vlon = vlat = 0;
      wake();
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      geometry.dispose();
      material.dispose();
      material.map?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  /* Fallback без WebGL: плоский кадр, метки на местах, без вращения */
  if (failed) {
    return (
      <div className={styles.panoFallback}>
        <img src={src} alt="" draggable={false} />
        {spots.map((s, i) => (
          <button
            key={s.id}
            ref={(el) => { btnRefs.current[i] = el; }}
            className={`${styles.hotspot} ${s.mystic ? styles.hotMystic : ""} ${seen.includes(i) ? styles.hotDone : ""}`}
            style={{ left: `${s.left}%`, top: `${s.top}%`, "--d": `${i * 0.55}s` } as CSSProperties}
            aria-label={s.mystic ? `${s.name} — виден только ведьме` : `Улика: ${s.name}`}
            onClick={() => onSpotClick(i)}
          >
            <span className={styles.hotRing} aria-hidden="true" />
            <span className={styles.hotDot} aria-hidden="true" />
            {s.mystic && <span className={styles.hotSpark} aria-hidden="true">✨</span>}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.pano360} ref={hostRef}>
      {spots.map((s, i) => (
        <button
          key={s.id}
          ref={(el) => { btnRefs.current[i] = el; }}
          className={`${styles.hotspot} ${s.mystic ? styles.hotMystic : ""} ${seen.includes(i) ? styles.hotDone : ""}`}
          style={{ "--d": `${i * 0.55}s` } as CSSProperties}
          aria-label={s.mystic ? `${s.name} — виден только ведьме` : `Улика: ${s.name}`}
          onClick={() => onSpotClick(i)}
        >
          <span className={styles.hotRing} aria-hidden="true" />
          <span className={styles.hotDot} aria-hidden="true" />
          {s.mystic && <span className={styles.hotSpark} aria-hidden="true">✨</span>}
        </button>
      ))}
    </div>
  );
}
