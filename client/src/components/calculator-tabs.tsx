import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

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
  const snowballHref = locale ? `/${locale}/snowball` : '/snowball';
  const taxHref = '/tax';
  
  const isReinvestActive = location === "/" || location === "/kr" || location === "/en" || location === "/calculator";
  const isGoalActive = location === "/goal" || location === "/kr/goal" || location === "/en/goal";
  const isSnowballActive = location === "/snowball" || location === "/kr/snowball" || location === "/en/snowball";
  const isTaxActive = location === "/tax";

  return (
    <div className={cn("flex flex-wrap border-b border-gray-200 mb-6", className)}>
      <Link href={reinvestHref}>
        <button
          className={cn(
            "px-4 sm:px-6 py-3 text-sm font-medium border-b-2 transition-colors",
            isReinvestActive
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          )}
        >
          {isEnglish ? "Reinvestment" : "재투자 계산기"}
        </button>
      </Link>
      <Link href={goalHref}>
        <button
          className={cn(
            "px-4 sm:px-6 py-3 text-sm font-medium border-b-2 transition-colors",
            isGoalActive
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          )}
        >
          {isEnglish ? "Goal Calculator" : "목표 배당금"}
        </button>
      </Link>
      <Link href={snowballHref}>
        <button
          className={cn(
            "px-4 sm:px-6 py-3 text-sm font-medium border-b-2 transition-colors",
            isSnowballActive
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          )}
        >
          {isEnglish ? "Snowball" : "스노우볼"}
        </button>
      </Link>
      <Link href={taxHref}>
        <button
          className={cn(
            "px-4 sm:px-6 py-3 text-sm font-medium border-b-2 transition-colors",
            isTaxActive
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          )}
        >
          {isEnglish ? "Tax Calculator" : "종합과세 계산기"}
        </button>
      </Link>
    </div>
  );
}
