/**
 * 페이지별 HTML 미리 만들기
 *   1) vite build            → dist/public (화면용 파일)
 *   2) vite build --ssr      → dist/server/entry-server.js (HTML을 만드는 코드)
 *   3) 이 스크립트            → dist/public/goal.html 처럼 페이지마다 완성된 HTML + 404.html + sitemap.xml
 * 검색엔진은 자바스크립트를 실행하지 않아도 제목·본문·FAQ를 바로 읽을 수 있어요.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const pub = path.join(root, "dist/public");
const serverEntry = path.join(root, "dist/server/entry-server.js");

const { render, ROUTES, headTags, notFoundHeadTags, sitemapXml } = await import(pathToFileURL(serverEntry).href);
const template = fs.readFileSync(path.join(pub, "index.html"), "utf8");

if (!/<!--seo:start-->[\s\S]*?<!--seo:end-->/.test(template)) throw new Error("index.html 에 <!--seo:start--> 표시가 없어요");
if (!template.includes('<div id="root"></div>')) throw new Error('index.html 에 <div id="root"></div> 가 없어요');

function page(html, head, lang) {
  return template
    .replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, `<!--seo:start-->\n${head}\n    <!--seo:end-->`)
    .replace(/<html lang="[^"]*">/, `<html lang="${lang}">`)
    .replace('<div id="root"></div>', `<div id="root">${html}</div>`);
}

function write(rel, content) {
  const file = path.join(pub, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  console.log(`  ✓ ${rel}  (${(content.length / 1024).toFixed(1)} KB)`);
}

console.log("페이지별 HTML 만드는 중…");
for (const r of ROUTES) {
  const html = await render(r.path);
  const file = r.path === "/" ? "index.html" : `${r.path.slice(1)}.html`;
  write(file, page(html, headTags(r.key, r.lang), r.lang));
}
write("404.html", page(await render("/__not-found__"), notFoundHeadTags(), "ko"));

const today = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10); // 한국 날짜
write("sitemap.xml", sitemapXml(today));
console.log("완료");
