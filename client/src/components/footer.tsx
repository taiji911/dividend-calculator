import { Link, useLocation } from "wouter";
import BrandMark from "@/components/brand-mark";

export default function Footer() {
  const [location] = useLocation();
  const isEn = location.startsWith("/en");
  const l = isEn ? "/en" : "";
  const links = [
    { href: l || "/", label: isEn ? "Reinvestment" : "재투자 계산기" },
    { href: `${l}/goal`, label: isEn ? "Goal" : "목표 배당금" },
    { href: `${l}/snowball`, label: isEn ? "Snowball" : "스노우볼" },
    ...(!isEn ? [{ href: "/tax", label: "종합과세" }] : []),
    { href: `${l}/guide`, label: isEn ? "Guide" : "가이드" },
  ];
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2.5">
          <BrandMark size={22} />
          <span className="text-[14px] font-semibold text-muted-foreground">{isEn ? "Dividend Calculator" : "배당 계산기"}</span>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          {links.map((x) => (
            <Link key={x.href} href={x.href}>
              <span className="text-[13px] text-subtle transition-colors hover:text-foreground">{x.label}</span>
            </Link>
          ))}
        </nav>
      </div>
      <p className="mx-auto max-w-6xl px-4 pb-8 text-[12px] text-subtle sm:px-6">
        © {new Date().getFullYear()} jayinform.com · {isEn ? "For reference only. Not investment advice." : "계산 결과는 참고용이며 투자 권유가 아니에요."}
      </p>
    </footer>
  );
}
