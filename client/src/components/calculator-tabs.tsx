import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface CalculatorTabsProps {
  className?: string;
}

/** 계산기 사이 이동 — 휴대폰에서는 옆으로 밀어서 넘겨요 */
export default function CalculatorTabs({ className }: CalculatorTabsProps) {
  const [location] = useLocation();
  const locale = location.startsWith("/en") ? "en" : "";
  const isEnglish = locale === "en";

  const tabs = [
    {
      href: locale ? `/${locale}` : "/",
      label: isEnglish ? "Reinvestment" : "재투자 계산기",
      active: ["/", "/kr", "/en", "/calculator"].includes(location),
    },
    { href: locale ? `/${locale}/goal` : "/goal", label: isEnglish ? "Goal" : "목표 배당금", active: location.endsWith("/goal") },
    { href: locale ? `/${locale}/snowball` : "/snowball", label: isEnglish ? "Snowball" : "스노우볼", active: location.endsWith("/snowball") },
    ...(!isEnglish ? [{ href: "/tax", label: "종합과세", active: location === "/tax" }] : []),
  ];

  return (
    <div className={cn("mb-6 sm:mb-8", className)}>
      <div className="seg w-full sm:w-fit" role="tablist">
        {tabs.map((t) => (
          <Link key={t.href} href={t.href}>
            <span role="tab" aria-selected={t.active} data-active={t.active} className="seg-item">
              {t.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
