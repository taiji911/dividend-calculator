import { useEffect } from "react";
import { ReinvestPage } from "@/pages/calculator";

export default function CalculatorEN() {
  useEffect(() => {
    // Update page title and meta tags for English version
    document.title = "Dividend Reinvestment Calculator | DRIP Compound Growth";
    document.documentElement.lang = "en";
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Calculate and simulate long-term investment returns through dividend reinvestment (DRIP). Accurate calculator considering tax rates for Korean and US stocks.');
    }

    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 'dividend, reinvestment, DRIP, compound interest, investment calculator, dividend yield, stock investment, tax calculation');
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', 'Dividend Reinvestment Calculator | DRIP Compound Growth');
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', 'Calculate and simulate long-term investment returns through dividend reinvestment (DRIP). Accurate calculator considering tax rates for Korean and US stocks.');
    }
  }, []);

  return <ReinvestPage lang="en" />;
}
