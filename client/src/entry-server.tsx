/**
 * 빌드 때만 쓰는 입구 — 페이지마다 화면을 HTML 문자열로 미리 만들어요.
 * (npm run build → scripts/prerender.mjs 가 이 파일을 불러서 dist/public 에 페이지별 HTML을 써요)
 *
 * 1) renderToPipeableStream 으로 한 번 그려서 나중에 불러오는 차트(lazy)까지 모두 불러 두고
 * 2) renderToString 으로 최종 HTML을 만들어요.
 * React 18의 스트림 출력은 한글 같은 여러 바이트 글자가 버퍼 경계에 걸리면 빈 바이트(\0)가 섞이는 문제가 있어서,
 * 실제 HTML은 문자열 방식으로 만들어요.
 */
import { renderToPipeableStream, renderToString } from "react-dom/server";
import { Writable } from "node:stream";
import App from "./App";
import { setSsrPath } from "./lib/i18n";

export { ROUTES, headTags, notFoundHeadTags, sitemapXml } from "./lib/seo-head";

/** lazy 컴포넌트를 모두 불러올 때까지 한 번 그려 보기 (결과는 버려요) */
function warmUp(path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const sink = new Writable({
      write(_chunk, _enc, cb) {
        cb();
      },
      final(cb) {
        resolve();
        cb();
      },
    });
    const stream = renderToPipeableStream(<App ssrPath={path} />, {
      onAllReady() {
        stream.pipe(sink);
      },
      onShellError: reject,
      onError: reject,
    });
  });
}

export async function render(path: string): Promise<string> {
  setSsrPath(path);
  try {
    await warmUp(path);
    return renderToString(<App ssrPath={path} />);
  } finally {
    setSsrPath(null);
  }
}
