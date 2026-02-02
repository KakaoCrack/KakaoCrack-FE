"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import bgImage from "@/assets/images/캐릭터 선택 페이지 배경화면.png";
import buttonBg from "@/assets/images/캐릭터 선택 배경 2.png";
import { clearGameData } from "@/lib/api/auth";
import { playSFX } from "@/utils/sound"; // [SFX] 사운드 추가

export default function SuccessEndingPage() {
  const router = useRouter();
  const [playTime, setPlayTime] = useState<string>("0분 0초");

  // 1. 카카오 SDK 초기화
  useEffect(() => {
    if (typeof window !== "undefined" && window.Kakao) {
      if (!window.Kakao.isInitialized()) {
        // .env 파일에 NEXT_PUBLIC_KAKAO_API_KEY가 있어야 합니다.
        window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_API_KEY);
      }
    }
  }, []);

  // 2. 플레이 타임 계산 로직
  useEffect(() => {
    const startTimeStr = localStorage.getItem("gameStartTime");
    if (startTimeStr) {
      const startTime = new Date(startTimeStr);
      let endTimeStr = localStorage.getItem("gameEndTime");
      let endTime: Date;

      if (!endTimeStr) {
        endTime = new Date();
        localStorage.setItem("gameEndTime", endTime.toISOString());
      } else {
        endTime = new Date(endTimeStr);
      }

      const diffMs = endTime.getTime() - startTime.getTime();
      const hours = Math.floor(diffMs / 3600000);
      const minutes = Math.floor((diffMs % 3600000) / 60000);
      const seconds = Math.floor((diffMs % 60000) / 1000);

      // 02분 10초 처럼 두 자리수로 맞추려면 padStart 사용 (선택사항)
      // 여기서는 기존 로직 유지하되 포맷만 맞춤
      let timeString = "";
      if (hours > 0) {
        timeString = `${hours}시간 ${minutes}분 ${seconds}초`;
      } else {
        // 분/초가 한 자리일 때 '0' 붙여서 예쁘게 만들기 (이미지처럼)
        const mm = String(minutes).padStart(2, "0");
        const ss = String(seconds).padStart(2, "0");
        timeString = `${mm}분 ${ss}초`;
      }

      setPlayTime(timeString);
      localStorage.setItem("playTime", timeString);
    }
  }, []);

  const handleRestart = () => {
    playSFX("click");
    console.log("게임 재시작 - 모든 게임 데이터 초기화");
    clearGameData();
    router.push("/start");
  };

  // ✅ [수정됨] 키 값을 직접 넣어서 환경 변수 문제를 원천 차단합니다.
  const handleShare = () => {
    playSFX("click");
    console.log("결과 공유하기 클릭");

    // 1. SDK 로드 확인
    if (!window.Kakao) {
      alert("카카오톡 SDK가 로드되지 않았습니다.");
      return;
    }

    // 2. 초기화 (환경 변수 대신 실제 키 사용)
    // 배포 환경에서 .env를 못 읽는 문제를 배제하기 위함입니다.
    if (!window.Kakao.isInitialized()) {
      console.log("카카오 SDK 초기화 시도...");
      window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_API_KEY);
    }

    const DEPLOY_URL = "https://kakaocrack-572d9.web.app";
    // ⚠️ 파일명이 thumbnail.png 인지 꼭 확인해주세요 (스크린샷엔 안보임)
    const IMAGE_URL = `${DEPLOY_URL}/thumbnail.png`;

    console.log("공유하기 요청 전송...");

    // 3. 공유하기 실행
    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: "추리 성공! 황금 콘 회수 완료 💎",
        description: `플레이 타임: ${playTime} | \n당신의 추리력을 테스트해보세요.`,
        imageUrl: IMAGE_URL,
        link: {
          mobileWebUrl: DEPLOY_URL,
          webUrl: DEPLOY_URL,
        },
      },
      buttons: [
        {
          title: "나도 도전하기",
          link: {
            mobileWebUrl: DEPLOY_URL,
            webUrl: DEPLOY_URL,
          },
        },
      ],
    });
  };

  return (
    <div className="min-h-screen w-full bg-[#121212] flex items-center justify-center font-dunggeunmo p-4">
      <main
        className="relative overflow-hidden flex flex-col items-center shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-[#3e2723] rounded-lg"
        style={{ width: "1100px", height: "844px" }}
      >
        {/* 1. 배경 이미지  */}
        <div className="absolute inset-0 z-0">
          <Image
            src={bgImage}
            alt="Background"
            fill
            className="object-cover opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80" />
        </div>

        {/* 2. 중앙 결과 콘텐츠 영역 */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full w-full mt-10">
          {/* 캐릭터와 아이템이 들어가는 메인 컨테이너 */}
          <div className="relative w-[500px] h-[400px] flex items-end justify-center mb-10">
            {/* 1. ARREST 도장 */}
            <div className="absolute top-[200px] -left-[180px] z-30 animate-stamp-slam">
              <div className="border-[8px] border-[#ff0000] px-6 py-2 rounded-xl transform rotate-[25deg] bg-black/10 backdrop-blur-[1px]">
                <span className="text-[#ff0000] text-7xl font-black tracking-tighter opacity-90 font-sans whitespace-nowrap">
                  ARREST
                </span>
              </div>
            </div>

            {/* 2. 잡힌 범인 캐릭터 */}
            <div className="relative w-80 h-60 z-10">
              <Image
                src="/character/프로도_당황.svg"
                alt="Caught Character"
                fill
                className="object-contain drop-shadow-2xl"
              />
            </div>

            {/* 3. 황금 콘 */}
            <div className="absolute right-0 bottom-0 w-32 h-32 z-20 animate-bounce-subtle translate-x-[20px]">
              <Image
                src="/character/황금 콘.svg"
                alt="Golden Con"
                fill
                className="object-contain drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]"
              />
            </div>
          </div>

          {/* 결과 메시지 */}
          <div className="text-center mb-8">
            <span className="text-[#D4AF37] text-4xl font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              추리 성공 !! 황금 콘 동상을 되찾았습니다 ! <br />
            </span>
            <div className="mt-6 text-[#f3e5ab] text-2xl font-semibold">
              플레이 타임: <span className="text-[#D4AF37]">{playTime}</span>
            </div>
          </div>

          {/* 3. 하단 버튼 영역 */}
          <div className="flex gap-8">
            {/* 다시 시작하기 버튼 */}
            <button
              onClick={handleRestart}
              onMouseEnter={() => playSFX("hover")}
              className="relative overflow-hidden px-12 py-4 border-4 border-[#8b5e3c] rounded-md text-xl font-bold text-white transition-all hover:brightness-110 active:scale-95 shadow-[0_4px_0_0_#2a1d15]"
            >
              <div className="absolute inset-0 z-0">
                <Image
                  src={buttonBg}
                  alt="Button Bg"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="relative z-10">다시 시작하기</span>
            </button>

            {/* 결과 공유하기 버튼 */}
            <button
              onClick={handleShare}
              onMouseEnter={() => playSFX("hover")}
              className="relative overflow-hidden px-12 py-4 border-4 border-[#8b5e3c] rounded-md text-xl font-bold text-white transition-all hover:brightness-110 active:scale-95 shadow-[0_4px_0_0_#2a1d15]"
            >
              <div className="absolute inset-0 z-0">
                <Image
                  src={buttonBg}
                  alt="Button Bg"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="relative z-10">결과 공유하기</span>
            </button>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes bounce-subtle {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite ease-in-out;
        }
        @keyframes stamp-slam {
          0% {
            transform: scale(3) rotate(25deg);
            opacity: 0;
          }
          100% {
            transform: scale(1) rotate(25deg);
            opacity: 1;
          }
        }
        .animate-stamp-slam {
          animation: stamp-slam 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
            forwards;
        }
      `}</style>
    </div>
  );
}
