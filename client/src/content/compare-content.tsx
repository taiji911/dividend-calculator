import { compareAccounts, type CompareInput } from "@/lib/account-compare";
import { krwShort } from "@/lib/format";
import { FAQ } from "@/content/faq";
import { ContentArticle, Section, DataTable, FaqList, RelatedLinks, Updated } from "@/components/content";

const BASE: Omit<CompareInput, "monthlyInvestment" | "years" | "asset"> = {
  initialInvestment: 0,
  dividendYield: 3.5,
  dividendGrowthRate: 7,
  priceGrowthRate: 6,
  isaType: "general",
  creditRate: 0.132,
  pensionTaxRate: 0.055,
};

const SCENARIOS: { label: string; input: CompareInput }[] = [
  { label: "미국 배당 ETF · 월 50만원 · 10년", input: { ...BASE, monthlyInvestment: 500_000, years: 10, asset: "us_dividend" } },
  { label: "미국 배당 ETF · 월 75만원 · 20년", input: { ...BASE, monthlyInvestment: 750_000, years: 20, asset: "us_dividend" } },
  {
    label: "국내 배당주 · 월 50만원 · 10년",
    input: { ...BASE, monthlyInvestment: 500_000, years: 10, asset: "kr_domestic", dividendYield: 4, dividendGrowthRate: 5, priceGrowthRate: 4 },
  },
];

const short = (n: number) => krwShort(n);

export function CompareContentKo() {
  const rows = SCENARIOS.map(({ label, input }) => {
    const r = compareAccounts(input);
    const get = (id: string) => r.accounts.find((a) => a.id === id);
    const cell = (id: string) => {
      const a = get(id);
      return a ? short(a.totalBenefit) : "—";
    };
    const best = get(r.bestId)!;
    return [label, cell("us_direct"), cell("general"), cell("isa"), cell("pension"), best.name.replace(" 일반형", "")];
  });

  return (
    <ContentArticle>
      <Section kicker="한눈에" title="같은 ETF라도 계좌에 따라 세금이 달라요">
        <p>
          배당 투자를 할 때 <strong>무엇을 살지</strong>만큼 중요한 게 <strong>어느 계좌에 담을지</strong>예요. 미국 배당 ETF를 예로 들면 같은 돈을 넣어도
          세금이 붙는 시점과 세율이 계좌마다 달라서, 10년·20년이 지나면 손에 쥐는 돈이 수백만 원씩 차이 날 수 있어요.
        </p>
        <DataTable
          caption="계좌별 세금 비교"
          text
          headers={["계좌", "배당 받을 때", "팔 때·찾을 때", "핵심 조건"]}
          rows={[
            ["일반계좌 · 미국 ETF 직접", "미국 15%", "양도세 22% (연 250만원 공제)", "제한 없음"],
            ["일반계좌 · 국내상장 ETF", "15.4% (미국 배당 ETF는 사실상 15%)", "매매차익 15.4% (해외 ETF)", "금융소득 2,000만원 합산"],
            ["ISA", "기간 중 과세 안 함", "이익 200만원(서민형 400만원)까지 비과세, 초과분 9.9%", "연 2,000만원·총 1억원, 3년 유지"],
            ["연금저축·IRP", "기간 중 과세 안 함", "55세 이후 연금 수령 3.3~5.5%", "납입액 13.2~16.5% 세액공제"],
          ]}
          note="2026년 10월 기준 세법. 지방소득세 포함 세율이에요."
        />
      </Section>

      <Section kicker="계산 예시" title="10년·20년 뒤 세금 뗀 금액 비교">
        <p>
          배당률 3.5%, 배당 성장률 7%, 주가 상승률 6%(국내 배당주는 4%, 5%, 4%)로 가정하고 배당을 모두 재투자했을 때, 세금을 다 낸 뒤의 금액이에요.
          연금저축은 세액공제로 돌려받는 돈까지 더했어요(총급여 5,500만원 초과 13.2% 기준).
        </p>
        <DataTable
          caption="계좌별 세후 금액 예시"
          headers={["상황", "일반(직접)", "일반(국내상장)", "ISA", "연금저축", "가장 유리"]}
          rows={rows}
          note="연금저축은 55세 이후 연금으로 받는 경우예요. 수익률은 가정이며 실제 결과는 달라질 수 있어요."
        />
        <p>
          대부분 <strong>연금저축 → ISA → 일반계좌</strong> 순서로 유리하게 나와요. 다만 연금저축은 55세 전에 꺼내면 16.5%를 내야 하고, ISA는 1년
          한도가 있어서 실제로는 <strong>계좌를 나눠 쓰는 것</strong>이 보통이에요.
        </p>
        <p>
          눈여겨볼 점도 있어요. 미국 배당 ETF를 20년처럼 오래 굴리면 <strong>ISA와 일반계좌(국내상장) 차이가 거의 없어져요.</strong> ISA 안에서는 미국에서
          뗀 15%를 돌려받지 못한 채, 만기 때 재투자한 배당까지 이익으로 잡혀 9.9%를 한 번 더 내기 때문이에요. 국내 주식은 매매차익이 원래 비과세라 이런
          문제가 없어서 ISA가 확실히 유리해요.
        </p>
      </Section>

      <Section kicker="순서 정하기" title="돈을 넣는 순서, 이렇게 정해 보세요">
        <ol>
          <li>
            <strong>연금저축·IRP 세액공제 한도(연 900만원)</strong>부터 채워요. 넣는 순간 13.2~16.5%를 돌려받는 건 다른 계좌에 없는 혜택이에요. 단,
            노후까지 묶어 둘 수 있는 돈만 넣어요.
          </li>
          <li>
            다음은 <strong>ISA(연 2,000만원)</strong>예요. 3년만 지나면 찾을 수 있어서 중간에 쓸 수도 있는 돈에 알맞아요. 만기 때 연금계좌로 옮기면
            옮긴 금액의 10%(최대 300만원)를 추가로 세액공제 받을 수 있어요.
          </li>
          <li>
            그래도 남는 돈은 <strong>일반계좌</strong>에 넣어요. 미국 배당 ETF라면 직접 사는 것과 국내상장 ETF를 사는 것 중, 팔 때 세금(22% vs 15.4%)과
            금융소득종합과세 여부를 따져서 골라요.
          </li>
        </ol>
      </Section>

      <Section kicker="꼭 알아둘 점" title="계좌별로 놓치기 쉬운 조건">
        <ul>
          <li>
            <strong>ISA</strong>는 직전 3년 중 한 번이라도 금융소득종합과세 대상이었으면 가입할 수 없어요. ISA 안의 배당은 종합과세(2,000만원)와
            건강보험료 계산에 들어가지 않아요.
          </li>
          <li>
            <strong>IRP</strong>는 주식형 ETF 같은 위험자산을 70%까지만 담을 수 있어요. 연금저축은 이런 제한이 없어서 배당 ETF를 100% 담을 수 있어요.
          </li>
          <li>
            <strong>절세계좌 안의 미국 배당 ETF</strong>는 미국에서 뗀 15%를 돌려받지 못해요. 그래서 이 계산기도 ISA·연금저축의 미국 배당 ETF는 15%가
            빠진 배당으로 계산했어요.
          </li>
          <li>
            <strong>연금 수령액</strong>이 1년에 1,500만원(사적연금 기준)을 넘으면 종합과세와 16.5% 분리과세 중에서 골라야 해요. 연금을 오래 나눠 받으면
            이 기준을 피하기 쉬워요.
          </li>
        </ul>
        <p>
          2026년 8월 정부 세제개편안에 국내 주식에 투자하는 새 ISA(배당·이자 전액 비과세, 총 2억원)가 들어 있지만, 아직 국회를 통과하기 전이에요. 바뀌면
          이 계산기도 반영할게요.
        </p>
      </Section>

      <FaqList items={FAQ.compare!.ko!} />

      <RelatedLinks
        items={[
          { href: "/", title: "배당 재투자 계산기", desc: "계좌를 정했다면, 몇 년 뒤 자산과 월 배당이 얼마인지 자세히 봐요." },
          { href: "/tax", title: "금융소득종합과세 계산기", desc: "일반계좌 배당이 2,000만원을 넘으면 세금이 얼마나 늘어나는지 계산해요." },
        ]}
      />

      <Updated>2026년 10월 세법 기준으로 작성했어요. 세금은 개인 상황에 따라 달라지니 큰 결정 전에는 세무 전문가와 확인해 주세요.</Updated>
    </ContentArticle>
  );
}
