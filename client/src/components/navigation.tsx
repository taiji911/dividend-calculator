import { Link, useLocation } from "wouter";
import { BarChart3, Menu, Globe, Target, BookOpen, TrendingUp, HelpCircle, Snowflake, Receipt } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navigation() {
  const [location] = useLocation();

  const getCurrentLanguage = () => {
    if (location.startsWith('/en')) return 'EN';
    if (location.startsWith('/kr')) return 'KR';
    return 'KR';
  };

  const isEnglish = getCurrentLanguage() === 'EN';
  const locale = isEnglish ? '/en' : '/kr';

  const getLanguageRedirect = (newLang: string) => {
    const currentPath = location.replace(/^\/(en|kr)/, '');
    if (newLang === 'en') return '/en' + currentPath;
    if (newLang === 'kr') return '/kr' + currentPath;
    return currentPath || '/kr';
  };

  // 종합과세 탭은 한국어 전용 — 영어 버전에서 숨김
  const navLinks = [
    {
      href: locale,
      label: isEnglish ? 'Reinvestment' : '재투자 계산기',
      isActive: location === "/" || location === "/kr" || location === "/en" || location === "/calculator",
    },
    {
      href: `${locale}/goal`,
      label: isEnglish ? 'Goal' : '목표 배당금',
      isActive: location.includes('/goal'),
    },
    {
      href: `${locale}/snowball`,
      label: isEnglish ? 'Snowball' : '스노우볼',
      isActive: location.includes('/snowball'),
    },
    ...(!isEnglish ? [{
      href: '/tax',
      label: '종합과세',
      isActive: location === '/tax',
    }] : []),
  ];

  const menuItems = [
    { href: locale, label: isEnglish ? 'Reinvestment Calculator' : '재투자 계산기', icon: TrendingUp, isActive: navLinks[0].isActive },
    { href: `${locale}/goal`, label: isEnglish ? 'Goal Calculator' : '목표 배당금 계산기', icon: Target, isActive: navLinks[1].isActive },
    { href: `${locale}/snowball`, label: isEnglish ? 'Snowball Simulator' : '스노우볼 시뮬레이터', icon: Snowflake, isActive: navLinks[2].isActive },
    ...(!isEnglish ? [{ href: '/tax', label: '종합과세 계산기', icon: Receipt, isActive: location === '/tax' }] : []),
    { href: `${locale}/guide`, label: isEnglish ? 'Guide' : '사용 가이드', icon: BookOpen, isActive: location.includes('/guide') },
  ];

  return (
    <nav className="jay-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[58px]">

          {/* Logo */}
          <Link href={locale}>
            <div className="jay-nav-logo">
              <BarChart3 className="jay-nav-logo-icon h-5 w-5" />
              <span className="hidden sm:inline">
                {isEnglish ? 'Dividend Calculator' : '배당 계산기'}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className="jay-nav-link"
                  style={link.isActive ? {
                    color: 'hsl(174,72%,60%)',
                    background: 'rgba(14,165,160,0.1)',
                  } : {}}
                >
                  {link.label}
                  {link.isActive && (
                    <span style={{
                      display: 'inline-block',
                      width: 4, height: 4,
                      borderRadius: '50%',
                      background: 'hsl(174,72%,54%)',
                      marginLeft: 4,
                    }} />
                  )}
                </span>
              </Link>
            ))}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Guide */}
            <Link href={`${locale}/guide`}>
              <button className="jay-nav-btn hidden sm:flex">
                <HelpCircle className="h-3.5 w-3.5" />
                <span>{isEnglish ? 'Guide' : '가이드'}</span>
              </button>
            </Link>

            <div className="jay-nav-divider hidden sm:block" />

            {/* Language */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="jay-nav-btn">
                  <Globe className="h-3.5 w-3.5" />
                  <span>{getCurrentLanguage()}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="min-w-[120px]"
                style={{ background: 'hsl(220,40%,12%)', border: '1px solid hsl(220,30%,20%)', borderRadius: 8 }}
              >
                <DropdownMenuItem asChild>
                  <Link href={getLanguageRedirect('kr')}>
                    <span style={{ color: 'hsl(210,20%,78%)', fontSize: 13, padding: '6px 8px', display: 'block', cursor: 'pointer' }}>
                      🇰🇷 한국어
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={getLanguageRedirect('en')}>
                    <span style={{ color: 'hsl(210,20%,78%)', fontSize: 13, padding: '6px 8px', display: 'block', cursor: 'pointer' }}>
                      🇺🇸 English
                    </span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <button className="jay-nav-btn md:hidden" style={{ padding: '6px 8px' }}>
                  <Menu className="h-4 w-4" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-72 p-0"
                style={{ background: 'hsl(220,40%,9%)', border: 'none' }}
              >
                <SheetTitle className="sr-only">메뉴</SheetTitle>
                <div style={{
                  padding: '20px 20px 16px',
                  borderBottom: '1px solid hsl(220,30%,16%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <BarChart3 style={{ color: 'hsl(174,72%,54%)', width: 18, height: 18 }} />
                  <span style={{ color: 'white', fontWeight: 700, fontSize: 14, letterSpacing: '-0.02em' }}>
                    {isEnglish ? 'Dividend Calculator' : '배당 계산기'}
                  </span>
                </div>
                <div style={{ padding: '12px 12px' }}>
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.href} href={item.href}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '11px 12px',
                          borderRadius: 8,
                          marginBottom: 2,
                          cursor: 'pointer',
                          background: item.isActive ? 'rgba(14,165,160,0.12)' : 'transparent',
                          color: item.isActive ? 'hsl(174,72%,60%)' : 'hsl(210,20%,72%)',
                          fontSize: 14,
                          fontWeight: item.isActive ? 600 : 400,
                          transition: 'all 0.15s ease',
                        }}>
                          <Icon style={{ width: 16, height: 16, flexShrink: 0 }} />
                          {item.label}
                        </div>
                      </Link>
                    );
                  })}
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '16px 20px',
                  borderTop: '1px solid hsl(220,30%,16%)',
                }}>
                  <p style={{ color: 'hsl(215,16%,40%)', fontSize: 11, letterSpacing: '0.04em' }}>
                    {isEnglish ? 'Asset OS · Dividend Tools' : '자산 운영체제 · Dividend Tools'}
                  </p>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
