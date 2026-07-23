import { useEffect, useRef } from "react";

// Ambient flow-field particle drift for the hero background.
// Cheap canvas 2D — no WebGL, no noise library: the "field" is a sum of a
// few sine/cosine terms sampled at each particle's position, which is fast
// and produces the same organic swirl a real curl-noise field would.
const CREAM = "240,237,230";
const GOLD = "200,149,106";
const GOLD_SHARE = 0.08;

function fieldAngle(x, y, t) {
  return (
    Math.sin(x * 0.0021 + t * 0.00012) * 2.4 +
    Math.cos(y * 0.0026 - t * 0.00009) * 2.1 +
    Math.sin((x + y) * 0.0014 + t * 0.00015) * 1.6
  );
}

function makeParticle(w, h) {
  const gold = Math.random() < GOLD_SHARE;
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    speed: (gold ? 0.35 : 0.22) + Math.random() * 0.35,
    r: gold ? 1.4 + Math.random() * 0.9 : 0.7 + Math.random() * 1.1,
    alpha: gold ? 0.35 + Math.random() * 0.35 : 0.12 + Math.random() * 0.28,
    gold,
  };
}

export default function HeroField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let particles = [];
    let raf = null;
    let last = 0;
    let visible = true;

    const particleCount = (w, h) => Math.max(50, Math.min(200, Math.floor((w * h) / 9000)));

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = Array.from({ length: particleCount(width, height) }, () => makeParticle(width, height));
      if (reduceMotion) drawStatic();
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        ctx.fillStyle = `rgba(${p.gold ? GOLD : CREAM},${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const frame = (ts) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      if (last === 0) last = ts;
      const dt = Math.min(ts - last, 50);
      last = ts;

      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        const angle = fieldAngle(p.x, p.y, ts);
        p.x += Math.cos(angle) * p.speed * (dt / 16);
        p.y += Math.sin(angle) * p.speed * (dt / 16);

        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        ctx.fillStyle = `rgba(${p.gold ? GOLD : CREAM},${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const onVisibility = () => { visible = document.visibilityState === "visible"; };

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    if (!reduceMotion) raf = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="hero-field" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
