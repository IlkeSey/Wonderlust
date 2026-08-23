"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { sliceColor } from "@/lib/colors";
import type { Podcast } from "@/types/podcast";

const SIZE = 440; // logical canvas size in px
const SPIN_MS = 3000;
const MIN_TURNS = 5;
const TAU = Math.PI * 2;
const POINTER_ANGLE = -Math.PI / 2; // pointer sits at the top of the wheel

type Props = {
  podcasts: Podcast[];
  onResult: (podcast: Podcast) => void;
  onSpinStart?: () => void;
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const normalize = (angle: number) => ((angle % TAU) + TAU) % TAU;

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export default function SpinningWheel({ podcasts, onResult, onSpinStart }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotationRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const [spinning, setSpinning] = useState(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
    if (canvas.width !== SIZE * dpr) {
      canvas.width = SIZE * dpr;
      canvas.height = SIZE * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, SIZE, SIZE);

    const cx = SIZE / 2;
    const cy = SIZE / 2;
    const radius = SIZE / 2 - 14;
    const count = podcasts.length;

    // Outer ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 8, 0, TAU);
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fill();

    if (count === 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, TAU);
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "600 16px system-ui, -apple-system, Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Add podcasts in /admin", cx, cy);
      drawPointer(ctx, cx, cy, radius);
      return;
    }

    const arc = TAU / count;
    const rotation = rotationRef.current;

    for (let i = 0; i < count; i += 1) {
      const start = rotation + i * arc;
      const end = start + arc;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = sliceColor(i);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.stroke();

      // Slice label, laid along the radius
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + arc / 2);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";
      const fontSize = count > 12 ? 11 : count > 8 ? 13 : 15;
      ctx.font = `600 ${fontSize}px system-ui, -apple-system, Segoe UI, sans-serif`;
      ctx.shadowColor = "rgba(0,0,0,0.45)";
      ctx.shadowBlur = 4;
      const maxChars = count > 12 ? 14 : count > 8 ? 18 : 22;
      ctx.fillText(truncate(podcasts[i].title, maxChars), radius - 18, 0);
      ctx.restore();
    }

    // Hub
    ctx.beginPath();
    ctx.arc(cx, cy, 34, 0, TAU);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.fillStyle = "#6d28d9";
    ctx.font = "700 13px system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SPIN", cx, cy);

    drawPointer(ctx, cx, cy, radius);
  }, [podcasts]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Redraw on DPR / resize changes so the canvas stays crisp.
  useEffect(() => {
    const onResize = () => draw();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [draw]);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const spin = useCallback(() => {
    const count = podcasts.length;
    if (spinning || count === 0) return;

    setSpinning(true);
    onSpinStart?.();

    const arc = TAU / count;
    const winner = Math.floor(Math.random() * count);
    // Land anywhere inside the winning slice (but safely away from its edges).
    const jitter = (Math.random() - 0.5) * arc * 0.7;
    const winnerCenter = winner * arc + arc / 2 + jitter;

    const from = rotationRef.current;
    let target = POINTER_ANGLE - winnerCenter;
    while (target < from + MIN_TURNS * TAU) target += TAU;

    const start = performance.now();

    const step = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / SPIN_MS, 1);
      rotationRef.current = from + (target - from) * easeOutCubic(t);
      draw();

      if (t < 1) {
        frameRef.current = requestAnimationFrame(step);
        return;
      }

      frameRef.current = null;
      rotationRef.current = normalize(target);
      draw();
      setSpinning(false);
      onResult(podcasts[winner]);
    };

    frameRef.current = requestAnimationFrame(step);
  }, [draw, onResult, onSpinStart, podcasts, spinning]);

  const disabled = spinning || podcasts.length === 0;

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="w-full max-w-[440px]">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`Wheel with ${podcasts.length} podcasts`}
          onClick={spin}
          style={{ width: "100%", height: "auto", aspectRatio: "1 / 1" }}
          className={`drop-shadow-2xl ${disabled ? "cursor-default" : "cursor-pointer"}`}
        />
      </div>

      <button
        type="button"
        onClick={spin}
        disabled={disabled}
        className="btn-primary w-full max-w-xs px-8 py-3 text-base"
      >
        {spinning ? "Spinning…" : podcasts.length === 0 ? "No podcasts yet" : "Spin the wheel"}
      </button>
    </div>
  );
}

function drawPointer(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number
) {
  const tipY = cy - radius + 4;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx, tipY);
  ctx.lineTo(cx - 15, tipY - 26);
  ctx.lineTo(cx + 15, tipY - 26);
  ctx.closePath();
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0,0,0,0.4)";
  ctx.shadowBlur = 6;
  ctx.fill();
  ctx.restore();
}
