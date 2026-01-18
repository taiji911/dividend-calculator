import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";

interface CalculatorTabsProps {
  className?: string;
}

export default function CalculatorTabs({ className }: CalculatorTabsProps) {
  const [location] = useLocation();
  
  const getCurrentLocale = () => {
    if (location.startsWith('/en')) return 'en';
    if (location.startsWith('/kr')) return 'kr';
    return '';
  };
  
  const locale = getCurrentLocale();
  const isEnglish = locale === 'en';
  
  const reinvestHref = locale ? `/${locale}` : '/kr';
  const goalHref = locale ? `/${locale}/goal` : '/goal';
  const guideHref = locale ? `/${locale}/guide` : '/guide';
  
  const isReinvestActive = location === "/" || location === "/kr" || location === "/en" || location === "/calculator";
  const isGoalActive = location === "/goal" || location === "/kr/goal" || location === "/en/goal";
  const isGuideActive = location === "/guide" || location === "/kr/guide" || location === "/en/guide";

  return (
    <div className={cn("flex flex-wrap border-b border-gray-200 mb-6", className)}>
      <Link href={reinvestHref}>
        <button
          className={cn(
            "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
            isReinvestActive
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          )}
        >
          {isEnglish ? "Reinvestment Calculator" : "재투자 계산기"}
        </button>
      </Link>
      <Link href={goalHref}>
        <button
          className={cn(
            "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
            isGoalActive
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          )}
        >
          {isEnglish ? "Dividend Goal Calculator" : "목표 배당금 계산기"}
        </button>
      </Link>
      <Link href={guideHref}>
        <button
          className={cn(
            "px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1",
            isGuideActive
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          )}
        >
          <BookOpen className="h-4 w-4" />
          {isEnglish ? "Guide" : "사용 가이드"}
        </button>
      </Link>
    </div>
  );
}
