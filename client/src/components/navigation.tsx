import { Link, useLocation } from "wouter";
import { Calculator, BarChart3, Menu, Globe, CalendarDays, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function Navigation() {
  const [location] = useLocation();

  const getCurrentLanguage = () => {
    if (location.startsWith('/en')) return 'EN';
    if (location.startsWith('/kr')) return 'KR';
    return 'KR'; // default
  };

  const getLanguageRedirect = (newLang: string) => {
    if (newLang === 'en') return '/en';
    if (newLang === 'kr') return '/kr';
    return '/';
  };

  const navItems: Array<{
    href: string;
    label: string;
    icon: any;
    isActive: boolean;
  }> = [
    {
      href: getCurrentLanguage() === 'EN' ? "/en" : "/kr",
      label: getCurrentLanguage() === 'EN' ? "Dividend Calculator" : "배당 재투자 계산기",
      icon: Calculator,
      isActive: location === "/" || location === "/kr" || location === "/en" || location === "/calculator",
    },
    // FIRE Calculator - 개발 중 비공개 처리
    // {
    //   href: getCurrentLanguage() === 'EN' ? "/en/fire" : "/fire",
    //   label: getCurrentLanguage() === 'EN' ? "FIRE Calculator" : "FIRE 계산기",
    //   icon: Target,
    //   isActive: location === "/fire" || location === "/kr/fire" || location === "/en/fire",
    // },
    // {
    //   href: "/comparison",
    //   label: "종목 비교",
    //   icon: BarChart3,
    //   isActive: location === "/comparison",
    // },
  ];

  const NavContent = () => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href}>
            <Button
              variant={item.isActive ? "default" : "ghost"}
              className="w-full justify-start"
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        );
      })}
    </>
  );

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href={getCurrentLanguage() === 'EN' ? '/en' : '/kr'}>
              <h1 className="text-xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="mr-2 h-6 w-6 text-primary" />
                {getCurrentLanguage() === 'EN' ? 'Dividend Reinvestment Calculator' : '배당 재투자 계산기'}
              </h1>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Globe className="mr-2 h-4 w-4" />
                  {getCurrentLanguage()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={getLanguageRedirect('kr')}>
                    🇰🇷 한국어
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={getLanguageRedirect('en')}>
                    🇺🇸 English
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop Navigation - Hidden when no nav items */}
          {navItems.length > 0 && (
            <div className="hidden md:flex items-center space-x-4">
              <NavContent />
            </div>
          )}

          {/* Mobile Navigation - Hidden when no nav items */}
          {navItems.length > 0 && (
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <div className="flex flex-col space-y-4 mt-4">
                    <NavContent />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}