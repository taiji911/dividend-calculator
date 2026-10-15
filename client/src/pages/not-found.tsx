import { Link } from "wouter";
import { useNoIndex } from "@/lib/seo";

export default function NotFound() {
  useNoIndex();
  return (
    <div className="mx-auto flex max-w-xl flex-col items-start px-4 py-24 sm:px-6">
      <p className="kicker text-gold">404</p>
      <h1 className="mt-3 text-[32px] font-bold tracking-tight">페이지를 찾을 수 없어요</h1>
      <p className="mt-3 text-[15px] text-muted-foreground">주소가 바뀌었거나 없는 페이지예요. 계산기에서 다시 시작해 보세요.</p>
      <Link href="/">
        <span className="mt-8 inline-flex h-11 items-center rounded-xl bg-gold px-5 text-[15px] font-semibold text-gold-foreground">배당 재투자 계산기로 가기</span>
      </Link>
    </div>
  );
}
