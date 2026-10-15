// 글꼴: Pretendard를 사이트에 직접 포함 (외부 CDN이 막혀도 항상 적용)
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
