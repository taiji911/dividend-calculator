import { Component, type ReactNode } from "react";

/** 화면 일부가 고장 나도 하얀 화면 대신 안내와 새로고침 버튼을 보여줘요 */
export default class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("[화면 오류]", error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="kicker text-gold">잠시 문제가 생겼어요</p>
        <h1 className="mt-3 text-[24px] font-bold">화면을 불러오지 못했어요</h1>
        <p className="mt-3 text-[15px] text-muted-foreground">사이트가 방금 업데이트됐을 수 있어요. 새로고침하면 대부분 해결돼요.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 rounded-full bg-gold px-6 py-3 text-[15px] font-semibold text-gold-foreground hover:opacity-90"
        >
          새로고침
        </button>
      </div>
    );
  }
}
