import { simulate, type SimInput } from "@/lib/dividend-engine";
import { krwShort, moneyShort } from "@/lib/format";
import { FAQ } from "@/content/faq";
import { ContentArticle, Section, DataTable, FaqList, RelatedLinks, Updated } from "@/components/content";

/** 예시에 쓰는 공통 가정 — 국내 상장 배당 ETF를 일반계좌에서 매달 모으는 경우 */
const BASE: SimInput = {
  initialInvestment: 0,
  monthlyInvestment: 500_000,
  years: 10,
  dividendYield: 3.5,
  dividendGrowthRate: 5,
  priceGrowthRate: 5,
  drip: true,
  account: "taxable_kr",
};

const monthlyOf = (r: ReturnType<typeof simulate>) => (r.yearlyData.at(-1)?.annualDividends ?? 0) / 12;

export function ReinvestContentKo() {
  const byYears = [10, 20, 30].map((y) => ({ y, r: simulate({ ...BASE, years: y }) }));
  const byMonthly = [300_000, 500_000, 1_000_000].map((m) => ({ m, r: simulate({ ...BASE, monthlyInvestment: m, years: 20 }) }));
  const dripOn = simulate({ ...BASE, years: 20 });
  const dripOff = simulate({ ...BASE, years: 20, drip: false });
  const acct = (["taxable_kr", "isa", "pension"] as const).map((a) => ({ a, r: simulate({ ...BASE, account: a }) }));
  const acctName = { taxable_kr: "일반계좌", isa: "ISA 일반형", pension: "연금저축·IRP" };

  return (
    <ContentArticle>
      <Section kicker="사용법" title="배당 재투자 계산기, 이렇게 쓰세요">
        <p>
          <strong>배당 재투자 계산기</strong>는 배당금을 다시 투자했을 때 몇 년 뒤 자산과 월 배당금이 얼마가 되는지 보여줘요. 숫자를 바꾸는 즉시 결과가
          바뀌니까, 여러 경우를 빠르게 비교해 볼 수 있어요.
        </p>
        <ul>
          <li><strong>초기 투자금·월 투자금</strong>: 지금 넣을 돈과 매달 더 넣을 돈이에요. 적립식이면 초기 투자금을 0으로 두세요.</li>
          <li><strong>시가 배당률</strong>: 지금 주가 대비 1년 배당금 비율이에요. 증권사 앱이나 ETF 운용사 홈페이지의 '배당수익률(분배율)'을 보면 돼요.</li>
          <li><strong>배당 성장률</strong>: 주당 배당금이 1년에 몇 % 늘어나는지예요. 최근 5~10년 평균을 참고하되, 미래는 보장되지 않으니 조금 낮춰 넣는 게 안전해요.</li>
          <li><strong>주가 상승률</strong>: 주가가 1년에 몇 % 오르는지예요. 배당 성장률과 같게 두면 배당률이 일정하게 유지돼요.</li>
          <li><strong>계좌·세금</strong>: 일반계좌, ISA, 연금저축·IRP에 따라 세금이 달라져요. 결과가 꽤 차이 나니 꼭 골라 보세요.</li>
        </ul>
      </Section>

      <Section kicker="계산 예시" title="월 50만원씩 모으면 얼마가 될까?">
        <p>
          배당률 3.5%, 배당 성장률 5%, 주가 상승률 5%인 배당 ETF에 일반계좌로 매달 50만원씩 넣고 배당을 모두 재투자했다고 가정했어요.
        </p>
        <DataTable
          caption="월 50만원 적립 시 기간별 예상 자산"
          headers={["투자 기간", "넣은 돈", "예상 자산", "그 해 월 배당 (세후)"]}
          rows={byYears.map(({ y, r }) => [`${y}년`, krwShort(r.totalInvested), krwShort(r.finalAssets), krwShort(monthlyOf(r))])}
        />
        <p>
          20년을 기준으로 월 투자금을 바꿔 보면 아래와 같아요. 월 투자금을 두 배로 늘리면 결과도 거의 두 배가 돼요. 배당 투자에서는
          <strong> 얼마나 오래, 꾸준히 넣느냐</strong>가 가장 큰 차이를 만들어요.
        </p>
        <DataTable
          caption="월 투자금별 20년 뒤 예상"
          headers={["월 투자금", "넣은 돈", "20년 뒤 자산", "월 배당 (세후)"]}
          rows={byMonthly.map(({ m, r }) => [krwShort(m), krwShort(r.totalInvested), krwShort(r.finalAssets), krwShort(monthlyOf(r))])}
          note="예시는 가정을 그대로 이어간 계산이에요. 실제 주가와 배당은 해마다 달라져요."
        />
      </Section>

      <Section kicker="재투자 효과" title="배당을 재투자하면 얼마나 차이 날까?">
        <p>
          같은 조건으로 20년 동안 배당을 재투자한 경우와, 배당을 현금으로 받아 따로 모아 둔 경우를 비교했어요. 재투자하면 늘어난 주식이 다시
          배당을 만들어서, 시간이 갈수록 차이가 벌어져요.
        </p>
        <DataTable
          caption="배당 재투자 여부에 따른 20년 뒤 비교"
          headers={["방식", "20년 뒤 총 자산", "20년차 월 배당"]}
          rows={[
            ["배당 재투자", krwShort(dripOn.finalAssets), krwShort(monthlyOf(dripOn))],
            ["현금으로 받아 모으기", krwShort(dripOff.finalAssets), krwShort(monthlyOf(dripOff))],
            ["차이", `+${krwShort(dripOn.finalAssets - dripOff.finalAssets)}`, `+${krwShort(monthlyOf(dripOn) - monthlyOf(dripOff))}`],
          ]}
        />
      </Section>

      <Section kicker="절세 계좌" title="일반계좌 vs ISA vs 연금저축, 10년 뒤 차이">
        <p>
          같은 조건(월 50만원, 10년)으로 계좌만 바꿔 봤어요. 일반계좌는 배당을 받을 때마다 15.4%가 떼여 재투자할 돈이 줄어요. ISA와 연금계좌는
          기간 중 세금 없이 굴리기 때문에 복리 효과가 더 커요.
        </p>
        <DataTable
          caption="계좌별 10년 뒤 비교"
          headers={["계좌", "10년 뒤 자산", "만기 세금", "세금 뗀 뒤"]}
          rows={acct.map(({ a, r }) => [
            acctName[a],
            krwShort(r.finalAssets),
            a === "pension" ? "수령 때 3.3~5.5%" : r.exitTax > 0 ? `−${krwShort(r.exitTax)}` : "없음",
            a === "pension" ? "—" : krwShort(r.finalAfterTax),
          ])}
          note="ISA는 순이익 200만원(서민형 400만원)을 넘는 부분에 9.9%를 만기 때 내요. 연금저축·IRP는 55세 이후 연금으로 받을 때 나이에 따라 3.3~5.5%를 내고, 납입액 세액공제 혜택은 위 계산에 넣지 않았어요."
        />
      </Section>

      <Section kicker="계산 방식" title="이 계산기는 이렇게 계산해요">
        <ul>
          <li>매달 초에 월 투자금으로 주식을 사고, 매달 말에 (보유 주식 × 주당 배당금 ÷ 12)를 배당으로 받는다고 계산해요.</li>
          <li>주가와 주당 배당금은 따로 움직여요. 주가는 '주가 상승률', 배당은 '배당 성장률'만큼 매년 올라가요.</li>
          <li>새로 넣은 돈은 그때의 주가로 사기 때문에, 그때의 배당률을 받아요.</li>
          <li>'연평균 수익률'은 돈을 넣은 시점까지 반영한 수익률(내부수익률)이에요. 매달 넣은 돈은 투자 기간이 짧아서, 단순히 총액으로 나눈 수익률보다 정확해요.</li>
          <li>세금은 2026년 세법 기준이에요. 일반계좌는 국내 15.4%, 미국 15% 원천징수로 계산하고, 1년 금융소득 2,000만원을 넘을 때의 종합과세는
            <a href="/tax"> 종합과세 계산기</a>에서 따로 확인할 수 있어요.</li>
        </ul>
      </Section>

      <FaqList items={FAQ.reinvest!.ko!} />

      <RelatedLinks
        items={[
          { href: "/goal", title: "목표 배당금 계산기", desc: "월 100만원 배당을 받으려면 원금이 얼마 필요한지 거꾸로 계산해요." },
          { href: "/snowball", title: "배당 스노우볼 계산기", desc: "1년 배당금이 1년 투자금을 넘어서는 시점을 찾아요." },
          { href: "/tax", title: "금융소득종합과세 계산기", desc: "배당이 연 2,000만원을 넘으면 5월에 더 낼 세금과 건보료 영향을 계산해요." },
          { href: "/guide", title: "사용 가이드", desc: "입력값 고르는 법과 결과를 읽는 법을 정리했어요." },
        ]}
      />
      <Updated>기준: 2026년 10월 · 세율과 한도는 2026년 세법을 따라요.</Updated>
    </ContentArticle>
  );
}

export function ReinvestContentEn() {
  const base: SimInput = { ...BASE, monthlyInvestment: 500, account: "taxable_us" };
  const rows = [10, 20, 30].map((y) => {
    const r = simulate({ ...base, years: y });
    return [`${y} years`, moneyShort(r.totalInvested, "USD"), moneyShort(r.finalAssets, "USD"), moneyShort(monthlyOf(r), "USD")];
  });
  return (
    <ContentArticle>
      <Section kicker="How to use" title="How this dividend reinvestment calculator works">
        <p>
          This <strong>dividend reinvestment calculator</strong> projects your total assets and monthly dividend income when you reinvest every dividend.
          Results update as you type, so you can compare scenarios quickly.
        </p>
        <ul>
          <li><strong>Dividend yield</strong>: annual dividend divided by the current share price.</li>
          <li><strong>Dividend growth</strong>: how fast the dividend per share grows each year. Use a slightly conservative number.</li>
          <li><strong>Price growth</strong>: how fast the share price rises. If it equals dividend growth, the yield stays constant.</li>
        </ul>
      </Section>
      <Section kicker="Example" title="Investing $500 a month">
        <p>Assumes a 3.5% yield, 5% dividend growth, 5% price growth, 15% dividend withholding, and full reinvestment.</p>
        <DataTable headers={["Period", "Invested", "Projected assets", "Monthly dividend"]} rows={rows} note="Projections assume steady growth. Real markets move up and down." />
      </Section>
      <FaqList title="Frequently asked questions" items={FAQ.reinvest!.en!} />
      <RelatedLinks
        title="More calculators"
        items={[
          { href: "/en/goal", title: "Dividend goal calculator", desc: "How much you need to invest for a target monthly dividend." },
          { href: "/en/snowball", title: "Dividend snowball simulator", desc: "When your annual dividends outrun your contributions." },
        ]}
      />
    </ContentArticle>
  );
}
