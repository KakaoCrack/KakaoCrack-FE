"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import backgroundImage from "@/assets/images/로그인 배경화면.png";

export default function LoginPage() {
  const router = useRouter();

  const handleStartpage = () => {
    // 로컬에서 바로 게임 페이지로 이동
    console.log("GASME START - 시작 페이지로 이동");
    router.push("/start");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      {/* 모바일 앱 컨테이너 - 430 x 844 */}
      <div className="relative w-[430px] h-[844px] overflow-hidden">
        {/* 배경 이미지 */}
        <Image
          src={backgroundImage}
          alt="로그인 배경"
          fill
          className="object-cover"
          priority
        />

        {/* 컨텐츠 */}
        <div className="relative z-10 flex flex-col items-center justify-between h-full px-12 py-20">
          {/* 상단 제목 영역 */}
          <div className="flex flex-col items-center text-center mt-32">
            <h1
              className="text-4xl font-bold mb-4 tracking-wider
              bg-gradient-to-b from-[#FFF7D1] via-[#FAC824] to-[#B8872E]
              bg-clip-text text-transparent
              [text-shadow:2px_2px_8px_rgba(0,0,0,0.8)]"
              style={{
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              황금 콘 도난 사건
            </h1>
            <div className="-mt-5">
              <div className="my-3 w-64 h-[2px] bg-gradient-to-r from-[#444444] via-[#B8872E] to-[#444444]" />
              <p
                className="text-gray-300 text-sm tracking-widest mt-2"
                style={{ textShadow: "1px 1px 3px rgba(0, 0, 0, 0.8)" }}
              >
                진실은 질문 속에 있다
              </p>
            </div>
          </div>
        </div>

        {/* 하단 GAME START 버튼 영역 */}
        <div className="relative -top-60 flex flex-col items-center w-full z-20">
          <button 
            onClick={handleStartpage}
            className="group transition-transform hover:scale-105"
          >
            <span
              className="text-5xl text-gray-300 group-hover:text-[#E2BF25] text-center transition-colors duration-300"
              style={{ textShadow: "1px 5px 3px rgba(0, 0, 0, 0.8)" }}
            >
              GAME START
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
