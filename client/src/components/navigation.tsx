import { Link, useLocation } from "wouter";
import { BarChart3, Menu, Globe, Target, BookOpen, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
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
    },
    {
      href: `${locale}/guide`,
      label: isEnglish ? 'Usage Guide' : '사용 가이드',
      icon: BookOpen,
      isActive: location.includes('/guide')
    }
  ];

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
            {/* Menu Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="mr-2 h-4 w-4" />
                  {isEnglish ? 'Menu' : '메뉴'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className={item.isActive ? 'bg-gray-100' : ''}>
                        <Icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

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
          </div>
        </div>
      </div>
    </nav>
  );
}