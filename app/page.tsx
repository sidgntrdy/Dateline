"use client";

import { useState, useCallback, useRef, useEffect } from "react";

const PHONE_NUMBER = "+1 (800) 911-5683";

const ALERT_MESSAGES = [
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
  const doubled = [...ALERT_MESSAGES, ...ALERT_MESSAGES];
  const shifted = [
    ...doubled.slice(offset % ALERT_MESSAGES.length),
    ...doubled.slice(0, offset % ALERT_MESSAGES.length),
  ];
  return shifted.map((msg, i) => (
    <span key={i} className="ticker-bubble">
      <span className="bubble-icon">⚠</span>
      {msg}
    </span>
  ));
}

/* ── Dithered heart SVG ── */
function DitherHeart({ id, className }: { id: string; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id={`${id}-dots-sm`} x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1.2" fill="currentColor" opacity="0.9" />
        </pattern>
        <pattern id={`${id}-dots-md`} x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="5" cy="5" r="2.2" fill="currentColor" opacity="0.6" />
        </pattern>
        <pattern id={`${id}-dots-lg`} x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="8" cy="8" r="3.5" fill="currentColor" opacity="0.35" />
        </pattern>
        <pattern id={`${id}-lines`} x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="currentColor" strokeWidth="1" opacity="0.18" />
        </pattern>
        <clipPath id={`${id}-clip`}>
          <path d="M256 448l-30.164-27.211C118.718 322.927 48 258.373 48 180.539 48 117.428 97.918 66 160.243 66c36.196 0 70.266 16.71 95.757 43.178C281.491 82.71 315.561 66 351.757 66 414.082 66 464 117.428 464 180.539c0 77.834-70.718 142.388-177.836 240.25L256 448z" />
        </clipPath>
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="18" />
        </filter>
      </defs>

      <path d="M256 448l-30.164-27.211C118.718 322.927 48 258.373 48 180.539 48 117.428 97.918 66 160.243 66c36.196 0 70.266 16.71 95.757 43.178C281.491 82.71 315.561 66 351.757 66 414.082 66 464 117.428 464 180.539c0 77.834-70.718 142.388-177.836 240.25L256 448z" fill="currentColor" opacity="0.15" />
      <g clipPath={`url(#${id}-clip)`}><rect width="512" height="512" fill={`url(#${id}-dots-lg)`} /></g>
      <g clipPath={`url(#${id}-clip)`}><rect width="512" height="512" fill={`url(#${id}-dots-md)`} /></g>
      <g clipPath={`url(#${id}-clip)`}><rect width="512" height="512" fill={`url(#${id}-dots-sm)`} /></g>
      <g clipPath={`url(#${id}-clip)`}><rect width="512" height="512" fill={`url(#${id}-lines)`} /></g>
      <path d="M256 448l-30.164-27.211C118.718 322.927 48 258.373 48 180.539 48 117.428 97.918 66 160.243 66c36.196 0 70.266 16.71 95.757 43.178C281.491 82.71 315.561 66 351.757 66 414.082 66 464 117.428 464 180.539c0 77.834-70.718 142.388-177.836 240.25L256 448z" fill="currentColor" opacity="0.1" filter={`url(#${id}-glow)`} />
    </svg>
  );
}

export default function HomePage() {
  const [copied, setCopied] = useState(false);
  const heartRef = useRef<HTMLDivElement>(null);
  const heartGhostRef = useRef<HTMLDivElement>(null);
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
      const dx = (prev.x - 0.5) * 2;
      const dy = (prev.y - 0.5) * 2;

      if (heartRef.current) {
        heartRef.current.style.transform =
          `translate(calc(-50% + ${dx * 40}px), calc(-50% + ${dy * 35}px)) rotate(${dx * 2}deg) scale(${1 + Math.abs(dy) * 0.02})`;
      }
      if (heartGhostRef.current) {
        heartGhostRef.current.style.transform =
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
      {/* ── Alert bar ── */}
      <div className="alert-bar">
        <span className="alert-blink">▮</span>
        <span>EMERGENCY ALERT SYSTEM</span>
        <span className="alert-sep">│</span>
        <span>DATELINE v1.0</span>
        <span className="alert-sep">│</span>
        <span>STATUS: <span className="alert-blink">ACTIVE</span></span>
      </div>

      {/* ── Dithered heart layers ── */}
      <div className="heart-layer heart-ghost" ref={heartGhostRef} aria-hidden="true">
        <DitherHeart id="ghost" className="heart-svg" />
      </div>
      <div className="heart-layer heart-main" ref={heartRef} aria-hidden="true">
        <DitherHeart id="main" className="heart-svg" />
      </div>

      {/* ── Ticker rows ── */}
      <div className="ticker-layer">
        <div className="ticker-row ticker-row-1">{buildTickerRow(0)}</div>
        <div className="ticker-row ticker-row-2">{buildTickerRow(5)}</div>
        <div className="ticker-row ticker-row-3">{buildTickerRow(11)}</div>
        <div className="ticker-row ticker-row-4">{buildTickerRow(3)}</div>
        <div className="ticker-row ticker-row-5">{buildTickerRow(8)}</div>
        <div className="ticker-row ticker-row-6">{buildTickerRow(14)}</div>
      </div>

      {/* ── Center content ── */}
      <div className="center-column">
        {/* System warning header */}
        <div className="sys-warning">
          <span className="sys-blink">●</span>
          INCOMING BROADCAST
        </div>

        <h1 className="brand">DATELINE</h1>

        <div className="sys-status">
          ┌─ SYSTEM STATUS ──────────────────────┐
          <br />
          │ HEARTBEAT MONITOR ... <span className="status-red">FLATLINE</span>
          <br />
          │ SIGNAL STRENGTH ... <span className="status-red">0%</span>
          <br />
          │ LAST CONTACT ... <span className="status-dim">UNKNOWN</span>
          <br />
          └──────────────────────────────────────┘
        </div>

        <div className="alert-divider" aria-hidden="true">
          ▸▸▸ CALL THE LINE ◂◂◂
        </div>

        <button className="number-btn" onClick={handleCopy} title="Click to copy number">
          <span className="number-label">EMERGENCY HOTLINE</span>
          <span className="number-text">{PHONE_NUMBER}</span>
          <span className="copy-hint">{copied ? "▸ COPIED TO CLIPBOARD" : "▸ TAP TO COPY"}</span>
        </button>

        <div className="sys-footer-msg">
          THIS IS NOT A TEST. IF YOU OR SOMEONE YOU KNOW HAS EXPERIENCED
          <br />
          A DROPPED CALL, MISSED CONNECTION, OR LOVE DISCONNECTED —
          <br />
          <span className="footer-highlight">CALL THE LINE IMMEDIATELY.</span>
        </div>

        <footer className="footer">
          █ DATELINE EMERGENCY CALLBACK SYSTEM █ TWILIO → ELEVENLABS AGENT BRIDGE █
        </footer>
      </div>
    </main>
  );
}
