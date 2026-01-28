// src/components/common/GlobalSoundEffect.tsx
"use client";

import { useEffect } from "react";
import { playSFX } from "@/utils/sound";

export default function GlobalSoundEffect() {
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // 클릭한 요소가 버튼(button), 링크(a), 또는 클릭 가능한 요소(role="button")인지 확인
      // .closest()를 사용하여 아이콘을 클릭해도 부모 버튼을 인식하도록 함
      if (
        target.closest("button") ||
        target.closest("a") ||
        target.closest('[role="button"]') ||
        target.closest('input[type="submit"]') ||
        target.closest('input[type="button"]')
      ) {
        playSFX("click");
      }
    };

    // 화면 전체에 클릭 리스너 등록
    window.addEventListener("click", handleGlobalClick);

    return () => {
      window.removeEventListener("click", handleGlobalClick);
    };
  }, []);

  return null; // 화면에는 아무것도 표시하지 않음 (소리 기능만 담당)
}
