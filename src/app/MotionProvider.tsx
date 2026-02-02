"use client";

import { AnimatePresence, motion, Variants } from "framer-motion";
import { usePathname } from "next/navigation";

export default function MotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // 1. 애니메이션 타이밍 조정 (너무 빠르지 않게 수정)
  const page: Variants = {
    initial: {
      opacity: 0,
      filter: "blur(4px) contrast(1.1) brightness(0.9)", // 흐림 정도 살짝 완화
      transform: "translateY(10px) scale(0.99)", // 이동 거리 살짝 줄임 (자연스러움 유도)
    },
    animate: {
      opacity: 1,
      filter: "blur(0px) contrast(1) brightness(1)",
      transform: "translateY(0px) scale(1)",
      transition: {
        duration: 0.35, // 0.08 -> 0.35로 늘려서 부드럽게 변경
        ease: [0.25, 1, 0.5, 1], // 부드러운 감속 커브 (cubic-bezier)
      },
    },
    exit: {
      opacity: 0,
      filter: "blur(4px) contrast(1.1) brightness(0.9)",
      transform: "translateY(-10px) scale(0.99)",
      transition: {
        duration: 0.2, // 나갈 때는 들어올 때보다 약간 빠르게
        ease: [0.25, 1, 0.5, 1],
      },
    },
  };

  // CRT/노이즈 효과 (배경)
  const overlayStyle: React.CSSProperties = {
    pointerEvents: "none",
    position: "absolute", // fixed에서 absolute로 변경하여 레이아웃 문제 방지
    inset: 0,
    zIndex: 9999,
    background:
      "radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 70%, rgba(0,0,0,0.3) 100%), repeating-linear-gradient(to bottom, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, rgba(0,0,0,0) 3px, rgba(0,0,0,0) 6px)",
    mixBlendMode: "overlay",
  };

  return (
    <AnimatePresence mode="wait">
      {/* ✅ 핵심 수정 사항: 
        key={pathname}과 variants={page}를 동일한 motion.div에 적용해야 
        AnimatePresence가 정상적으로 퇴장 애니메이션을 인식합니다.
      */}
      <motion.div
        key={pathname}
        variants={page}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ minHeight: "100vh", position: "relative", width: "100%" }}
      >
        {/* CRT 오버레이 효과도 페이지와 함께 페이드인/아웃 되도록 내부로 포함 */}
        <div style={overlayStyle} aria-hidden="true" />

        {/* 글리치 효과나 내부 컨텐츠 */}
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
