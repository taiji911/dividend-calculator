// 글꼴: Pretendard를 사이트에 직접 포함 (외부 CDN이 막혀도 항상 적용)
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const root = document.getElementById("root")!;
// 빌드 때 미리 만든 HTML이 있으면 그 위에 이어 붙이고(hydrate), 없으면(개발 서버) 새로 그려요
if (root.hasChildNodes()) hydrateRoot(root, <App />);
else createRoot(root).render(<App />);
