import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 정적 배포(out 폴더 생성)
  output: "export",

  // next/image 쓰면 정적 배포에서 필요
  images: { unoptimized: true },

  // 새로고침 404 방지에 도움(권장)
  trailingSlash: true,

  // Turbopack에서 SVG를 React 컴포넌트로 사용(SVGR)
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
