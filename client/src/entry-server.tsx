/**
 * 빌드 때만 쓰는 입구 — 페이지마다 화면을 HTML 문자열로 미리 만들어요.
 * (npm run build → scripts/prerender.mjs 가 이 파일을 불러서 dist/public 에 페이지별 HTML을 써요)
 * 나중에 불러오는 차트(lazy)까지 다 그린 뒤에 HTML을 돌려줘요.
 */
import { renderToPipeableStream } from "react-dom/server";
import { Writable } from "node:stream";
import App from "./App";
import { setSsrPath } from "./lib/i18n";

export { ROUTES, headTags, notFoundHeadTags, sitemapXml } from "./lib/seo-head";

export function render(path: string): Promise<string> {
  setSsrPath(path);
  return new Promise((resolve, reject) => {
    let html = "";
    const sink = new Writable({
      write(chunk, _enc, cb) {
        html += chunk.toString();
        cb();
      },
      final(cb) {
        setSsrPath(null);
        resolve(html);
        cb();
      },
    });
    const stream = renderToPipeableStream(<App ssrPath={path} />, {
      onAllReady() {
        stream.pipe(sink);
      },
      onShellError(err) {
        setSsrPath(null);
        reject(err);
      },
      onError(err) {
        reject(err);
      },
    });
  });
}
