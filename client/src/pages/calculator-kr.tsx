import { ReinvestPage } from "@/pages/calculator";

/** /kr 은 / 로 301 이동되지만(vercel.json), 앱 안에서 열려도 같은 화면을 보여줘요 */
export default function CalculatorKR() {
  return <ReinvestPage lang="kr" />;
}
