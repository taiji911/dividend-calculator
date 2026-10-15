/** 사이트 로고 마크 — 금색 동전 안에서 막대가 차곡차곡 올라가는 모양 (배당이 쌓이는 그림) */
export default function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="bm-g" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(42 96% 70%)" />
          <stop offset="1" stopColor="hsl(34 88% 52%)" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="9" fill="url(#bm-g)" />
      <rect x="1.5" y="1.5" width="29" height="29" rx="8.5" stroke="hsl(0 0% 100% / 0.35)" />
      <rect x="8" y="17" width="4" height="7" rx="1.5" fill="hsl(225 33% 6%)" />
      <rect x="14" y="13" width="4" height="11" rx="1.5" fill="hsl(225 33% 6%)" />
      <rect x="20" y="8" width="4" height="16" rx="1.5" fill="hsl(225 33% 6%)" />
    </svg>
  );
}
