import { simulate, type SimInput } from "@/lib/dividend-engine";
import { krwShort } from "@/lib/format";
import { FAQ } from "@/content/faq";
import { ContentArticle, Section, DataTable, FaqList, RelatedLinks, Updated } from "@/components/content";

const BASE: SimInput = {
  initialInvestment: 0,
  monthlyInvestment: 500_000,
  years: 60,
  dividendYield: 4,
  dividendGrowthRate: 5,
  priceGrowthRate: 4,
  drip: true,
  account: "tax_free",
};

const yearOf = (input: Partial<SimInput>) => simulate({ ...BASE, ...input }).snowballYear;
const fmtYear = (y: number | null) => (y ? `${y}년차` : "60년 넘게");

export function SnowballContentKo() {
  const byYield = [3, 4, 5, 6].map((y) => ({ y, year: yearOf({ dividendYield: y }) }));
  const byGrowth = [0, 3, 6, 9].map((g) => ({ g, year: yearOf({ dividendGrowthRate: g }) }));
  const withSeed = [0, 10_000_000, 30_000_000, 50_000_000].map((s) => ({ s, year: yearOf({ initialInvestment: s }) }));

  return (
    <ContentArticle>
      <Section kicker="스노우볼이란" title="배당 스노우볼, 배당이 내 저축을 앞지르는 순간">
        <p>
          <strong>배당 스노우볼</strong>은 1년 동안 받는 배당금이 1년 동안 내가 새로 넣는 돈보다 커지는 시점이에요. 이때부터는 내 월급보다 배당이 자산을
          더 빨리 불려서, 눈덩이가 스스로 굴러가는 것처럼 커져요. 이 계산기는 그 시점이 몇 년차에 오는지 찾아 줘요.
        </p>
      </Section>

      <Section kicker="계산 예시" title="월 50만원이면 스노우볼은 언제 올까?">
        <p>처음 0원에서 시작해 매달 50만원을 넣고 배당을 모두 재투자한다고 가정했어요. (세전, 주가 상승률 4%)</p>
        <DataTable
          caption="배당률별 스노우볼 시점"
          headers={["시가 배당률", "스노우볼 시점 (배당 성장 5%)"]}
          rows={byYield.map(({ y, year }) => [`${y}%`, fmtYear(year)])}
        />
        <p>
          배당률만큼 중요한 게 <strong>배당 성장률</strong>이에요. 배당률 4%에서 배당 성장률만 바꿔 보면 시점이 크게 달라져요.
        </p>
        <DataTable
          caption="배당 성장률별 스노우볼 시점"
          headers={["배당 성장률", "스노우볼 시점 (배당률 4%)"]}
          rows={byGrowth.map(({ g, year }) => [`${g}%`, fmtYear(year)])}
        />
        <p>시작할 때 넣는 돈(시드)이 있으면 시점이 훨씬 빨라져요.</p>
        <DataTable
          caption="초기 투자금별 스노우볼 시점"
          headers={["초기 투자금", "스노우볼 시점"]}
          rows={withSeed.map(({ s, year }) => [s === 0 ? "0원" : krwShort(s), fmtYear(year)])}
          note="세전 기준이에요. 일반계좌는 배당의 15.4%가 떼여 시점이 조금 늦어져요."
        />
      </Section>

      <Section kicker="해석" title="스노우볼 시점을 앞당기는 세 가지">
        <ul>
          <li><strong>시드를 키우기</strong>: 초기 투자금이 클수록 첫해부터 배당이 커져요.</li>
          <li><strong>배당 성장주 고르기</strong>: 지금 배당률이 조금 낮아도 배당이 꾸준히 늘어나는 종목이 장기적으로 더 빨리 도달해요.</li>
          <li><strong>배당은 빠짐없이 재투자</strong>: 재투자를 끄면 스노우볼 시점이 훨씬 늦어지거나 오지 않아요.</li>
        </ul>
        <p>
          월 투자금을 늘리면 자산은 커지지만, 넘어야 할 기준(1년 투자금)도 함께 커져서 시점 자체는 비슷하거나 늦어질 수 있어요. 시점보다는 금액이 중요하다면{" "}
          <a href="/">배당 재투자 계산기</a>로 확인해 보세요.
        </p>
      </Section>

      <FaqList items={FAQ.snowball!.ko!} />

      <RelatedLinks
        items={[
          { href: "/", title: "배당 재투자 계산기", desc: "세금과 계좌까지 반영해 몇 년 뒤 자산과 월 배당을 계산해요." },
          { href: "/goal", title: "목표 배당금 계산기", desc: "월 배당 목표에 필요한 원금을 계산해요." },
        ]}
      />
      <Updated>기준: 2026년 10월</Updated>
    </ContentArticle>
  );
}

export function SnowballContentEn() {
  return (
    <ContentArticle>
      <Section kicker="What it is" title="The dividend snowball point">
        <p>
          The <strong>dividend snowball</strong> is the year your annual dividends become larger than the money you add each year. After that, dividends
          grow your portfolio faster than your own savings. This simulator finds that year.
        </p>
      </Section>
      <FaqList title="Frequently asked questions" items={FAQ.snowball!.en!} />
      <RelatedLinks
        title="More calculators"
        items={[
          { href: "/en", title: "Dividend reinvestment calculator", desc: "Project assets and monthly dividends with DRIP." },
          { href: "/en/goal", title: "Dividend goal calculator", desc: "Principal needed for your monthly dividend goal." },
        ]}
      />
    </ContentArticle>
  );
}
