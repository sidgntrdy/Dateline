"use client";

import { useState, useCallback, useRef, useEffect } from "react";

const PHONE_NUMBER = "+1 (800) 911-5683";

const TICKER_MESSAGES = [
  "SIGNAL LOST",
  "HEARTBEAT FLATLINE",
  "CONNECTION SEVERED",
  "LOVE DISCONNECTED",
  "CALLER UNREACHABLE",
  "TRANSMISSION FAILED",
  "NO SIGNAL DETECTED",
  "LAST MESSAGE SENT",
  "LINE DEAD",
  "FREQUENCY LOST",
  "SOS UNANSWERED",
  "STATIC ON ALL CHANNELS",
  "BROADCAST INTERRUPTED",
  "AWAITING RESPONSE",
  "MISSED CONNECTION",
  "DROPPED CALL",
  "VOICEMAIL FULL",
  "END OF TRANSMISSION",
  "REDIAL FAILED",
];

function buildTickerRow(offset: number) {
  const doubled = [...TICKER_MESSAGES, ...TICKER_MESSAGES];
  const shifted = [
    ...doubled.slice(offset % TICKER_MESSAGES.length),
    ...doubled.slice(0, offset % TICKER_MESSAGES.length),
  ];
  return shifted.map((msg, i) => (
    <span key={i} className="ticker-bubble">
      {msg}
    </span>
  ));
}

export default function HomePage() {
  const [copied, setCopied] = useState(false);
  const logoColorRef = useRef<HTMLDivElement>(null);
  const logoMonoRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0.5, y: 0.5 });
  const animFrame = useRef<number>(0);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(PHONE_NUMBER);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = PHONE_NUMBER;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mousePos.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener("mousemove", onMove);

    let prev = { x: 0.5, y: 0.5 };
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      prev.x = lerp(prev.x, mousePos.current.x, 0.06);
      prev.y = lerp(prev.y, mousePos.current.y, 0.06);

      const dx = (prev.x - 0.5) * 2; // -1 to 1
      const dy = (prev.y - 0.5) * 2;

      if (logoColorRef.current) {
        logoColorRef.current.style.transform =
          `translate(calc(-50% + ${dx * 40}px), calc(-50% + ${dy * 35}px)) rotate(${dx * 2}deg) scale(${1 + Math.abs(dy) * 0.02})`;
      }
      if (logoMonoRef.current) {
        // Mono layer drifts in the opposite direction for depth parallax
        logoMonoRef.current.style.transform =
          `translate(calc(-50% + ${dx * -20}px), calc(-50% + ${dy * -15}px)) rotate(${dx * -1}deg)`;
      }

      animFrame.current = requestAnimationFrame(tick);
    };

    animFrame.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(animFrame.current);
    };
  }, []);

  return (
    <main className="page">
      {/* ── Interactive logo layers ── */}
      <div className="logo-layer logo-layer-mono" ref={logoMonoRef} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-mono.svg" alt="" className="logo-svg" draggable={false} />
      </div>
      <div className="logo-layer logo-layer-color" ref={logoColorRef} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-color.svg" alt="" className="logo-svg" draggable={false} />
      </div>

      {/* Stock ticker rows */}
      <div className="ticker-layer">
        <div className="ticker-row ticker-row-1">{buildTickerRow(0)}</div>
        <div className="ticker-row ticker-row-2">{buildTickerRow(5)}</div>
        <div className="ticker-row ticker-row-3">{buildTickerRow(11)}</div>
        <div className="ticker-row ticker-row-4">{buildTickerRow(3)}</div>
        <div className="ticker-row ticker-row-5">{buildTickerRow(8)}</div>
        <div className="ticker-row ticker-row-6">{buildTickerRow(14)}</div>
      </div>

      {/* Center content */}
      <div className="center-column">
        <h1 className="brand">DATELINE</h1>

        <div className="dither-divider" aria-hidden="true">
          ░▒▓█▓▒░&nbsp;&nbsp;CALL THE LINE&nbsp;&nbsp;░▒▓█▓▒░
        </div>

        <button className="number-btn" onClick={handleCopy} title="Click to copy number">
          <span className="number-text">{PHONE_NUMBER}</span>
          <span className="copy-hint">{copied ? "copied!" : "tap to copy"}</span>
        </button>

        <footer className="footer">
          ░▒▓ DATELINE CALLBACK SYSTEM &middot; TWILIO &rarr; ELEVENLABS AGENT ▓▒░
        </footer>
      </div>
    </main>
  );
}
