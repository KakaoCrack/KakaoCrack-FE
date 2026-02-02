import { Suspense } from "react";
import KakaoCallbackClient from "./KakaoCallbackClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <KakaoCallbackClient />
    </Suspense>
  );
}
