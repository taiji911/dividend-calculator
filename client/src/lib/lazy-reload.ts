import { lazy, type ComponentType } from "react";

/**
 * 나중에 불러오는 화면 조각(차트 등).
 * 사이트를 새로 배포하면 예전 조각 파일이 사라져서, 배포 전에 열어 둔 화면에서는 불러오기가 실패할 수 있어요.
 * 그때는 페이지를 한 번만 새로고침해서 새 파일을 받아요.
 */
export function lazyWithReload<T extends ComponentType<any>>(load: () => Promise<{ default: T }>) {
  return lazy(async () => {
    const KEY = "dc.chunk-reload";
    try {
      const mod = await load();
      try {
        sessionStorage.removeItem(KEY);
      } catch {
        /* 무시 */
      }
      return mod;
    } catch (err) {
      let reloaded = false;
      try {
        reloaded = sessionStorage.getItem(KEY) === "1";
        if (!reloaded) sessionStorage.setItem(KEY, "1");
      } catch {
        /* 저장소를 못 쓰면 새로고침하지 않아요 */
        reloaded = true;
      }
      if (!reloaded && typeof window !== "undefined") {
        window.location.reload();
        return new Promise<{ default: T }>(() => {}); // 새로고침되는 동안 기다려요
      }
      throw err;
    }
  });
}
