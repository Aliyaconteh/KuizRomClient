
export default function Skeleton({
  count = 1,
  variant = "card",
  className = "",
  style = {},
  size = "md",
}) {
  const items = Array.from({ length: count });

  return (
    <>
      {/* Shimmer keyframe — injected once, harmless if duplicated */}
      <style>{`
        @keyframes sk-shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .sk-shimmer {
          position: relative;
          overflow: hidden;
        }
        .sk-shimmer::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(99, 102, 241, 0.07) 40%,
            rgba(167, 139, 250, 0.10) 50%,
            rgba(99, 102, 241, 0.07) 60%,
            transparent 100%
          );
          animation: sk-shimmer 1.7s ease-in-out infinite;
        }
      `}</style>

      <div className={`flex flex-col gap-3 ${className}`} style={style} aria-busy="true" aria-label="Loading…">
        {items.map((_, i) => (
          <SkeletonItem key={i} variant={variant} delay={i * 110} size={size} />
        ))}
      </div>
    </>
  );
}

// ── individual item ───────────────────────────────────────────────────────────
function SkeletonItem({ variant, delay, size = "md" }) {
  const base =
    "bg-[#0d131c] border border-[#1a2235] rounded-2xl sk-shimmer";

  const delayStyle = { animationDelay: `${delay}ms` };

  // Fade-in stagger on the card itself
  const cardStyle = {
    opacity: 0,
    animation: `sk-fadein 0.4s ease forwards`,
    animationDelay: `${delay}ms`,
  };

  const scale = size === "sm" ? 0.82 : size === "lg" ? 1.18 : 1;

  if (variant === "form") return <FormSkeleton base={base} delayStyle={delayStyle} cardStyle={cardStyle} scale={scale} />;
  if (variant === "row")  return <RowSkeleton  base={base} delayStyle={delayStyle} cardStyle={cardStyle} scale={scale} />;
  if (variant === "bar")  return <BarSkeleton  base={base} cardStyle={cardStyle} scale={scale} />;
  return <CardSkeleton base={base} delayStyle={delayStyle} cardStyle={cardStyle} scale={scale} />;
}

// ── card variant — icon + title + two body lines ──────────────────────────────
function CardSkeleton({ base, delayStyle, cardStyle, scale = 1 }) {
  return (
    <>
      <style>{`@keyframes sk-fadein { to { opacity: 1; } }`}</style>
      <div className={`${base} p-5`} style={cardStyle}>
        <div className="flex items-start gap-4">
          {/* icon placeholder */}
          <div
            className="sk-shimmer rounded-xl bg-[#131c2e] flex-shrink-0"
            style={{ ...delayStyle, width: 40 * scale, height: 40 * scale }}
          />
          <div className="flex-1 flex flex-col gap-2.5 pt-0.5">
            {/* title */}
            <div
              className="sk-shimmer rounded-full bg-[#131c2e]"
              style={{ ...delayStyle, height: 14 * scale, width: '40%' }}
            />
            {/* body line 1 */}
            <div
              className="sk-shimmer rounded-full bg-[#111827]"
              style={{ ...delayStyle, height: 10 * scale, width: '100%' }}
            />
            {/* body line 2 — shorter */}
            <div
              className="sk-shimmer rounded-full bg-[#111827]"
              style={{ ...delayStyle, height: 10 * scale, width: '60%' }}
            />
          </div>
        </div>
        {/* bottom tag row */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#1a2235]">
          <div className="sk-shimmer rounded-full bg-[#131c2e]" style={{ ...delayStyle, height: 18 * scale, width: 64 * scale }} />
          <div className="sk-shimmer rounded-full bg-[#131c2e]" style={{ ...delayStyle, height: 18 * scale, width: 80 * scale }} />
        </div>
      </div>
    </>
  );
}

// ── form variant — label + input field blocks ─────────────────────────────────
function FormSkeleton({ base, delayStyle, cardStyle, scale = 1 }) {
  return (
    <>
      <style>{`@keyframes sk-fadein { to { opacity: 1; } }`}</style>
      <div className={`${base} p-5 flex flex-col gap-4`} style={cardStyle}>
        {/* field 1 */}
        <div className="flex flex-col gap-2">
          <div className="sk-shimmer rounded-full bg-[#131c2e]" style={{ ...delayStyle, height: 10 * scale, width: 96 * scale }} />
          <div className="sk-shimmer rounded-xl bg-[#0f1720]" style={{ ...delayStyle, height: 44 * scale, width: '100%' }} />
        </div>
        {/* field 2 */}
        <div className="flex flex-col gap-2">
          <div className="sk-shimmer rounded-full bg-[#131c2e]" style={{ ...delayStyle, height: 10 * scale, width: 64 * scale }} />
          <div className="sk-shimmer rounded-xl bg-[#0f1720]" style={{ ...delayStyle, height: 44 * scale, width: '100%' }} />
        </div>
        {/* button */}
        <div className="sk-shimmer rounded-2xl bg-indigo-900/30 mt-1" style={{ ...delayStyle, height: 48 * scale, width: '100%' }} />
      </div>
    </>
  );
}

// ── row variant — compact single-line ─────────────────────────────────────────
function RowSkeleton({ base, delayStyle, cardStyle, scale = 1 }) {
  return (
    <>
      <style>{`@keyframes sk-fadein { to { opacity: 1; } }`}</style>
      <div className={`${base} px-4 py-3 flex items-center gap-3`} style={cardStyle}>
        {/* rank badge */}
        <div className="sk-shimmer rounded-lg bg-[#131c2e] flex-shrink-0" style={{ ...delayStyle, width: 20 * scale, height: 20 * scale }} />
        {/* avatar */}
        <div className="sk-shimmer rounded-full bg-[#131c2e] flex-shrink-0" style={{ ...delayStyle, width: 24 * scale, height: 24 * scale }} />
        {/* name */}
        <div className="sk-shimmer rounded-full bg-[#131c2e]" style={{ ...delayStyle, height: 10 * scale, width: 112 * scale }} />
        {/* score — pushed right */}
        <div className="ml-auto sk-shimmer rounded-full bg-[#131c2e]" style={{ ...delayStyle, height: 10 * scale, width: 56 * scale }} />
      </div>
    </>
  );
}

// ── bar variant — original plain block behaviour ───────────────────────────────
function BarSkeleton({ base, cardStyle, scale = 1 }) {
  return (
    <>
      <style>{`@keyframes sk-fadein { to { opacity: 1; } }`}</style>
      <div
        className={`${base} w-full`}
        style={{ height: 80 * scale, ...cardStyle }}
      />
    </>
  );
}