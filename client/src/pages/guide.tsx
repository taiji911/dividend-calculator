import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calculator, 
  Target, 
  BookOpen, 
  Users, 
  ArrowRight, 
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Lightbulb,
  TrendingUp,
  Repeat,
  Snowflake
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Guide() {
  const [location] = useLocation();
  const isEnglish = location.startsWith('/en');

  const reinvestHref = isEnglish ? "/en" : "/kr";
  const goalHref = isEnglish ? "/en/goal" : "/goal";
  const snowballHref = isEnglish ? "/en/snowball" : "/snowball";

  useEffect(() => {
    if (isEnglish) {
      document.title = "Dividend Calculator Guide | How to Use";
      document.documentElement.lang = "en";
      
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', 'Learn how to use the dividend reinvestment calculator and dividend goal calculator. Understand input values, result interpretation, and important assumptions.');
      }

      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', 'Dividend Calculator Guide | How to Use');
      }

      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', 'Learn how to use the dividend reinvestment calculator and dividend goal calculator. Understand input values, result interpretation, and important assumptions.');
      }
    } else {
      document.title = "배당 계산기 사용 가이드 | 배당 재투자·목표 배당금 계산 방법";
      document.documentElement.lang = "ko";
      
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', '배당 재투자 계산기와 목표 배당금 계산기를 언제·어떻게 활용하는지, 입력값과 결과 해석, 가정과 한계를 정리한 사용 가이드입니다.');
      }

      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute('content', '배당 계산기 사용법, 배당 재투자 계산기, 목표 배당금 계산기, DRIP 계산, 배당 투자 가이드');
      }

      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', '배당 계산기 사용 가이드 | 배당 재투자·목표 배당금 계산 방법');
      }

      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', '배당 재투자 계산기와 목표 배당금 계산기를 언제·어떻게 활용하는지, 입력값과 결과 해석, 가정과 한계를 정리한 사용 가이드입니다.');
      }
    }
  }, [isEnglish]);

  const t = {
    title: isEnglish ? "Dividend Calculator Usage Guide" : "배당 계산기 사용 가이드",
    subtitle: isEnglish 
      ? "Learn how to properly use the Dividend Reinvestment Calculator and Dividend Goal Calculator, and understand the assumptions and limitations when interpreting results."
      : "배당 재투자 계산기와 목표 배당금 계산기를 올바르게 사용하는 방법과, 결과를 해석할 때 필요한 가정/한계를 정리했습니다.",
    
    section1: {
      title: isEnglish ? "For Those Interested in Dividend Investing" : "배당 투자에 관심있는 분들께",
      content: isEnglish ? [
        "This guide is for users interested in dividend investing who want to understand how these calculators work.",
        "The calculators are tools for simulating scenarios and understanding potential outcomes based on your assumptions. They are not investment advice.",
        "Whether you're exploring dividend investing for the first time or refining your strategy, this guide will help you use the calculators effectively."
      ] : [
        "이 가이드는 배당 투자에 관심이 있고, 계산기를 활용해 다양한 시나리오를 검토하고자 하는 분을 위해 작성되었습니다.",
        "본 계산기는 시뮬레이션 도구이며, 특정 투자 전략이나 종목을 추천하지 않습니다. 결과는 사용자가 입력한 가정에 따라 달라집니다.",
        "배당 투자를 처음 접하시는 분이나, 기존 전략을 점검하고 싶은 분 모두 이 가이드가 도움이 될 수 있습니다."
      ]
    },

    section2: {
      title: isEnglish ? "Three Calculators at a Glance" : "계산기 3종 한눈에 보기",
      reinvest: {
        title: isEnglish ? "Dividend Reinvestment Calculator" : "배당 재투자 계산기",
        when: isEnglish ? "When to use" : "언제 사용하나요?",
        whenContent: isEnglish 
          ? "When you want to see how your investment might grow over time with dividend reinvestment (DRIP)."
          : "배당금을 재투자했을 때 장기적으로 자산이 어떻게 변화하는지 시뮬레이션하고 싶을 때 사용합니다.",
        what: isEnglish ? "What it shows" : "무엇을 보여주나요?",
        whatContent: isEnglish
          ? "Long-term projections of asset growth, cumulative dividends, and the effect of reinvesting dividends vs. not reinvesting."
          : "연도별 자산 변화, 누적 배당금, 재투자 여부에 따른 차이를 보여줍니다.",
        cta: isEnglish ? "Go to Reinvestment Calculator" : "배당 재투자 계산기 바로가기"
      },
      goal: {
        title: isEnglish ? "Dividend Goal Calculator" : "목표 배당금 계산기",
        when: isEnglish ? "When to use" : "언제 사용하나요?",
        whenContent: isEnglish
          ? "When you have a target monthly dividend in mind and want to know how much you need to invest."
          : "목표 월 배당금을 정해두고, 필요한 투자 원금을 역산하고 싶을 때 사용합니다.",
        what: isEnglish ? "What it shows" : "무엇을 보여주나요?",
        whatContent: isEnglish
          ? "The required investment amount to achieve your target monthly dividend, considering tax rates."
          : "목표 월 배당금을 받기 위해 필요한 투자금을 세금을 고려하여 계산합니다.",
        cta: isEnglish ? "Go to Goal Calculator" : "목표 배당금 계산기 바로가기"
      },
      snowball: {
        title: isEnglish ? "Dividend Snowball Simulator" : "배당 스노우볼 시뮬레이터",
        when: isEnglish ? "When to use" : "언제 사용하나요?",
        whenContent: isEnglish
          ? "When you want to find out when your annual dividends will exceed your annual contributions—the 'snowball transition point'."
          : "연 배당금이 연간 투자금을 초과하는 '스노우볼 전환점'이 언제인지 확인하고 싶을 때 사용합니다.",
        what: isEnglish ? "What it shows" : "무엇을 보여주나요?",
        whatContent: isEnglish
          ? "The year when dividends start exceeding your contributions, with a visual chart showing the transition point."
          : "배당금이 투자금을 넘는 시점과 연도별 추이를 차트로 보여줍니다.",
        cta: isEnglish ? "Go to Snowball Simulator" : "배당 스노우볼 시뮬레이터 바로가기"
      }
    },

    section3: {
      title: isEnglish ? "How to Use the Reinvestment Calculator" : "배당 재투자 계산기 사용 방법",
      inputsTitle: isEnglish ? "Key Inputs" : "주요 입력값",
      inputs: isEnglish ? [
        "Initial Investment: The amount you start with",
        "Monthly Contribution: Additional amount invested each month",
        "Dividend Yield: Expected annual dividend rate (as a percentage)",
        "Dividend Growth Rate: How much dividends might grow each year",
        "Investment Period: How many years to simulate",
        "Reinvest Dividends: Whether to reinvest dividends or not"
      ] : [
        "초기 투자금: 처음 투자하는 금액",
        "월 추가 투자금: 매월 추가로 투자하는 금액",
        "배당률: 연간 예상 배당 수익률 (%)",
        "배당 성장률: 배당금이 매년 얼마나 증가하는지 (%)",
        "투자 기간: 몇 년간 시뮬레이션할지",
        "배당금 재투자: 배당금을 다시 투자할지 여부"
      ],
      checkTitle: isEnglish ? "Key Points to Check" : "결과를 볼 때 체크할 포인트",
      checkPoints: isEnglish ? [
        "Your assumptions (dividend yield, growth rate, contributions) directly determine the results. Small changes can lead to large differences over time.",
        "Compare results with reinvestment ON vs. OFF to see the compound effect.",
        "Longer time periods amplify the impact of your assumptions—small differences in rates can result in significantly different outcomes.",
        "The results are projections, not guarantees. Actual returns depend on market conditions.",
        "Consider testing multiple scenarios with different assumptions to understand the range of possible outcomes."
      ] : [
        "입력한 가정(배당률, 성장률, 추가투자)이 결과를 좌우합니다. 작은 차이도 장기적으로는 큰 차이를 만들 수 있습니다.",
        "재투자 ON/OFF를 비교해 복리 효과의 차이를 확인하세요.",
        "투자 기간이 길수록 가정의 작은 차이가 크게 벌어질 수 있습니다.",
        "결과는 시뮬레이션이며, 실제 수익은 시장 상황에 따라 달라집니다.",
        "다양한 시나리오를 테스트해 가능한 결과의 범위를 이해하세요."
      ]
    },

    section4: {
      title: isEnglish ? "How to Use the Goal Calculator" : "목표 배당금 계산기 사용 방법",
      simpleTitle: isEnglish ? "Simple Calculation" : "단순 계산",
      simpleContent: isEnglish
        ? "Required Investment = (Target Monthly Dividend × 12) ÷ (Dividend Yield × (1 - Tax Rate))"
        : "필요 투자금 = (목표 월 배당금 × 12개월) ÷ (배당률 × (1 - 세율))",
      simpleNote: isEnglish
        ? "Note: The dividend yield is a value you assume. It is not fixed or guaranteed by any investment."
        : "참고: 배당률은 사용자가 가정한 값이며, 어떤 투자에서도 고정되거나 보장되지 않습니다.",
      taxTitle: isEnglish ? "Tax Options" : "세금 옵션",
      taxContent: isEnglish ? [
        "Tax-free: For tax-advantaged accounts (0%)",
        "Korea: Standard Korean tax rate (15.4%)",
        "US: Treaty rate for US stocks (15%)",
        "Custom: Enter your own tax rate"
      ] : [
        "비과세: ISA, 연금저축 등 비과세 계좌 (0%)",
        "한국 일반계좌: 배당소득세 포함 (15.4%)",
        "미국 주식: 조세조약 세율 (15%)",
        "직접 입력: 원하는 세율을 직접 입력"
      ]
    },

    section5: {
      title: isEnglish ? "Recommended Workflow: Using Both Calculators" : "두 계산기를 함께 쓰는 추천 흐름",
      steps: isEnglish ? [
        {
          title: "Step 1: Set Your Goal",
          content: "Use the Goal Calculator to find out how much you need to invest to receive your target monthly dividend."
        },
        {
          title: "Step 2: Check Your Progress",
          content: "Use the Reinvestment Calculator to see how long it might take to reach your goal with your current strategy."
        },
        {
          title: "Step 3: Adjust and Compare",
          content: "Try different scenarios by adjusting dividend yield, investment period, or monthly contributions to see how they affect your timeline."
        }
      ] : [
        {
          title: "1단계: 목표 설정",
          content: "목표 배당금 계산기로 목표 월 배당금을 받으려면 얼마가 필요한지 확인합니다."
        },
        {
          title: "2단계: 현재 전략 점검",
          content: "배당 재투자 계산기로 현재 전략으로 목표에 도달하는 데 얼마나 걸릴지 확인합니다."
        },
        {
          title: "3단계: 가정 조정 및 비교",
          content: "배당률, 투자 기간, 월 추가투자 등을 조정하며 여러 시나리오를 비교해 현실감을 점검합니다."
        }
      ]
    },

    section6: {
      title: isEnglish ? "Assumptions and Limitations" : "가정과 한계",
      subtitle: isEnglish 
        ? "Please read these important notes before using the calculators"
        : "계산기 사용 전에 반드시 읽어주세요",
      items: isEnglish ? [
        {
          title: "Dividends Can Change",
          content: "Dividend amounts and yields can increase, decrease, or be suspended entirely depending on company performance, policy changes, and market conditions."
        },
        {
          title: "Price Changes Not Fully Reflected",
          content: "The calculators may simplify or not reflect stock price changes and capital gains/losses. Results focus on dividend income projections."
        },
        {
          title: "Taxes and Fees May Vary",
          content: "Individual tax situations, transaction fees, exchange rates, and other costs vary by person and are not fully reflected in the calculations."
        },
        {
          title: "Not Investment Advice",
          content: "These tools are for educational and planning purposes only. They do not constitute investment advice. Always consult a qualified financial advisor before making investment decisions."
        },
        {
          title: "Assumptions Drive Results",
          content: "The outputs are only as accurate as your assumptions. Test multiple scenarios to understand the range of possible outcomes."
        }
      ] : [
        {
          title: "배당금/배당률은 변동될 수 있습니다",
          content: "배당금은 기업 실적, 정책 변화, 시장 환경에 따라 증가하거나 감소할 수 있으며, 경우에 따라 배당이 중단될 수도 있습니다."
        },
        {
          title: "주가 변동은 단순화되어 있습니다",
          content: "본 계산기는 주가 변동 및 자본손익을 단순화하거나 반영하지 않을 수 있습니다. 결과는 배당 수입 추정에 초점을 맞추고 있습니다."
        },
        {
          title: "세금 및 수수료는 개인마다 다릅니다",
          content: "개인별 세금 상황, 거래 수수료, 환율, 기타 비용은 사람마다 다르며, 계산에 완전히 반영되지 않습니다."
        },
        {
          title: "투자 조언이 아닙니다",
          content: "본 도구는 교육 및 계획 목적으로만 제공됩니다. 투자 조언에 해당하지 않습니다. 투자 결정 전에 항상 전문 금융 상담사와 상담하시기 바랍니다."
        },
        {
          title: "가정이 결과를 결정합니다",
          content: "결과의 정확도는 입력한 가정에 따라 달라집니다. 여러 시나리오를 테스트하여 가능한 결과의 범위를 이해하세요."
        }
      ]
    },

    section7: {
      title: isEnglish ? "Frequently Asked Questions" : "자주 묻는 질문",
      faqs: isEnglish ? [
        {
          q: "What dividend yield should I use?",
          a: "Use a realistic estimate based on the investment you're considering. For reference, many dividend ETFs have yields between 2-5%, while high-yield investments may be higher but carry more risk. Past yields don't guarantee future results."
        },
        {
          q: "Are taxes included in the calculation?",
          a: "The Goal Calculator includes tax rate options. The Reinvestment Calculator also has tax settings. However, individual tax situations vary, so results should be treated as estimates."
        },
        {
          q: "Can I use this for both ETFs and individual stocks?",
          a: "Yes, the calculators work with any dividend-paying investment. However, individual stocks may have more variable dividend payments than diversified ETFs."
        },
        {
          q: "What's the difference between reinvesting dividends ON vs. OFF?",
          a: "When ON, dividends are used to buy more shares, potentially increasing future dividends (compound effect). When OFF, dividends are taken as cash income without adding to your investment."
        },
        {
          q: "Why might my results differ from reality?",
          a: "Results are projections based on your assumptions. Actual outcomes depend on market conditions, company decisions, timing, fees, and many other factors that cannot be predicted."
        }
      ] : [
        {
          q: "배당률은 어떤 값을 넣어야 하나요?",
          a: "고려 중인 투자 상품에 기반한 현실적인 추정치를 사용하세요. 참고로 많은 배당 ETF는 2-5% 사이의 배당률을 가지며, 고배당 투자는 더 높을 수 있지만 리스크도 큽니다. 과거 배당률이 미래 결과를 보장하지 않습니다."
        },
        {
          q: "세금이 반영되나요?",
          a: "목표 배당금 계산기에는 세율 옵션이 포함되어 있습니다. 재투자 계산기에도 세금 설정이 있습니다. 다만 개인별 세금 상황은 다르므로 결과는 추정치로 취급해야 합니다."
        },
        {
          q: "ETF와 개별주 모두 사용할 수 있나요?",
          a: "네, 배당을 지급하는 모든 투자에 사용할 수 있습니다. 다만 개별주는 분산된 ETF보다 배당금 변동성이 클 수 있습니다."
        },
        {
          q: "재투자 ON/OFF는 어떤 차이가 있나요?",
          a: "ON이면 배당금으로 추가 주식을 매수하여 미래 배당금이 늘어날 수 있습니다(복리 효과). OFF면 배당금을 현금 수입으로 받고 투자에 추가하지 않습니다."
        },
        {
          q: "결과가 실제와 다른 이유는 무엇인가요?",
          a: "결과는 입력한 가정에 기반한 추정입니다. 실제 결과는 시장 상황, 기업 결정, 타이밍, 수수료 등 예측할 수 없는 많은 요인에 따라 달라집니다."
        }
      ]
    },

    section8: {
      title: isEnglish ? "Start Calculating" : "지금 계산해보세요",
      reinvestCta: isEnglish ? "Dividend Reinvestment Calculator" : "배당 재투자 계산기",
      goalCta: isEnglish ? "Dividend Goal Calculator" : "목표 배당금 계산기"
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
        <p className="text-gray-600">{t.subtitle}</p>
      </div>

      {/* ADSENSE_SLOT_TOP */}

      {/* Section 1: Who is this guide for? */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t.section1.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {t.section1.content.map((paragraph, index) => (
            <p key={index} className="text-gray-700">{paragraph}</p>
          ))}
        </CardContent>
      </Card>

      {/* Section 2: Two Calculators at a Glance */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calculator className="h-6 w-6" />
          {t.section2.title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                {t.section2.reinvest.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{t.section2.reinvest.when}</h4>
                <p className="text-gray-600 text-sm">{t.section2.reinvest.whenContent}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{t.section2.reinvest.what}</h4>
                <p className="text-gray-600 text-sm">{t.section2.reinvest.whatContent}</p>
              </div>
              <Link href={reinvestHref}>
                <Button className="w-full mt-4">
                  {t.section2.reinvest.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                {t.section2.goal.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{t.section2.goal.when}</h4>
                <p className="text-gray-600 text-sm">{t.section2.goal.whenContent}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{t.section2.goal.what}</h4>
                <p className="text-gray-600 text-sm">{t.section2.goal.whatContent}</p>
              </div>
              <Link href={goalHref}>
                <Button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white">
                  {t.section2.goal.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 border-cyan-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Snowflake className="h-5 w-5 text-cyan-600" />
                {t.section2.snowball.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{t.section2.snowball.when}</h4>
                <p className="text-gray-600 text-sm">{t.section2.snowball.whenContent}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{t.section2.snowball.what}</h4>
                <p className="text-gray-600 text-sm">{t.section2.snowball.whatContent}</p>
              </div>
              <Link href={snowballHref}>
                <Button className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700 text-white">
                  {t.section2.snowball.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 3: How to Use the Reinvestment Calculator */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5" />
            {t.section3.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">{t.section3.inputsTitle}</h4>
            <ul className="space-y-2">
              {t.section3.inputs.map((input, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  {input}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">{t.section3.checkTitle}</h4>
            <ul className="space-y-2">
              {t.section3.checkPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <Lightbulb className="h-4 w-4 text-yellow-500 mt-1 flex-shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: How to Use the Goal Calculator */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {t.section4.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">{t.section4.taxTitle}</h4>
            <ul className="space-y-2">
              {t.section4.taxContent.map((tax, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <CheckCircle className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                  {tax}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Section 5: Recommended Workflow */}
      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            {t.section5.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {t.section5.steps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{step.title}</h4>
                  <p className="text-gray-600 text-sm">{step.content}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 6: Assumptions and Limitations */}
      <Card className="mb-8 border-2 border-yellow-200 bg-yellow-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <AlertTriangle className="h-5 w-5" />
            {t.section6.title}
          </CardTitle>
          <p className="text-sm text-yellow-700">{t.section6.subtitle}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.section6.items.map((item, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-gray-600 text-sm">{item.content}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 7: FAQ */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            {t.section7.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {t.section7.faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Section 8: CTA */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">{t.section8.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href={reinvestHref}>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-primary/20 hover:border-primary/40">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t.section8.reinvestCta}</h3>
                <Button className="mt-4">
                  {isEnglish ? "Start Calculating" : "계산 시작하기"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href={goalHref}>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-green-200 hover:border-green-400">
              <CardContent className="p-6 text-center">
                <Target className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t.section8.goalCta}</h3>
                <Button variant="outline" className="mt-4 border-green-300 text-green-700 hover:bg-green-50">
                  {isEnglish ? "Start Calculating" : "계산 시작하기"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* ADSENSE_SLOT_BOTTOM */}
    </div>
  );
}
