/**
 * Decorative animated background — aurora orbs + mesh + subtle grain.
 * Pure CSS, no JS work. Sits behind content with pointer-events: none.
 */
export function AuroraBackground({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-mesh opacity-90" />
      <div
        className="aurora-orb"
        style={{
          width: 520,
          height: 520,
          left: "-10%",
          top: "-15%",
          background: "radial-gradient(circle, oklch(0.7 0.22 285 / 0.6), transparent 60%)",
        }}
      />
      <div
        className="aurora-orb"
        style={{
          width: 460,
          height: 460,
          right: "-8%",
          top: "10%",
          background: "radial-gradient(circle, oklch(0.65 0.22 310 / 0.55), transparent 60%)",
          animationDelay: "-6s",
        }}
      />
      <div
        className="aurora-orb"
        style={{
          width: 600,
          height: 600,
          left: "30%",
          bottom: "-20%",
          background: "radial-gradient(circle, oklch(0.6 0.2 250 / 0.45), transparent 60%)",
          animationDelay: "-12s",
        }}
      />
      {/* Subtle grain */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
    </div>
  );
}
