import type { ReactNode } from "react";

interface PageHeaderProps {
  kicker?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
}

/** 모든 페이지 공통 머리말 */
export default function PageHeader({ kicker, title, subtitle, children }: PageHeaderProps) {
  return (
    <header className="pb-6 pt-8 sm:pb-8 sm:pt-12">
      {kicker && <p className="kicker mb-3 text-gold">{kicker}</p>}
      <h1 className="text-[28px] font-bold leading-[1.2] tracking-[-0.035em] sm:text-[40px]">{title}</h1>
      {subtitle && <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground sm:text-[16px]">{subtitle}</p>}
      {children}
    </header>
  );
}
