import { Link, useLocation } from "wouter";
import { Menu, Target, BookOpen, TrendingUp, Snowflake, Calculator, CalendarDays, LayoutGrid, Languages, ChevronRight } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import BrandMark from "@/components/brand-mark";

export default function Navigation() {
  const [location] = useLocation();

  const isEnglish = location.startsWith("/en");
  // 한국어는 접두어 없이 (/, /goal …), 영어는 /en 아래
  const locale = isEnglish ? "/en" : "";

  const switchHref = () => {
    const rest = location.replace(/^\/(en|kr)/, "");
    if (isEnglish) return rest === "" ? "/" : rest;
    // 종합과세는 한국어 전용 → 영어로 바꿀 땐 재투자 계산기로
    if (["/tax", "/compare", "/calendar"].includes(rest) || rest.startsWith("/etf") || rest.startsWith("/learn")) return "/en";
    return rest === "" || rest === "/" || rest === "/calculator" ? "/en" : `/en${rest}`;
  };

  const calcPaths = ["/", "/kr", "/calculator", "/goal", "/snowball", "/compare", "/tax"];
  const items = isEnglish
    ? [
        { href: "/en", label: "Reinvestment", icon: TrendingUp, active: location === "/en" },
        { href: "/en/goal", label: "Goal", icon: Target, active: location.includes("/goal") },
        { href: "/en/snowball", label: "Snowball", icon: Snowflake, active: location.includes("/snowball") },
        { href: "/en/guide", label: "Guide", icon: BookOpen, active: location.includes("/guide") },
      ]
    : [
        { href: "/", label: "계산기", icon: Calculator, active: calcPaths.includes(location) || location.startsWith("/kr/") },
        { href: "/calendar", label: "배당 달력", icon: CalendarDays, active: location === "/calendar" },
        { href: "/etf", label: "배당 ETF", icon: LayoutGrid, active: location.startsWith("/etf") },
        { href: "/learn", label: "배당 공부", icon: BookOpen, active: location.startsWith("/learn") || location === "/guide" },
      ];

  return (
    <nav className="site-nav sticky top-0 z-50">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href={locale || "/"}>
          <span className="flex items-center gap-2.5">
            <BrandMark size={28} />
            <span className="text-[16px] font-bold tracking-tight text-foreground">
              {isEnglish ? "Dividend Calculator" : "배당 계산기"}
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {items.map((it) => (
            <Link key={it.href} href={it.href}>
              <span
                className={cn(
                  "rounded-full px-3.5 py-2 text-[14px] font-medium transition-colors duration-200",
                  it.active ? "bg-surface-2 text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {it.label}
              </span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link href={switchHref()}>
            <span className="flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-[13px] font-medium text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground">
              <Languages className="h-4 w-4" />
              {isEnglish ? "한국어" : "EN"}
            </span>
          </Link>

          <Sheet>
            <SheetTrigger asChild>
              <button
                aria-label={isEnglish ? "Open menu" : "메뉴 열기"}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-border-strong md:hidden"
              >
                <Menu className="h-[18px] w-[18px]" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] border-l border-border bg-background p-0">
              <SheetTitle className="sr-only">{isEnglish ? "Menu" : "메뉴"}</SheetTitle>
              <div className="flex items-center gap-2.5 border-b border-border px-5 py-5">
                <BrandMark size={26} />
                <span className="text-[15px] font-bold">{isEnglish ? "Dividend Calculator" : "배당 계산기"}</span>
              </div>
              <div className="p-3">
                {items.map((it) => {
                  const Icon = it.icon;
                  return (
                    <SheetClose asChild key={it.href}>
                      <Link href={it.href}>
                        <span
                          className={cn(
                            "mb-1 flex items-center gap-3 rounded-xl px-3.5 py-3 text-[15px] transition-colors",
                            it.active ? "bg-surface-2 font-semibold text-foreground" : "text-muted-foreground hover:bg-surface-2/60"
                          )}
                        >
                          <Icon className={cn("h-[18px] w-[18px]", it.active ? "text-gold" : "")} />
                          <span className="flex-1">{it.label}</span>
                          <ChevronRight className="h-4 w-4 text-subtle" />
                        </span>
                      </Link>
                    </SheetClose>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
