import { Link } from "wouter";
import { ArrowUpRight, Calculator, LayoutGrid, BookOpen } from "lucide-react";
import { LEARN } from "@/content/learn-meta";

/** 첫 화면 아래 '계산 · 확인 · 이해' 세 갈래 안내 (한국어) */
export default function HomeHub() {
  const cols = [
    {
      icon: Calculator,
      color: "text-gold bg-gold/10",
      title: "계산하기",
      desc: "내 숫자를 넣고 미래를 그려 봐요",
      links: [
        { href: "/goal", label: "월 배당 목표에 필요한 원금" },
        { href: "/snowball", label: "배당이 저축을 앞지르는 시점" },
        { href: "/compare", label: "일반계좌 vs ISA vs 연금저축" },
        { href: "/tax", label: "배당 2,000만원 넘을 때 세금" },
      ],
    },
    {
      icon: LayoutGrid,
      color: "text-mint bg-mint/10",
      title: "확인하기",
      desc: "사기 전에 숫자를 비교해요",
      links: [
        { href: "/etf", label: "인기 배당 ETF 19개 비교" },
        { href: "/calendar", label: "배당 달력 · 월배당 만들기" },
        { href: "/etf/schd", label: "SCHD 배당률·총보수" },
        { href: "/etf/tiger-us-dividend-dowjones", label: "TIGER 미국배당다우존스" },
      ],
    },
    {
      icon: BookOpen,
      color: "text-iris bg-iris/10",
      title: "이해하기",
      desc: "배당 투자에 필요한 것만 쉽게",
      links: LEARN.slice(0, 4).map((a) => ({ href: `/learn/${a.slug}`, label: a.title })),
    },
  ];

  return (
    <section className="mt-12" aria-labelledby="hub">
      <h2 id="hub" className="text-[20px] font-bold tracking-[-0.03em] sm:text-[22px]">
        배당 투자, 여기서 다 해 보세요
      </h2>
      <p className="mt-1 text-[14px] text-muted-foreground">계산하고, 확인하고, 이해하는 배당 투자자의 작업실이에요.</p>
      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
        {cols.map((c) => (
          <div key={c.title} className="panel p-5">
            <div className="flex items-center gap-3">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${c.color}`}>
                <c.icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-[16px] font-bold text-foreground">{c.title}</span>
                <span className="block text-[12.5px] text-subtle">{c.desc}</span>
              </span>
            </div>
            <ul className="mt-4 divide-y divide-border">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>
                    <span className="group flex items-center justify-between gap-2 py-2.5 text-[14px] text-muted-foreground hover:text-foreground">
                      <span className="min-w-0 truncate">{l.label}</span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-subtle group-hover:text-foreground" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
