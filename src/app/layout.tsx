// src/app/layout.tsx
import "./globals.css";
import localFont from "next/font/local";
import MotionProvider from "./MotionProvider";
// [추가] 배경음악 컴포넌트 불러오기
import BackgroundMusic from "@/components/common/BackgroundMusic";

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
    <html lang="ko">
      <body className={dungGeunMO.className}>
        {/* [추가] 배경음악 컴포넌트 배치 (페이지가 바뀌어도 유지됨) */}
        <BackgroundMusic />

        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
