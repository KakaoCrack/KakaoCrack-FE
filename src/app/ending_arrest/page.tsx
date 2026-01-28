"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
// 캐릭터 선택 페이지에서 사용했던 배경과 폰트 스타일을 유지합니다.
import bgImage from "@/assets/images/캐릭터 선택 페이지 배경화면.png";
import buttonBg from "@/assets/images/캐릭터 선택 배경 2.png";
import { clearGameData } from "@/lib/api/auth";

export default function SuccessEndingPage() {
  const router = useRouter();
  const [playTime, setPlayTime] = useState<string>("0분 0초");

  useEffect(() => {
    // 플레이타임 계산
    const startTimeStr = localStorage.getItem("gameStartTime");
    if (startTimeStr) {
      const startTime = new Date(startTimeStr);
      
      // 종료 시간을 localStorage에서 먼저 확인
      // 이미 저장된 종료 시간이 있으면 그것을 사용 (페이지에 머물러도 시간이 고정됨)
      let endTimeStr = localStorage.getItem("gameEndTime");
      let endTime: Date;
      
      if (!endTimeStr) {
        // 종료 시간이 없으면 현재 시간을 종료 시간으로 저장
        endTime = new Date();
        localStorage.setItem("gameEndTime", endTime.toISOString());
        console.log("✅ 게임 종료 시간 저장:", endTime.toISOString());
      } else {
        // 이미 저장된 종료 시간 사용
        endTime = new Date(endTimeStr);
        console.log("📌 저장된 게임 종료 시간 사용:", endTime.toISOString());
      }
      
      // 밀리초 차이 계산
      const diffMs = endTime.getTime() - startTime.getTime();
      
      // 시간, 분, 초로 변환
      const hours = Math.floor(diffMs / 3600000);
      const minutes = Math.floor((diffMs % 3600000) / 60000);
      const seconds = Math.floor((diffMs % 60000) / 1000);
      
      // 시간 포맷 생성
      let timeString = "";
      if (hours > 0) {
        timeString = `${hours}시간 ${minutes}분 ${seconds}초`;
      } else if (minutes > 0) {
        timeString = `${minutes}분 ${seconds}초`;
      } else {
        timeString = `${seconds}초`;
      }
      
      setPlayTime(timeString);
      
      // 플레이타임을 localStorage에 저장 (카카오 공유 시 사용)
      localStorage.setItem("playTime", timeString);
      
      // 디버깅용 로그
      console.log("게임 시작 시간:", startTime.toLocaleString());
      console.log("게임 종료 시간:", endTime.toLocaleString());
      console.log("플레이 시간:", timeString);
      console.log("총 밀리초:", diffMs);
    }
  }, []);

  // 다시 시작하기: 모든 게임 데이터 초기화 후 start 페이지로 이동
  const handleRestart = () => {
    console.log("게임 재시작 - 모든 게임 데이터 초기화");
    
    // 게임 데이터 완전 초기화 (인증 정보는 유지)
    clearGameData();
    
    // start 페이지로 이동 (새 세션 자동 생성됨)
    router.push("/start");
  };

  // 결과 공유하기: 카카오 공유 등 외부 API 연동 가능
  const handleShare = () => {
    console.log("결과 공유하기 클릭");
    console.log("플레이타임:", playTime);
    // TODO: 카카오 공유하기 로직 추가
    // 플레이타임은 localStorage.getItem("playTime")으로 가져올 수 있음
    /////////////////////////////////
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
            className="object-cover opacity-40" // 결과 페이지는 좀 더 어둡게 설정
            priority
          />
          {/* 하단 그라데이션 오버레이로 텍스트 가독성 확보 */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80" />
        </div>

        {/* 2. 중앙 결과 콘텐츠 영역 */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full w-full mt-10">
          {/* 캐릭터와 아이템이 들어가는 메인 컨테이너 (도장은 여기서 분리함) */}
          <div className="relative w-[500px] h-[400px] flex items-end justify-center mb-10">
            {/* 1. ARREST 도장 (위치 수정: 컨테이너 밖으로 더 왼쪽으로 뺌) */}
            {/* left 값을 마이너스로 주거나, 부모 기준 절대 위치로 변경 */}
            <div className="absolute top-[200px] -left-[180px] z-30 animate-stamp-slam">
              <div className="border-[8px] border-[#ff0000] px-6 py-2 rounded-xl transform rotate-[25deg] bg-black/10 backdrop-blur-[1px]">
                <span className="text-[#ff0000] text-7xl font-black tracking-tighter opacity-90 font-sans whitespace-nowrap">
                  ARREST
                </span>
              </div>
            </div>

            {/* 2. 잡힌 범인 캐릭터 (중앙) */}
            <div className="relative w-80 h-60 z-10">
              <Image
                src="/character/프로도_당황.svg"
                alt="Caught Character"
                fill
                className="object-contain drop-shadow-2xl"
              />
            </div>

            {/* 3. 황금 콘 (위치 수정: 캐릭터 쪽으로 당기기) */}
            {/* right-0 : 캐릭터 컨테이너의 오른쪽 끝에 딱 붙음
        translate-x : 미세 조정 (음수면 왼쪽, 양수면 오른쪽) */}
            <div className="absolute right-0 bottom-0 w-32 h-32 z-20 animate-bounce-subtle translate-x-[20px]">
              <Image
                src="/character/황금 콘.svg"
                alt="Golden Con"
                fill
                className="object-contain drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]"
              />
            </div>
          </div>

          {/* 결과 메시지: 금색(#D4AF37) 포인트 */}
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
      `}</style>
    </div>
  );
}
