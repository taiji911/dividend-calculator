// 다국어 지원을 위한 언어 설정
export type Language = 'kr' | 'en';

export interface Translations {
  title: string;
  subtitle: string;
  calculator: {
    title: string;
    initialInvestment: string;
    monthlyInvestment: string;
    investmentPeriod: string;
    dividendYield: string;
    dividendGrowthRate: string;
    dripEnabled: string;
    taxSettings: string;
    taxCountry: string;
    taxType: string;
    currency: string;
    calculateButton: string;
    results: {
      totalAssets: string;
      cumulativeDividends: string;
      annualDividends: string;
      yearlyResults: string;
      year: string;
      assets: string;
      yearlyDividend: string;
      holdingAssets: string;
      cumulativeDividend: string;
    };
    placeholders: {
      initialAmount: string;
      monthlyAmount: string;
      years: string;
      yieldPercent: string;
      growthPercent: string;
    };
    options: {
      korea: string;
      us: string;
      taxable: string;
      taxFree: string;
      isa: string;
    };
    presets: {
      conservative: string;
      moderate: string;
      growth: string;
    };
    benefits: {
      title: string;
      compound: {
        title: string;
        description: string;
      };
      cost: {
        title: string;
        description: string;
      };
      automatic: {
        title: string;
        description: string;
      };
      growth: {
        title: string;
        description: string;
      };
    };
  };
  disclaimer: {
    title: string;
    content: string;
  };
}

export const translations: Record<Language, Translations> = {
  kr: {
    title: '배당 재투자 계산기',
    subtitle: '배당금 재투자를 통한 복리 효과를 시뮬레이션해보세요',
    calculator: {
      title: '투자 조건 설정',
      initialInvestment: '초기 투자금',
      monthlyInvestment: '월 투자금',
      investmentPeriod: '투자 기간',
      dividendYield: '시가 배당률',
      dividendGrowthRate: '배당 성장률',
      dripEnabled: '배당 재투자 (DRIP)',
      taxSettings: '세금 설정',
      taxCountry: '투자 국가',
      taxType: '계좌 유형',
      currency: '화폐',
      calculateButton: '계산하기',
      results: {
        totalAssets: '총 자산',
        cumulativeDividends: '누적 배당금',
        annualDividends: '연간 배당금',
        yearlyResults: '연도별 상세 결과',
        year: '연도',
        assets: '총 자산',
        yearlyDividend: '연초 배당금',
        holdingAssets: '연말 보유 자산',
        cumulativeDividend: '누적 배당금',
      },
      placeholders: {
        initialAmount: '초기 투자 금액을 입력하세요',
        monthlyAmount: '매월 투자할 금액을 입력하세요',
        years: '투자 기간 (년)',
        yieldPercent: '배당 수익률 (%)',
        growthPercent: '연간 배당 성장률 (%)',
      },
      options: {
        korea: '한국',
        us: '미국',
        taxable: '일반 과세',
        taxFree: '비과세',
        isa: 'ISA',
      },
      presets: {
        conservative: '안정형 (3%, 3%)',
        moderate: '균형형 (4%, 5%)',
        growth: '성장형 (5%, 7%)',
      },
      benefits: {
        title: '배당 재투자의 장점',
        compound: {
          title: '복리 효과',
          description: '배당금을 재투자하여 복리 수익 창출',
        },
        cost: {
          title: '비용 절약',
          description: '자동 재투자로 거래 수수료 최소화',
        },
        automatic: {
          title: '자동화',
          description: '별도 관리 없이 자동으로 재투자 실행',
        },
        growth: {
          title: '장기 성장',
          description: '시간이 지날수록 가속화되는 자산 증가',
        },
      },
    },
    disclaimer: {
      title: '투자 위험 고지',
      content: '이 계산기는 교육 목적으로 제작되었으며, 실제 투자 결과를 보장하지 않습니다. 투자 결정 시 전문가와 상담하시기 바랍니다.',
    },
  },
  en: {
    title: 'Dividend Reinvestment Calculator',
    subtitle: 'Simulate the compound effects of dividend reinvestment',
    calculator: {
      title: 'Investment Settings',
      initialInvestment: 'Initial Investment',
      monthlyInvestment: 'Monthly Investment',
      investmentPeriod: 'Investment Period',
      dividendYield: 'Dividend Yield',
      dividendGrowthRate: 'Dividend Growth Rate',
      dripEnabled: 'Dividend Reinvestment (DRIP)',
      taxSettings: 'Tax Settings',
      taxCountry: 'Investment Country',
      taxType: 'Account Type',
      currency: 'Currency',
      calculateButton: 'Calculate',
      results: {
        totalAssets: 'Total Assets',
        cumulativeDividends: 'Cumulative Dividends',
        annualDividends: 'Annual Dividends',
        yearlyResults: 'Yearly Detailed Results',
        year: 'Year',
        assets: 'Total Assets',
        yearlyDividend: 'Annual Dividend',
        holdingAssets: 'Holding Assets',
        cumulativeDividend: 'Cumulative Dividends',
      },
      placeholders: {
        initialAmount: 'Enter initial investment amount',
        monthlyAmount: 'Enter monthly investment amount',
        years: 'Investment period (years)',
        yieldPercent: 'Dividend yield (%)',
        growthPercent: 'Annual dividend growth rate (%)',
      },
      options: {
        korea: 'Korea',
        us: 'United States',
        taxable: 'Taxable',
        taxFree: 'Tax-Free',
        isa: 'ISA',
      },
      presets: {
        conservative: 'Conservative (3%, 3%)',
        moderate: 'Moderate (4%, 5%)',
        growth: 'Growth (5%, 7%)',
      },
      benefits: {
        title: 'Benefits of Dividend Reinvestment',
        compound: {
          title: 'Compound Effect',
          description: 'Generate compound returns by reinvesting dividends',
        },
        cost: {
          title: 'Cost Savings',
          description: 'Minimize transaction fees through automatic reinvestment',
        },
        automatic: {
          title: 'Automation',
          description: 'Automatic reinvestment without manual management',
        },
        growth: {
          title: 'Long-term Growth',
          description: 'Accelerated asset growth over time',
        },
      },
    },
    disclaimer: {
      title: 'Investment Risk Disclosure',
      content: 'This calculator is for educational purposes only and does not guarantee actual investment results. Please consult with professionals before making investment decisions.',
    },
  },
};

export const currencyOptions = {
  USD: { symbol: '$', name: 'US Dollar', decimals: 2 },
  EUR: { symbol: '€', name: 'Euro', decimals: 2 },
  GBP: { symbol: '£', name: 'British Pound', decimals: 2 },
  JPY: { symbol: '¥', name: 'Japanese Yen', decimals: 0 },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', decimals: 2 },
  AUD: { symbol: 'A$', name: 'Australian Dollar', decimals: 2 },
  CHF: { symbol: 'CHF', name: 'Swiss Franc', decimals: 2 },
  KRW: { symbol: '₩', name: 'Korean Won', decimals: 0 },
};

export function getTranslation(language: Language): Translations {
  return translations[language];
}

export function getCurrentLanguage(): Language {
  const path = window.location.pathname;
  if (path.startsWith('/en')) return 'en';
  return 'kr';
}

export function formatCurrencyByLanguage(amount: number, language: Language, currency?: string): string {
  if (language === 'kr') {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(amount);
  } else {
    const currencyCode = currency || 'USD';
    const currencyInfo = currencyOptions[currencyCode as keyof typeof currencyOptions];
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: currencyInfo?.decimals || 2,
    }).format(amount);
  }
}