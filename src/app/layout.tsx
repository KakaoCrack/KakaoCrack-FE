// src/app/layout.tsx
import "./globals.css";
import localFont from "next/font/local";

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
      <body className={dungGeunMO.className}>{children}</body>
    </html>
  );
}
