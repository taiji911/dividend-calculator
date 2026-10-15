import { Switch, Route, Router as WouterRouter } from "wouter";
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
import EtfDetail from "@/pages/etf-detail";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

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
        <div className="flex min-h-screen flex-col">
          <Navigation />
          <main className="flex-1">
            <Router />
          </main>
          <Footer />
        </div>
      </TooltipProvider>
    </WouterRouter>
  );
}

export default App;
