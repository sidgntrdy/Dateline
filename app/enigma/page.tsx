"use client";

import { useState, useCallback, useRef } from "react";

const PHONE_NUMBER = "+1 (800) 911-5683";


const STEPS = [
  {
    n: "01",
    t: "Text THE NUMBER",
    d: "Text the number on the front of this card add. The line is live 24/7.",
  },
  {
    n: "02",
    t: "EMERGENCY CALLBACK",
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

/* ── Tilt config ── */
const TILT_MAX = 10; // degrees
const LIFT = 40; // px — hover lift toward viewer

export default function EnigmaPage() {
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
    if (!card || flippingRef.current) return;
    flippingRef.current = true;
    card.style.transition = "transform 2s cubic-bezier(0.25, 0.1, 0.25, 1)";
    setFlipped((f) => {
      const next = !f;
      const targetY = next ? 180 : 0;
      card.style.transform = `translateZ(${LIFT}px) rotateX(0deg) rotateY(${targetY}deg)`;
      return next;
    });
    setTimeout(() => {
      flippingRef.current = false;
      if (card) card.style.transition = "";
    }, 2050);
  }, []);

  /* ── 3D tilt handlers ── */
  const applyTilt = useCallback(() => {
    const el = sceneRef.current;
    if (!el) return;
    const card = el.querySelector(".card") as HTMLElement | null;
    if (!card) return;
    const { x, y } = tiltRef.current;
    const flipY = flipped ? 180 : 0;
    card.style.transform = `translateZ(${LIFT}px) rotateX(${y}deg) rotateY(${flipY + x}deg)`;
  }, [flipped]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (flippingRef.current) return;
      const el = sceneRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      tiltRef.current = {
        x: nx * TILT_MAX,
        y: -ny * TILT_MAX,
      };
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(applyTilt);
    },
    [applyTilt],
  );

  const handleMouseLeave = useCallback(() => {
    tiltRef.current = { x: 0, y: 0 };
    const card = sceneRef.current?.querySelector(".card") as HTMLElement | null;
    if (!card) return;
    const flipY = flipped ? 180 : 0;
    card.style.transform = `translateZ(0px) rotateX(0deg) rotateY(${flipY}deg)`;
  }, [flipped]);

  return (
    <main className="page enigma">
      <div className="grain" aria-hidden="true" />
      <div className="glow" aria-hidden="true" />

      <div
        ref={sceneRef}
        className={`scene${flipped ? " is-flipped" : ""}`}
        onClick={flip}
        onMouseEnter={() => {
          if (flippingRef.current) return;
          const card = sceneRef.current?.querySelector(
            ".card",
          ) as HTMLElement | null;
          if (!card) return;
          const flipY = flipped ? 180 : 0;
          card.style.transform = `translateZ(${LIFT}px) rotateX(0deg) rotateY(${flipY}deg)`;
        }}
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

            {/* Logo + title lockup — centered */}
            <div className="enigma-lockup" aria-hidden="true">
              <svg
                className="enigma-logo"
                viewBox="0 0 14 25"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path fillRule="evenodd" clipRule="evenodd" d="M13 18C12.7348 18 12.4805 17.8946 12.2929 17.7071C12.1054 17.5196 12 17.2652 12 17L12 1C12 0.734784 12.1054 0.480429 12.2929 0.292892C12.4805 0.105356 12.7348 0 13 0C13.2652 0 13.5196 0.105356 13.7071 0.292892C13.8947 0.480429 14 0.734784 14 1L14 17C14 17.2652 13.8947 17.5196 13.7071 17.7071C13.5196 17.8946 13.2652 18 13 18Z" fill="white" />
                <path d="M13 17L7.00003 24" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path fillRule="evenodd" clipRule="evenodd" d="M4.00003 21C3.73481 21 3.48046 20.9122 3.29292 20.7559C3.10539 20.5996 3.00003 20.3877 3.00003 20.1667L3.00003 6.83333C3.00003 6.61232 3.10539 6.40036 3.29292 6.24408C3.48046 6.0878 3.73481 6 4.00003 6C4.26525 6 4.5196 6.0878 4.70714 6.24408C4.89467 6.40036 5.00003 6.61232 5.00003 6.83333L5.00003 20.1667C5.00003 20.3877 4.89467 20.5996 4.70714 20.7559C4.5196 20.9122 4.26525 21 4.00003 21Z" fill="white" />
                <path fillRule="evenodd" clipRule="evenodd" d="M7.00003 25C6.73481 25 6.48046 24.9122 6.29292 24.7559C6.10539 24.5996 6.00003 24.3877 6.00003 24.1667L6.00003 10.8333C6.00003 10.6123 6.10539 10.4004 6.29292 10.2441C6.48046 10.0878 6.73481 10 7.00003 10C7.26525 10 7.5196 10.0878 7.70714 10.2441C7.89467 10.4004 8.00003 10.6123 8.00003 10.8333L8.00003 24.1667C8.00003 24.3877 7.89467 24.5996 7.70714 24.7559C7.5196 24.9122 7.26525 25 7.00003 25Z" fill="white" />
                <path fillRule="evenodd" clipRule="evenodd" d="M1.00003 18C1.26525 18 1.5196 17.8946 1.70714 17.7071C1.89467 17.5196 2.00003 17.2652 2.00003 17L2.00003 1C2.00003 0.734784 1.89467 0.480429 1.70714 0.292892C1.5196 0.105356 1.26525 0 1.00003 0C0.734814 0 0.48046 0.105356 0.292924 0.292892C0.105388 0.480429 3.05176e-05 0.734784 3.05176e-05 1L3.05176e-05 17C3.05176e-05 17.2652 0.105388 17.5196 0.292924 17.7071C0.48046 17.8946 0.734814 18 1.00003 18Z" fill="white" />
                <path d="M1.00003 17L7.00003 24" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="enigma-title">Enigma Labs</span>
            </div>

            {/* Bottom info bar */}
          </div>

          {/* ═══ BACK ═══ */}
          <div className="face back">
            <div className="card-grain" aria-hidden="true" />

            <div className="instr">
              <div className="instr-head">
                <span className="back-title">DATELYNE</span>
                <span className="pixel-sm">BAD DATE? CREEP? EMERGENCY?</span>
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
                <span>DATELYNE v1.0</span>
                <span>← FLIP BACK</span>
              </div>
            </div>

            <div className="back-bottom">
              <button
                className="back-phone-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  copyNumber(e);
                }}
              >
                {copied ? "✓ COPIED" : PHONE_NUMBER}
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="page-foot">
        EMERGENCY? EXCUSE? <strong>CALL THE LINE.</strong>
      </footer>
    </main>
  );
}
