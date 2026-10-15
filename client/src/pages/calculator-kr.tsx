import { useEffect } from "react";
import { ReinvestPage } from "@/pages/calculator";

export default function CalculatorKR() {
  useEffect(() => {
    // Update page title and meta tags for Korean version
    document.title = "배당 재투자 계산기 | DRIP 복리 계산";
    document.documentElement.lang = "ko";
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', '배당 재투자(DRIP)를 통한 장기 투자 수익률을 계산하고 시뮬레이션해보세요. 한국과 미국 주식의 세율을 고려한 정확한 계산기입니다.');
    }

    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', '배당, 재투자, DRIP, 복리, 투자 계산기, 배당 수익률, 주식 투자, 세율 계산');
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', '배당 재투자 계산기 | DRIP 복리 계산');
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', '배당 재투자(DRIP)를 통한 장기 투자 수익률을 계산하고 시뮬레이션해보세요. 한국과 미국 주식의 세율을 고려한 정확한 계산기입니다.');
    }
  }, []);

  return <ReinvestPage lang="kr" />;
}
