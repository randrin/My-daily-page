"use client";
import type { CSSProperties } from "react";
const colors = ["#14b8a6", "#38bdf8", "#fbbf24", "#a78bfa", "#fb7185"];
export function CelebrationConfetti() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    >
      {Array.from({ length: 40 }, (_, index) => (
        <span
          key={index}
          className="recovery-confetti absolute top-[-20px] h-3 w-2 rounded-sm"
          style={
            {
              left: `${(index * 37) % 100}%`,
              background: colors[index % colors.length],
              animationDelay: `${(index % 8) * 0.08}s`,
              "--drift": `${(index % 2 ? 1 : -1) * (50 + index * 3)}px`,
            } as CSSProperties
          }
        />
      ))}
      <style jsx>{`
        .recovery-confetti {
          animation: recovery-fall 2.8s ease-out both;
        }
        @keyframes recovery-fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(var(--drift), 100vh) rotate(720deg);
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .recovery-confetti {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
