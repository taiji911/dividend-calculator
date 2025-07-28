import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Calculator from "@/pages/calculator";
import Comparison from "@/pages/comparison";
import Navigation from "@/components/navigation";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Calculator} />
      <Route path="/calculator" component={Calculator} />
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
