"use client";
import dynamic from "next/dynamic";

// SSR을 끄고 브라우저에서만 렌더링 (개발 속도 향상)
const GameInterface = dynamic(
  () => import("@/features/interrogation/GameInterface"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-white text-xl">로딩 중...</div>
      </div>
    ),
  }
);

export default function InterrogationPage() {
  return <GameInterface />;
}
