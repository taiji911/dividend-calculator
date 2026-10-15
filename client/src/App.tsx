import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Calculator from "@/pages/calculator";
import CalculatorKR from "@/pages/calculator-kr";
import CalculatorEN from "@/pages/calculator-en";
import GoalCalculator from "@/pages/goal-calculator";
import Guide from "@/pages/guide";
import SnowballSimulator from "@/pages/snowball-simulator";
import TaxCalculator from "@/pages/tax-calculator";
import AccountCompare from "@/pages/account-compare";
import EtfIndex from "@/pages/etf-index";
import DividendCalendar from "@/pages/dividend-calendar";
import { LearnIndex, LearnArticle } from "@/pages/learn";
import EtfDetail from "@/pages/etf-detail";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import ErrorBoundary from "@/components/error-boundary";

/** 다른 페이지로 넘어가면 맨 위에서 시작해요 (#으로 같은 페이지 안을 이동할 때는 그대로) */
function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    if (window.location.hash) return;
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

/** 페이지가 바뀌면 오류 표시를 초기화해요 */
function SafeRouter() {
  const [location] = useLocation();
  return (
    <ErrorBoundary key={location}>
      <Router />
    </ErrorBoundary>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Calculator} />
      <Route path="/kr" component={CalculatorKR} />
      <Route path="/en" component={CalculatorEN} />
      <Route path="/calculator" component={Calculator} />
      <Route path="/goal" component={GoalCalculator} />
      <Route path="/kr/goal" component={GoalCalculator} />
      <Route path="/en/goal" component={GoalCalculator} />
      <Route path="/guide" component={Guide} />
      <Route path="/kr/guide" component={Guide} />
      <Route path="/en/guide" component={Guide} />
      <Route path="/snowball" component={SnowballSimulator} />
      <Route path="/kr/snowball" component={SnowballSimulator} />
      <Route path="/en/snowball" component={SnowballSimulator} />
      <Route path="/tax" component={TaxCalculator} />
      <Route path="/compare" component={AccountCompare} />
      <Route path="/calendar" component={DividendCalendar} />
      <Route path="/learn" component={LearnIndex} />
      <Route path="/learn/:slug" component={LearnArticle} />
      <Route path="/etf" component={EtfIndex} />
      <Route path="/etf/:slug" component={EtfDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

/** ssrPath: 빌드 때 페이지별 HTML을 미리 만들 때만 넘겨요 */
function App({ ssrPath }: { ssrPath?: string }) {
  return (
    <WouterRouter ssrPath={ssrPath}>
      <TooltipProvider>
        <ScrollToTop />
        <div className="flex min-h-screen flex-col">
          <Navigation />
          <main className="flex-1">
            <SafeRouter />
          </main>
          <Footer />
        </div>
      </TooltipProvider>
    </WouterRouter>
  );
}

export default App;
