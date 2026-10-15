/**
 * 페이지별 자주 묻는 질문 — 화면(PageContent)과 검색용 구조화 데이터(FAQPage)가 함께 써요.
 * 기준: 2026년 10월 세법
 */
import type { SeoKey, Lang } from "@/lib/seo";

export interface Faq {
  q: string;
  a: string;
}

export const FAQ: Partial<Record<SeoKey, Partial<Record<Lang, Faq[]>>>> = {
  reinvest: {
    ko: [
      {
        q: "배당 재투자(DRIP)란 무엇인가요?",
        a: "받은 배당금을 현금으로 쓰지 않고 그 돈으로 같은 주식이나 ETF를 다시 사는 방법이에요. 주식 수가 늘어나면 다음 배당도 커지고, 늘어난 배당으로 또 주식을 사면서 복리 효과가 생겨요.",
      },
      {
        q: "시가 배당률과 배당 성장률은 어디서 확인하나요?",
        a: "시가 배당률은 증권사 앱이나 ETF 운용사 홈페이지의 '배당수익률·분배율'에서 볼 수 있어요. 배당 성장률은 최근 5~10년 동안 주당 배당금이 1년에 평균 몇 % 늘었는지 보면 돼요. 과거 성장률은 미래를 보장하지 않으니 조금 낮춰서 넣는 걸 추천해요.",
      },
      {
        q: "배당 성장률과 주가 상승률은 왜 따로 넣나요?",
        a: "주가와 배당금은 따로 움직이기 때문이에요. 배당 성장률이 주가 상승률보다 높으면 시가 배당률이 점점 올라가고, 재투자할 때 같은 돈으로 더 많은 배당을 사게 돼요. 두 값을 같게 넣으면 배당률이 일정하게 유지된다고 가정하는 셈이에요.",
      },
      {
        q: "ISA나 연금저축으로 투자하면 결과가 어떻게 달라지나요?",
        a: "일반계좌는 배당을 받을 때마다 15.4%가 떼여 재투자 금액이 줄어요. ISA는 기간 중 세금 없이 굴리고 만기 때 순이익 200만원(서민형 400만원)을 넘는 부분에만 9.9%를 내요. 연금저축·IRP는 세금을 연금으로 받을 때까지 미루고, 받을 때 3.3~5.5%를 내요. 계좌·세금 메뉴에서 바꿔 보면 차이를 바로 확인할 수 있어요.",
      },
      {
        q: "미국 주식 배당은 세금이 어떻게 되나요?",
        a: "미국에서 15%가 원천징수되고, 한국 배당소득세율(14%)보다 높아서 국내에서 추가로 떼지는 않아요. 다만 국내외 이자·배당을 합쳐 1년에 2,000만원을 넘으면 다음 해 5월에 종합소득세 신고를 해야 해요.",
      },
      {
        q: "계산 결과대로 자산이 불어날까요?",
        a: "아니요, 입력한 가정이 매년 똑같이 이어진다고 보고 계산한 추정치예요. 실제로는 주가가 오르내리고 배당이 줄거나 멈출 수도 있어요. 보수적인 값으로 한 번, 기대하는 값으로 한 번 계산해서 범위를 보는 데 활용해 주세요.",
      },
    ],
    en: [
      {
        q: "What is dividend reinvestment (DRIP)?",
        a: "Instead of taking dividends as cash, you use them to buy more shares. More shares pay more dividends, which buy even more shares, so your income compounds over time.",
      },
      {
        q: "Why are dividend growth and price growth separate inputs?",
        a: "Share prices and dividends move independently. When dividends grow faster than the price, the yield on new purchases rises, so reinvested money buys more income. Setting both rates equal keeps the yield constant.",
      },
      {
        q: "Will my portfolio really grow like this?",
        a: "The result assumes your inputs hold steady every year. Real markets move up and down and dividends can be cut, so use the calculator to compare scenarios rather than as a forecast.",
      },
    ],
  },
  goal: {
    ko: [
      {
        q: "월 배당 100만원을 받으려면 원금이 얼마나 필요한가요?",
        a: "배당률과 세금에 따라 달라요. 일반계좌(15.4%)에서 배당률 4%라면 약 3억 5천만원, 배당률 5%라면 약 2억 8천만원이 필요해요. 위 계산기에 배당률을 넣으면 정확한 금액을 바로 볼 수 있어요.",
      },
      {
        q: "목표 배당금은 세전으로 넣나요, 세후로 넣나요?",
        a: "통장에 실제로 들어오는 세후 금액으로 넣어요. 계산기가 세금 옵션에 맞춰 세전 배당금과 필요한 원금을 거꾸로 계산해 줘요.",
      },
      {
        q: "배당률이 높은 커버드콜 ETF로 계산해도 되나요?",
        a: "계산은 되지만 주의가 필요해요. 커버드콜 ETF는 배당(분배금)이 높은 대신 주가가 오를 때 수익이 제한되고, 오랜 기간 주가가 내려가며 원금이 줄어드는 경우가 있어요. 배당만 보지 말고 총수익률도 함께 확인해 주세요.",
      },
      {
        q: "월 배당이 많아지면 세금이 더 늘어나나요?",
        a: "네. 이자·배당을 합쳐 1년에 2,000만원(세전, 월 약 167만원)을 넘으면 넘는 부분이 다른 소득과 합쳐져 종합과세돼요. 또 금융소득이 1년에 1,000만원(월 약 83만원)을 넘으면 건강보험료 계산에 전액이 들어가요.",
      },
      {
        q: "지금 원금이 부족하면 어떻게 계획하나요?",
        a: "배당 재투자 계산기에서 매달 투자금과 기간을 넣고, '목표 월 배당금'에 같은 금액을 넣어 보세요. 몇 년차에 목표에 닿는지 표에 표시돼요.",
      },
    ],
    en: [
      {
        q: "Should I enter my goal before or after tax?",
        a: "Enter the after-tax amount you want to receive. The calculator works backward from your tax setting to find the pre-tax dividend and the principal you need.",
      },
      {
        q: "Can I use a high-yield covered call ETF in the calculation?",
        a: "You can, but be careful. Covered call ETFs pay high distributions but cap upside and can lose principal over time. Look at total return, not just yield.",
      },
      {
        q: "What if I don't have enough capital yet?",
        a: "Use the reinvestment calculator with a monthly contribution and set the same target monthly dividend. It shows the year you reach your goal.",
      },
    ],
  },
  snowball: {
    ko: [
      {
        q: "배당 스노우볼이란 무엇인가요?",
        a: "배당을 재투자하면서 꾸준히 투자하다 보면, 1년 동안 받는 배당금이 1년 동안 내가 넣는 돈보다 커지는 시점이 와요. 이때부터는 내 돈보다 배당이 자산을 더 빨리 불려서, 눈덩이가 스스로 굴러가는 것처럼 보여 '스노우볼'이라고 불러요.",
      },
      {
        q: "스노우볼 시점을 앞당기려면 어떻게 해야 하나요?",
        a: "초기 투자금을 늘리거나, 배당 성장률이 높은 종목을 고르거나, 배당을 빠짐없이 재투자하면 앞당겨져요. 월 투자금을 늘리면 자산은 커지지만 넘어야 할 기준(연간 투자금)도 같이 커져서 시점은 오히려 늦어질 수 있어요.",
      },
      {
        q: "세금은 반영되나요?",
        a: "스노우볼 계산기는 세전 기준이에요. 일반계좌는 배당의 15.4%가 떼이므로 실제 시점은 조금 늦어져요. 세금을 반영한 결과는 배당 재투자 계산기에서 계좌·세금을 골라 확인할 수 있어요.",
      },
    ],
    en: [
      {
        q: "What is the dividend snowball?",
        a: "It's the point where the dividends you receive in a year exceed the money you add in a year. From then on, dividends grow your portfolio faster than your own contributions.",
      },
      {
        q: "How can I reach the snowball point sooner?",
        a: "Start with a larger initial investment, choose holdings with strong dividend growth, and reinvest every dividend. Raising your monthly contribution grows assets but also raises the bar you need to cross.",
      },
    ],
  },
  tax: {
    ko: [
      {
        q: "금융소득 2,000만원은 세전 기준인가요?",
        a: "네, 세금을 떼기 전 금액이에요. 국내외 이자와 배당을 모두 합쳐 1년(1월~12월)에 2,000만원을 넘는지로 판단해요. ISA·연금계좌 안에서 생긴 이자·배당은 포함하지 않아요.",
      },
      {
        q: "2,000만원을 넘으면 전체에 높은 세율이 붙나요?",
        a: "아니요. 2,000만원까지는 원래대로 14%로 끝나고, 넘는 부분만 근로·사업소득 같은 다른 소득과 합쳐 기본세율(6~45%)을 적용해요. 그리고 '종합과세로 계산한 세금'과 '전부 14%로 계산한 세금' 중 큰 금액을 내요. 그래서 다른 소득이 적으면 추가로 낼 세금이 거의 없을 수도 있어요.",
      },
      {
        q: "미국 주식 배당도 2,000만원에 포함되나요?",
        a: "네, 포함돼요. 미국에서 15% 원천징수된 배당도 세전 금액으로 합쳐요. 종합과세가 되면 미국에서 낸 세금은 외국납부세액공제로 일부 빼줘요.",
      },
      {
        q: "고배당기업 분리과세는 무엇인가요?",
        a: "2026년에 지급되는 배당부터 한시적으로, 거래소에 고배당기업으로 공시된 회사의 배당을 종합과세에 합치지 않고 14~30%의 별도 세율로 과세하는 제도예요. 자동이 아니라 다음 해 5월 종합소득세 신고 때 신청해야 해요. 대상 기업과 적용 기간은 국세청과 거래소 공시로 꼭 확인해 주세요.",
      },
      {
        q: "건강보험료에는 어떤 영향이 있나요?",
        a: "금융소득이 1년에 1,000만원 이하면 건강보험 소득에 넣지 않지만, 넘으면 전액이 들어가요. 피부양자는 다른 소득과 합쳐 2,000만원을 넘으면 자격을 잃을 수 있고, 직장인은 월급 외 소득이 2,000만원을 넘으면 넘는 부분에 보험료가 따로 붙어요.",
      },
      {
        q: "종합과세를 피하거나 줄이는 방법이 있나요?",
        a: "ISA와 연금저축·IRP 같은 절세계좌 안의 배당은 2,000만원 계산에 들어가지 않아요. 가족이 각자 명의로 투자하면 1인당 2,000만원 기준이 따로 적용되지만, 돈을 옮길 때 증여세 공제 한도(배우자 10년 6억원, 성인 자녀 10년 5,000만원)를 확인해야 해요.",
      },
    ],
  },
};
