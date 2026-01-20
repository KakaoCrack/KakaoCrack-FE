"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import backgroundImage from "@/assets/images/로그인 배경화면.png";

export default function LoginPage() {
  const router = useRouter();

  // 로그인 페이지 진입 시 게임 데이터 초기화
  useEffect(() => {
    // 게임 관련 localStorage 초기화
    localStorage.removeItem("collectedItems"); // 획득한 아이템
    localStorage.removeItem("gameStartTime"); // 게임 시작 시간
    localStorage.removeItem("playTime"); // 플레이 타임
    
    console.log("게임 데이터 초기화 완료");
  }, []);

  const handleKakaoLogin = () => {
    console.log("카카오 로그인 (로컬) → /game 이동");
    router.push("/game");
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
              className="
                text-4xl font-bold mb-4 tracking-wider
                bg-gradient-to-b from-[#FFF7D1] via-[#FAC824] to-[#B8872E]
                bg-clip-text text-transparent
                [text-shadow:2px_2px_8px_rgba(0,0,0,0.8)]
              "
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
                className="text-white text-sm tracking-widest mt-2"
                style={{ textShadow: "1px 1px 3px rgba(0, 0, 0, 0.8)" }}
              >
                진실은 질문 속에 있다
              </p>
            </div>
          </div>

          {/* 하단 로그인 버튼 영역 */}
          <div className="flex flex-col items-center w-full">
            <button
              onClick={handleKakaoLogin}
              className="
                relative
                w-full max-w-[290px] h-[60px]
                bg-[#FEE500] rounded-xl
                flex items-center justify-center gap-3
                transition-transform hover:scale-105 active:scale-95
                shadow-lg
              "
            >
              {/* 카카오 아이콘 */}
              <Image
                src="/icon/kakao_icon.svg"
                alt="카카오 로그인"
                width={24}
                height={24}
                className="absolute left-6 top-1/3 -translate-y-1/2 translate-y-[1px]"
              />

              <span className="text-[#3C1E1E] text-xl font-bold">
                카카오 로그인
              </span>
            </button>

            <p
              className="text-white text-xs mt-4 text-center"
              style={{ textShadow: "1px 1px 3px rgba(0, 0, 0, 0.8)" }}
            >
              로그인 후 바로 수사가 시작됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
