"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function MotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const page = {
    initial: {
      opacity: 0,
      filter: "blur(6px) contrast(1.15) brightness(0.85)",
      transform: "translateY(18px) scale(0.985)",
    },
    animate: {
      opacity: 1,
      filter: "blur(0px) contrast(1) brightness(1)",
      transform: "translateY(0px) scale(1)",
      transition: {
        duration: 0.08,
        ease: [0.2, 0.8, 0.2, 1],
      },
    },
    exit: {
      opacity: 0,
      filter: "blur(6px) contrast(1.15) brightness(0.85)",
      transform: "translateY(-18px) scale(0.985)",
      transition: {
        duration: 0.28,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  // 위치 이동 제거한 글리치 (색/밝기만 순간 변화)
  const glitch = {
    initial: {
      filter: "contrast(1) brightness(1)",
    },
    animate: {
      filter: [
        "contrast(1.25) brightness(0.95)",
        "contrast(1.1) brightness(1.05)",
        "contrast(1) brightness(1)",
      ],
      transition: {
        duration: 0.05,
        ease: "linear",
      },
    },
    exit: {
      filter: "contrast(1) brightness(1)",
      transition: {
        duration: 0.05,
        ease: "linear",
      },
    },
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        style={{ minHeight: "100vh", position: "relative" }}
      >
        {/* 화면 오버레이: 스캔라인 + 살짝 비네팅 느낌 */}
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            pointerEvents: "none",
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.22) 70%, rgba(0,0,0,0.45) 100%), repeating-linear-gradient(to bottom, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, rgba(0,0,0,0) 3px, rgba(0,0,0,0) 6px)",
            mixBlendMode: "overlay",
          }}
        />

        {/* 실제 페이지 컨텐츠 */}
        <motion.div
          variants={page}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <motion.div
            variants={glitch}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {children}
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
