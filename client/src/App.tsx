import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Calculator from "@/pages/calculator";
import CalculatorKR from "@/pages/calculator-kr";
import CalculatorEN from "@/pages/calculator-en";
import Comparison from "@/pages/comparison";
import FireCalculator from "@/pages/fire-calculator";
import GoalCalculator from "@/pages/goal-calculator";
import Guide from "@/pages/guide";

import Navigation from "@/components/navigation";

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
      <Route path="/fire" component={FireCalculator} />
      <Route path="/kr/fire" component={FireCalculator} />
      <Route path="/en/fire" component={FireCalculator} />
      <Route path="/guide" component={Guide} />
      <Route path="/kr/guide" component={Guide} />
      <Route path="/en/guide" component={Guide} />
      
      {/* <Route path="/comparison" component={Comparison} /> */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <Navigation />
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
