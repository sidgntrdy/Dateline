"use client";

import { useState, useCallback, useRef } from "react";

const PHONE_NUMBER = "+1 (800) 911-5683";

const HEART_D =
  "M256 448l-30.164-27.211C118.718 322.927 48 258.373 48 180.539 48 117.428 97.918 66 160.243 66c36.196 0 70.266 16.71 95.757 43.178C281.491 82.71 315.561 66 351.757 66 414.082 66 464 117.428 464 180.539c0 77.834-70.718 142.388-177.836 240.25L256 448z";

const STEPS = [
  {
    n: "01",
    t: "DIAL THE NUMBER",
    d: "Call the number on the front of this card. The line is live 24/7.",
  },
  {
    n: "02",
    t: "LISTEN",
    d: "An AI voice agent will pick up. Wait for the greeting to finish.",
  },
  {
    n: "03",
    t: "SPEAK",
    d: "Say whatever you need to. No time limit, no judgment, no recording.",
  },
  {
    n: "04",
    t: "HANG UP",
    d: "End the call when you're done. The line will be here next time.",
  },
];

/* ── Jagged clip-path for landscape card ──
   Zigzag teeth on all four edges of the white inner area.
   More horizontal teeth (wider card), fewer vertical. */
function jaggedClip(): string {
  const hT = 22;  // horizontal teeth
  const vT = 12;  // vertical teeth
  const dp = 3;   // depth %
  const hS = 100 / hT;
  const vS = 100 / vT;
  const p: string[] = [];

  for (let i = 0; i <= hT; i++)
    p.push(`${(i * hS).toFixed(2)}% ${i % 2 ? dp : 0}%`);
  for (let i = 1; i < vT; i++)
    p.push(`${i % 2 ? 100 - dp : 100}% ${(i * vS).toFixed(2)}%`);
  for (let i = hT; i >= 0; i--)
    p.push(`${(i * hS).toFixed(2)}% ${i % 2 ? 100 - dp : 100}%`);
  for (let i = vT - 1; i >= 1; i--)
    p.push(`${i % 2 ? dp : 0}% ${(i * vS).toFixed(2)}%`);

  return `polygon(${p.join(", ")})`;
}

const CLIP = jaggedClip();

/* ── Tilt config ── */
const TILT_MAX = 14; // degrees

export default function HomePage() {
  const [flipped, setFlipped] = useState(false);
  const [copied, setCopied] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const flippingRef = useRef(false);

  const copyNumber = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(PHONE_NUMBER);
    } catch {
      const t = document.createElement("textarea");
      t.value = PHONE_NUMBER;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      document.body.removeChild(t);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const flip = useCallback(() => {
    const card = sceneRef.current?.querySelector(".card") as HTMLElement | null;
    if (!card) return;
    // Use slow transition for the flip, then restore fast tilt transition
    flippingRef.current = true;
    card.style.transition = "transform 0.7s cubic-bezier(0.25, 0.1, 0.25, 1)";
    setFlipped((f) => !f);
    setTimeout(() => {
      flippingRef.current = false;
      if (card) card.style.transition = "";
    }, 750);
  }, []);

  /* ── 3D tilt handlers ── */
  const applyTilt = useCallback(() => {
    const el = sceneRef.current;
    if (!el) return;
    const card = el.querySelector(".card") as HTMLElement | null;
    if (!card) return;
    const { x, y } = tiltRef.current;
    // Compose tilt with flip
    const flipY = flipped ? 180 : 0;
    card.style.transform = `rotateX(${y}deg) rotateY(${flipY + x}deg)`;
  }, [flipped]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (flippingRef.current) return; // don't tilt during flip
      const el = sceneRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // Normalized -1 to 1 from center
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      tiltRef.current = {
        x: nx * TILT_MAX,
        y: -ny * TILT_MAX, // inverted: mouse up = tilt back
      };
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(applyTilt);
    },
    [applyTilt]
  );

  const handleMouseLeave = useCallback(() => {
    tiltRef.current = { x: 0, y: 0 };
    const card = sceneRef.current?.querySelector(".card") as HTMLElement | null;
    if (!card) return;
    const flipY = flipped ? 180 : 0;
    card.style.transform = `rotateX(0deg) rotateY(${flipY}deg)`;
  }, [flipped]);

  return (
    <main className="page">
      <div className="grain" aria-hidden="true" />
      <div className="glow" aria-hidden="true" />

      <div
        ref={sceneRef}
        className={`scene${flipped ? " is-flipped" : ""}`}
        onClick={flip}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            flip();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={flipped ? "Flip card to front" : "Flip card to back"}
      >
        <div className="card">
          {/* ═══ FRONT ═══ */}
          <div className="face front">
            <div className="card-grain" aria-hidden="true" />

            {/* Debossed heart — carpet-shaved / pressed into surface */}
            <div className="emboss-wrap" aria-hidden="true">
              <svg
                className="deboss-svg"
                viewBox="0 0 512 512"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <filter id="deboss" x="-10%" y="-10%" width="120%" height="120%">
                    {/* Inner shadow — dark on top-left edge */}
                    <feOffset dx="0" dy="2" in="SourceAlpha" result="off1" />
                    <feGaussianBlur in="off1" stdDeviation="1.5" result="blur1" />
                    <feComposite in="blur1" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="innerShadow1" />
                    <feFlood floodColor="#000000" floodOpacity="0.35" result="color1" />
                    <feComposite in="color1" in2="innerShadow1" operator="in" result="shadow1" />

                    {/* Inner highlight — light on bottom-right edge */}
                    <feOffset dx="0" dy="-1.5" in="SourceAlpha" result="off2" />
                    <feGaussianBlur in="off2" stdDeviation="1" result="blur2" />
                    <feComposite in="blur2" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="innerShadow2" />
                    <feFlood floodColor="#ffffff" floodOpacity="0.12" result="color2" />
                    <feComposite in="color2" in2="innerShadow2" operator="in" result="shadow2" />

                    {/* Fill the shape with a slightly darker red */}
                    <feFlood floodColor="#000000" floodOpacity="0.12" result="baseFill" />
                    <feComposite in="baseFill" in2="SourceAlpha" operator="in" result="coloredBase" />

                    {/* Merge all layers */}
                    <feMerge>
                      <feMergeNode in="coloredBase" />
                      <feMergeNode in="shadow1" />
                      <feMergeNode in="shadow2" />
                    </feMerge>
                  </filter>
                </defs>
                <path d={HEART_D} filter="url(#deboss)" />
              </svg>
            </div>

            {/* Bottom info bar — Monika card layout */}
            <div className="front-bottom">
              <div className="front-left">
                <span className="brand-text">DATELINE</span>
                <span className="info-text">
                  EMERGENCY CALLBACK SYSTEM.
                </span>
                <button className="phone-btn" onClick={copyNumber}>
                  {copied ? "✓ COPIED TO CLIPBOARD" : PHONE_NUMBER}
                </button>
              </div>
              <div className="front-right">
                <span className="action-text">FLIP →</span>
              </div>
            </div>
          </div>

          {/* ═══ BACK ═══ */}
          <div className="face back">
            <div className="back-pad">
              <div className="jagged" style={{ clipPath: CLIP }}>
                <div className="instr">
                  <div className="instr-head">
                    <span className="pixel-sm pixel-red">
                      HOW TO USE THIS NUMBER
                    </span>
                  </div>

                  <div className="steps-grid">
                    {STEPS.map((s) => (
                      <div key={s.n} className="step">
                        <span className="step-n">{s.n}</span>
                        <div className="step-r">
                          <span className="step-t">{s.t}</span>
                          <span className="step-d">{s.d}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="instr-foot">
                    <span>DATELINE v1.0</span>
                    <span>← FLIP BACK</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="page-foot">
        MISSED CONNECTION? DROPPED CALL?{" "}
        <strong>CALL THE LINE.</strong>
      </footer>
    </main>
  );
}
