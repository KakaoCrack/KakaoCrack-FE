// src/app/layout.tsx
import "./globals.css";
import localFont from "next/font/local";
import MotionProvider from "./MotionProvider";
import Script from "next/script";
import BackgroundMusic from "@/components/common/BackgroundMusic";
import GlobalSoundEffect from "@/components/common/GlobalSoundEffect";

const dungGeunMO = localFont({
  src: "../assets/fonts/DungGeunMO.otf",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /* ✨ [핵심 수정] html 태그에도 배경색을 강제로 지정합니다. 
       페이지 전환 시 body가 투명해질 때 뒤에 있는 html의 흰색이 보이지 않게 막아줍니다. */
    <html lang="ko" className="bg-[#121212]">
      <body className={`${dungGeunMO.className} bg-[#121212] text-white`}>
        {/* 배경음악 컴포넌트 */}
        <BackgroundMusic />

        {/* 글로벌 효과음 컴포넌트 */}
        <GlobalSoundEffect />

        {/* 카카오 스크립트 */}
        <Script
          src="https://developers.kakao.com/sdk/js/kakao.js"
          strategy="afterInteractive"
        />

        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
