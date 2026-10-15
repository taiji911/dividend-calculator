import { calcFinancialTax, highDividendTax } from "@/lib/financial-tax";
import { krwShort } from "@/lib/format";
import { FAQ } from "@/content/faq";
import { ContentArticle, Section, DataTable, FaqList, RelatedLinks, Updated } from "@/components/content";

const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;

export function TaxContentKo() {
  const base = { domesticDividends: 0, otherFinancial: 0, foreignDividends: 0, highDividend: 0, otherTaxBase: 0, insurance: "employee" as const, otherIncomeForInsurance: 0 };
  const examples = [
    { label: "국내 배당 3,000만원 + 근로 과세표준 5,000만원", r: calcFinancialTax({ ...base, domesticDividends: 30_000_000, otherTaxBase: 50_000_000 }) },
    { label: "미국 배당 3,000만원 + 근로 과세표준 5,000만원", r: calcFinancialTax({ ...base, foreignDividends: 30_000_000, otherTaxBase: 50_000_000 }) },
    { label: "국내 배당 3,000만원, 다른 소득 없음", r: calcFinancialTax({ ...base, domesticDividends: 30_000_000 }) },
  ];
  const high30 = highDividendTax(30_000_000);

  return (
    <ContentArticle>
      <Section kicker="기본 개념" title="금융소득종합과세, 2,000만원이 기준이에요">
        <p>
          <strong>금융소득종합과세</strong>는 1년 동안 받은 이자와 배당(세전)이 합쳐서 2,000만원을 넘으면, 넘는 부분을 근로·사업소득 같은 다른 소득과 합쳐
          다시 세금을 매기는 제도예요. 2,000만원 이하라면 받을 때 떼인 15.4%로 세금이 끝나요.
        </p>
        <p>
          많이 오해하는 부분이 있어요. 2,000만원을 넘는다고 <strong>전체 배당에 높은 세율이 붙는 게 아니에요.</strong> 2,000만원까지는 그대로 14%이고, 넘는
          부분만 다른 소득과 합쳐 6~45% 기본세율을 적용해요.
        </p>
      </Section>

      <Section kicker="계산 순서" title="세금은 이렇게 계산돼요">
        <ol>
          <li>국내외 이자·배당을 세전 금액으로 모두 더해요. (ISA·연금계좌 안의 배당은 빼요)</li>
          <li>2,000만원을 넘으면 넘는 부분 중 국내 주식 배당에 10%를 더해요(Gross-up). 회사가 이미 낸 법인세를 감안하는 장치예요.</li>
          <li>
            두 가지 방식으로 세금을 계산해 <strong>큰 쪽</strong>을 내요.
            <br />① 종합과세 방식: (종합소득 과세표준 − 2,000만원) × 기본세율 + 2,000만원 × 14%
            <br />② 분리과세 방식: 다른 소득 × 기본세율 + 금융소득 전체 × 14%
          </li>
          <li>Gross-up으로 더한 만큼 배당세액공제, 해외 배당은 외국에서 낸 세금만큼 외국납부세액공제를 받아요.</li>
          <li>이미 원천징수된 세금을 빼고 남은 금액을 5월에 내요. 지방소득세 10%가 함께 붙어요.</li>
        </ol>
      </Section>

      <Section kicker="계산 예시" title="실제로 얼마나 더 낼까?">
        <p>같은 3,000만원 배당이라도 다른 소득과 배당 종류에 따라 추가 세금이 달라져요.</p>
        <DataTable
          caption="금융소득종합과세 계산 예시"
          headers={["상황", "5월 추가 납부", "실효세율"]}
          rows={examples.map(({ label, r }) => [label, r.additionalTotal > 0 ? won(r.additionalTotal) : "0원 (환급 가능)", `${r.effectiveRate.toFixed(1)}%`])}
          note="지방소득세 포함. 소득공제·세액공제 등 개인 사정은 반영하지 않은 추정치예요."
        />
        <p>
          다른 소득이 없으면 2,000만원을 넘어도 추가 세금이 거의 없을 수 있어요. 반대로 근로소득이 많을수록 넘는 부분에 높은 세율이 붙어요.
        </p>
      </Section>

      <Section kicker="2026년 변화" title="고배당기업 배당은 따로 과세할 수 있어요">
        <p>
          2026년에 지급되는 배당부터 한시적으로, 거래소에 <strong>고배당기업</strong>으로 공시된 회사의 배당은 종합과세에 합치지 않고 따로 과세를 신청할 수
          있어요. 세율은 2,000만원 이하 14%, 3억원 이하 20%, 50억원 이하 25%, 그 이상 30%예요(지방세 별도). 예를 들어 고배당기업 배당 3,000만원이면
          국세 {krwShort(high30)}으로 끝나요.
        </p>
        <p>자동으로 적용되지 않고 다음 해 5월 신고 때 신청해야 해요. 대상 기업과 적용 기간은 국세청과 거래소(KIND) 공시로 확인해 주세요.</p>
      </Section>

      <Section kicker="건강보험" title="세금보다 무서운 건보료">
        <ul>
          <li>금융소득이 1년에 <strong>1,000만원 이하</strong>면 건강보험 소득에 넣지 않지만, 넘으면 1,000만원을 넘는 부분이 아니라 <strong>전액</strong>이 들어가요.</li>
          <li><strong>피부양자</strong>는 금융·연금·근로소득 등을 합쳐 2,000만원을 넘으면 자격을 잃고 지역가입자가 될 수 있어요.</li>
          <li><strong>직장인</strong>은 월급 외 소득이 2,000만원을 넘으면 넘는 부분에 보험료(소득월액보험료)가 따로 붙어요.</li>
        </ul>
      </Section>

      <FaqList items={FAQ.tax!.ko!} />

      <RelatedLinks
        items={[
          { href: "/", title: "배당 재투자 계산기", desc: "일반계좌·ISA·연금계좌별로 몇 년 뒤 자산이 얼마인지 비교해요." },
          { href: "/goal", title: "목표 배당금 계산기", desc: "월 배당 목표에 필요한 원금을 세후 기준으로 계산해요." },
        ]}
      />
      <Updated>기준: 2026년 10월 · 2026년 귀속 세법과 건강보험 기준을 따라요. 정확한 신고는 홈택스나 세무사와 확인해 주세요.</Updated>
    </ContentArticle>
  );
}
