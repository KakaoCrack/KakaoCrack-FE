// src/app/layout.tsx
import "./globals.css";
import localFont from "next/font/local";
import MotionProvider from "./MotionProvider";

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
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
