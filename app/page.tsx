"use client";

import { useState, useCallback } from "react";

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

export default function HomePage() {
  const [flipped, setFlipped] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const flip = useCallback(() => setFlipped((f) => !f), []);

  return (
    <main className="page">
      <div className="grain" aria-hidden="true" />
      <div className="glow" aria-hidden="true" />

      <div
        className={`scene${flipped ? " is-flipped" : ""}`}
        onClick={flip}
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

            {/* Embossed heart — subtle raised impression */}
            <div className="emboss-wrap" aria-hidden="true">
              <svg
                className="emboss-svg"
                viewBox="0 0 512 512"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d={HEART_D} fill="rgba(0,0,0,0.05)" />
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
