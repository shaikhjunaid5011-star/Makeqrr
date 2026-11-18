"use client";

import React, { useEffect, useRef } from "react";
import { useTheme } from "../../lib/theme-context";

interface RippleGridProps {
  className?: string;
  gap?: number;
}

export function RippleGrid({ className = "", gap: customGap }: RippleGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();

  // Keep theme in a ref so the requestAnimationFrame loop can access it without re-subscribing
  const isDarkRef = useRef(resolvedTheme === "dark");
  useEffect(() => {
    isDarkRef.current = resolvedTheme === "dark";
  }, [resolvedTheme]);

  useEffect(() => {
    const cv = canvasRef.current;
    const container = containerRef.current;
    if (!cv || !container) return;

    const ctx = cv.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Listen on the parent hero section so pointer tracking covers all hero elements
    const heroEl = container.parentElement || container;

    // Check for prefers-reduced-motion
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let prefersReducedMotion = motionQuery.matches;
    const onMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
    };
    motionQuery.addEventListener("change", onMotionChange);

    let w = 0;
    let h = 0;
    let raf = 0;
    let t = 0;
    let isVisible = true;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const mouse = {
      x: -9999,
      y: -9999,
      targetX: -9999,
      targetY: -9999,
      on: false,
      intensity: 0, // Smooth fade-in/fade-out
      lastMoveTime: 0
    };

    let cols = 0;
    let rows = 0;
    let ox = 0;
    let oy = 0;
    let gap = customGap || 26;

    let staticPath: Path2D | null = null;

    function buildStaticPath() {
      staticPath = new Path2D();
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = ox + i * gap;
          const y = oy + j * gap;
          staticPath.moveTo(x + 1.1, y);
          staticPath.arc(x, y, 1.1, 0, Math.PI * 2);
        }
      }
    }

    function drawStaticGrid() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      const isDark = isDarkRef.current;
      ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.10)" : "rgba(0, 0, 0, 0.08)";
      if (staticPath) {
        ctx.fill(staticPath);
      }
    }

    function ensureLoopRunning() {
      if (!isVisible || prefersReducedMotion || raf !== 0 || document.hidden) return;
      raf = requestAnimationFrame(frame);
    }

    function resize() {
      if (!container || !cv || !ctx) return;
      const rect = container.getBoundingClientRect();

      w = rect.width;
      h = rect.height;

      // Adapt dot density to screen size: tighter on mobile, spacious on large screens
      gap = customGap || (w < 480 ? 22 : w < 768 ? 24 : 26);

      cv.width = Math.floor(w * DPR);
      cv.height = Math.floor(h * DPR);
      cv.style.width = `${w}px`;
      cv.style.height = `${h}px`;

      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      cols = Math.floor(w / gap);
      rows = Math.floor(h / gap);

      // Perfectly center the grid
      ox = (w - (cols - 1) * gap) / 2;
      oy = (h - (rows - 1) * gap) / 2;

      buildStaticPath();
      drawStaticGrid();
    }

    function frame() {
      if (!isVisible || !ctx || document.hidden) {
        raf = 0;
        return;
      }

      if (prefersReducedMotion) {
        drawStaticGrid();
        raf = 0;
        return;
      }

      const now = performance.now();
      const timeSinceMove = now - mouse.lastMoveTime;

      // Smooth mouse interpolation
      if (mouse.on) {
        mouse.x += (mouse.targetX - mouse.x) * 0.18;
        mouse.y += (mouse.targetY - mouse.y) * 0.18;

        if (timeSinceMove < 350) {
          mouse.intensity += (1 - mouse.intensity) * 0.14;
        } else {
          mouse.intensity += (0 - mouse.intensity) * 0.06;
        }
      } else {
        mouse.intensity += (0 - mouse.intensity) * 0.08;
      }

      // Performance Optimization: If idle with negligible intensity, draw static dots once and SLEEP (0% CPU)
      if (!mouse.on && mouse.intensity <= 0.001) {
        mouse.intensity = 0;
        drawStaticGrid();
        raf = 0;
        return;
      }

      t += 0.03;
      ctx.clearRect(0, 0, w, h);

      const isDark = isDarkRef.current;
      const rippleRadius = w < 640 ? 150 : 185;
      const rippleRadiusSq = rippleRadius * rippleRadius;

      // 1. Render all dots: only calculate waves for dots in proximity of pointer
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = ox + i * gap;
          const y = oy + j * gap;

          let ripple = 0;

          if (mouse.intensity > 0.005) {
            const dx = x - mouse.x;
            const dy = y - mouse.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < rippleRadiusSq) {
              const distance = Math.sqrt(distSq);
              const wave = Math.sin(distance * 0.065 - t * 3.4);
              const wavePeak = Math.max(0, wave);
              const falloff = 1 - distance / rippleRadius;
              ripple = Math.pow(falloff, 1.2) * (0.2 + 0.8 * wavePeak) * mouse.intensity;
            }
          }

          const radius = 1.1 + ripple * 1.8;

          if (isDark) {
            if (ripple > 0.01) {
              ctx.fillStyle = `rgba(255, 110, 48, ${0.10 + ripple * 0.75})`;
            } else {
              ctx.fillStyle = 'rgba(255, 255, 255, 0.10)';
            }
          } else {
            if (ripple > 0.01) {
              ctx.fillStyle = `rgba(230, 69, 0, ${0.08 + ripple * 0.72})`;
            } else {
              ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
            }
          }

          ctx.beginPath();
          ctx.arc(x, y, Math.max(0.6, radius), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(frame);
    }

    function onMove(e: PointerEvent) {
      if (!cv) return;
      const rect = cv.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.lastMoveTime = performance.now();

      if (!mouse.on) {
        mouse.x = mouse.targetX;
        mouse.y = mouse.targetY;
      }
      mouse.on = true;
      ensureLoopRunning();
    }

    function onLeave() {
      mouse.on = false;
      mouse.targetX = -9999;
      mouse.targetY = -9999;
    }

    function onTouchMove(e: TouchEvent) {
      if (!cv) return;
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = cv.getBoundingClientRect();
        mouse.targetX = touch.clientX - rect.left;
        mouse.targetY = touch.clientY - rect.top;
        mouse.lastMoveTime = performance.now();
        if (!mouse.on) {
          mouse.x = mouse.targetX;
          mouse.y = mouse.targetY;
        }
        mouse.on = true;
        ensureLoopRunning();
      }
    }

    function onTouchEnd() {
      mouse.on = false;
      mouse.targetX = -9999;
      mouse.targetY = -9999;
    }

    // Initialize dimensions and draw initial static grid
    resize();

    // Responsive observers & listeners
    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    resizeObserver.observe(container);

    // IntersectionObserver to pause loop when hero is offscreen
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !raf && !prefersReducedMotion) {
          raf = requestAnimationFrame(frame);
        } else if (!isVisible && raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    const onVisibilityChange = () => {
      if (document.hidden) {
        if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      } else if (isVisible && !raf && !prefersReducedMotion) {
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    window.addEventListener("resize", resize, { passive: true });

    // Pointer events on hero container
    heroEl.addEventListener("pointermove", onMove, { passive: true });
    heroEl.addEventListener("pointerenter", onMove, { passive: true });
    heroEl.addEventListener("pointerdown", onMove, { passive: true });
    heroEl.addEventListener("pointerleave", onLeave, { passive: true });
    heroEl.addEventListener("pointerup", onLeave, { passive: true });
    heroEl.addEventListener("touchmove", onTouchMove, { passive: true });
    heroEl.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      motionQuery.removeEventListener("change", onMotionChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("resize", resize);
      heroEl.removeEventListener("pointermove", onMove);
      heroEl.removeEventListener("pointerenter", onMove);
      heroEl.removeEventListener("pointerdown", onMove);
      heroEl.removeEventListener("pointerleave", onLeave);
      heroEl.removeEventListener("pointerup", onLeave);
      heroEl.removeEventListener("touchmove", onTouchMove);
      heroEl.removeEventListener("touchend", onTouchEnd);
    };
  }, [customGap]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden -z-10 ${className}`}
      style={{
        maskImage: "linear-gradient(to bottom, black 75%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, black 75%, transparent 100%)"
      }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block pointer-events-none"
      />
    </div>
  );
}

export default RippleGrid;
