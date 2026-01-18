import { Link, useLocation } from "wouter";
import { BarChart3, Menu, Globe, Target, BookOpen, TrendingUp, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
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

  const menuItems = [
    {
      href: locale,
      label: isEnglish ? 'Reinvestment Calculator' : '재투자 계산기',
      icon: TrendingUp,
      isActive: location === "/" || location === "/kr" || location === "/en" || location === "/calculator"
    },
    {
      href: `${locale}/goal`,
      label: isEnglish ? 'Goal Calculator' : '목표 배당금 계산기',
      icon: Target,
      isActive: location.includes('/goal')
    }
  ];

  const guideHref = `${locale}/guide`;
  const isGuideActive = location.includes('/guide');

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href={locale}>
              <h1 className="text-xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="mr-2 h-6 w-6 text-primary" />
                <span className="hidden sm:inline">
                  {isEnglish ? 'Dividend Calculator' : '배당 계산기'}
                </span>
              </h1>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            {/* Guide Button */}
            <Link href={guideHref}>
              <Button 
                variant={isGuideActive ? "default" : "ghost"} 
                size="sm"
                className="gap-1"
              >
                <HelpCircle className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {isEnglish ? 'Guide' : '가이드'}
                </span>
              </Button>
            </Link>

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
                    한국어
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={getLanguageRedirect('en')}>
                    English
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Menu Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetTitle className="sr-only">메뉴</SheetTitle>
                <div className="flex flex-col space-y-2 mt-6">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.href} href={item.href}>
                        <Button
                          variant={item.isActive ? "default" : "ghost"}
                          className="w-full justify-start"
                        >
                          <Icon className="mr-3 h-5 w-5" />
                          {item.label}
                        </Button>
                      </Link>
                    );
                  })}
                  <Link href={guideHref}>
                    <Button
                      variant={isGuideActive ? "default" : "ghost"}
                      className="w-full justify-start"
                    >
                      <BookOpen className="mr-3 h-5 w-5" />
                      {isEnglish ? 'Usage Guide' : '사용 가이드'}
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}