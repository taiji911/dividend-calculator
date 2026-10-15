import { simulate } from "@/lib/dividend-engine";
import { krwShort, krwAxis, moneyShort } from "@/lib/format";
import { FAQ } from "@/content/faq";
import { ContentArticle, Section, DataTable, FaqList, RelatedLinks, Updated } from "@/components/content";

const KR_TAX = 0.154;
/** 세후 월 목표 → 필요한 원금 */
const principalFor = (monthlyNet: number, yieldPct: number, tax = KR_TAX) => (monthlyNet * 12) / (1 - tax) / (yieldPct / 100);

export function GoalContentKo() {
  const goals = [500_000, 1_000_000, 2_000_000, 3_000_000];
  const yields = [3, 4, 5, 7];

  // 매달 100만원씩 넣으면 몇 년차에 세후 월 배당 100만원에 닿을까
  const path = simulate({
    initialInvestment: 0,
    monthlyInvestment: 1_000_000,
    years: 40,
    dividendYield: 4,
    dividendGrowthRate: 5,
    priceGrowthRate: 4,
    drip: true,
    account: "taxable_kr",
  });
  const hit = path.yearlyData.find((r) => r.annualDividends / 12 >= 1_000_000);

  const comprehensiveMonthlyNet = (20_000_000 * (1 - KR_TAX)) / 12;
  const healthMonthlyNet = (10_000_000 * (1 - KR_TAX)) / 12;

  return (
    <ContentArticle>
      <Section kicker="계산 원리" title="목표 배당금 계산기는 거꾸로 계산해요">
        <p>
          <strong>목표 배당금 계산기</strong>는 "매달 이만큼 받고 싶다"는 목표에서 출발해, 그만큼 배당을 받으려면 원금이 얼마나 있어야 하는지 계산해요.
          통장에 들어오는 세후 금액을 기준으로 하기 때문에, 세금을 떼고 나서도 목표를 채울 수 있는 금액이 나와요.
        </p>
        <p>
          계산식은 <strong>필요 원금 = 목표 월 배당 × 12 ÷ (1 − 세율) ÷ 배당률</strong>이에요. 배당률이 1%p만 달라져도 필요한 원금이 크게 바뀌어요.
        </p>
      </Section>

      <Section kicker="한눈에 보기" title="월 배당 목표별 필요 원금">
        <p>국내 배당주·ETF를 일반계좌(배당소득세 15.4%)로 보유한다고 가정했어요.</p>
        <DataTable
          caption="세후 월 배당 목표와 배당률별 필요 원금"
          headers={["세후 월 배당", ...yields.map((y) => `배당률 ${y}%`)]}
          rows={goals.map((g) => [krwShort(g), ...yields.map((y) => `${krwAxis(principalFor(g, y))}원`)])}
          note="억 단위는 소수 첫째 자리까지 반올림했어요. 배당률 7% 이상은 대부분 커버드콜·고배당 상품이에요. 배당이 높은 대신 주가가 오르기 어렵거나 원금이 줄 수 있어요."
        />
      </Section>

      <Section kicker="시간으로 풀기" title="원금이 부족하다면, 몇 년이 걸릴까?">
        <p>
          한 번에 큰돈을 넣기 어렵다면 매달 모으면서 배당을 재투자하는 방법이 있어요. 매달 100만원씩, 배당률 4%·배당 성장률 5%·주가 상승률 4%인
          배당 ETF에 일반계좌로 넣는다면{" "}
          {hit ? (
            <>
              <strong>{hit.year}년차</strong>에 세후 월 배당 100만원에 닿아요. 그때까지 넣은 돈은 {krwShort(hit.totalInvested)}, 자산은 약{" "}
              {krwShort(hit.totalAssets)}이에요.
            </>
          ) : (
            "40년 안에는 닿지 않아요."
          )}
        </p>
        <p>
          내 조건으로 계산해 보려면 <a href="/">배당 재투자 계산기</a>에서 '목표 월 배당금'을 넣어 보세요. 몇 년차에 목표를 넘는지 표에 표시돼요.
        </p>
      </Section>

      <Section kicker="꼭 알아둘 것" title="월 배당이 커지면 세금과 건보료도 따라와요">
        <ul>
          <li>
            <strong>세후 월 약 {krwShort(comprehensiveMonthlyNet)} (세전 연 2,000만원)</strong>을 넘으면 금융소득종합과세 대상이 돼요. 넘는 부분은 다른 소득과
            합쳐 과세되니 <a href="/tax">종합과세 계산기</a>로 미리 확인해 보세요.
          </li>
          <li>
            <strong>세후 월 약 {krwShort(healthMonthlyNet)} (세전 연 1,000만원)</strong>을 넘으면 건강보험 소득에 금융소득이 전액 들어가요. 피부양자라면
            다른 소득과 합쳐 2,000만원을 넘는지 확인이 필요해요.
          </li>
          <li>ISA·연금저축 안에서 받는 배당은 위 기준에 들어가지 않아요. 목표 금액이 크다면 절세계좌를 함께 쓰는 게 유리해요.</li>
        </ul>
      </Section>

      <FaqList items={FAQ.goal!.ko!} />

      <RelatedLinks
        items={[
          { href: "/", title: "배당 재투자 계산기", desc: "매달 모으면서 재투자하면 몇 년 뒤 얼마가 되는지 계산해요." },
          { href: "/tax", title: "금융소득종합과세 계산기", desc: "배당이 연 2,000만원을 넘을 때 세금과 건보료를 계산해요." },
        ]}
      />
      <Updated>기준: 2026년 10월 · 세율은 2026년 세법을 따라요.</Updated>
    </ContentArticle>
  );
}

export function GoalContentEn() {
  const goals = [500, 1000, 2000, 3000];
  const yields = [3, 4, 5, 7];
  return (
    <ContentArticle>
      <Section kicker="How it works" title="A dividend goal calculator works backward">
        <p>
          Start from the monthly income you want after tax. The <strong>dividend goal calculator</strong> finds the pre-tax dividend and the principal you
          need: <strong>principal = monthly goal × 12 ÷ (1 − tax rate) ÷ yield</strong>.
        </p>
      </Section>
      <Section kicker="At a glance" title="Principal needed by monthly goal">
        <p>Assumes 15% dividend withholding.</p>
        <DataTable
          headers={["Monthly (after tax)", ...yields.map((y) => `${y}% yield`)]}
          rows={goals.map((g) => [moneyShort(g, "USD"), ...yields.map((y) => moneyShort(principalFor(g, y, 0.15), "USD"))])}
        />
      </Section>
      <FaqList title="Frequently asked questions" items={FAQ.goal!.en!} />
      <RelatedLinks
        title="More calculators"
        items={[
          { href: "/en", title: "Dividend reinvestment calculator", desc: "Project your assets with monthly contributions and DRIP." },
          { href: "/en/snowball", title: "Dividend snowball simulator", desc: "When your annual dividends outrun your contributions." },
        ]}
      />
    </ContentArticle>
  );
}
