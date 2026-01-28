"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function BackgroundMusic() {
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement>(null);

  // UI 표시용 State
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // 실제 트랙 변경 감지용 Ref
  const lastTrackRef = useRef<string | null>(null);

  // 🎵 [구간 1] 메인 테마
  const MAIN_BGM_PATHS = ["/", "/login", "/auth", "/start", "/game"];

  // 🎵 [구간 2] 취조 테마
  const INTERROGATION_BGM_PATHS = ["/characterselect", "/interrogation"];

  // 🎵 [구간 3] 엔딩 테마 (성공/실패)
  const ENDING_SUCCESS_PATHS = ["/ending_arrest"];
  const ENDING_FAIL_PATHS = ["/ending_fail"];

  const getTargetBgm = (path: string) => {
    // 1. 메인 테마 확인
    const isMain = MAIN_BGM_PATHS.some((target) =>
      target === "/" ? path === "/" : path.startsWith(target),
    );
    if (isMain) return "/bgm/메인bgm.mp3"; // 영어 파일명 권장

    // 2. 취조 테마 확인
    const isInterrogation = INTERROGATION_BGM_PATHS.some((target) =>
      path.startsWith(target),
    );
    if (isInterrogation) return "/bgm/취조bgm.mp3";

    // 3. 검거 성공 엔딩 확인
    const isSuccessEnding = ENDING_SUCCESS_PATHS.some((target) =>
      path.startsWith(target),
    );
    if (isSuccessEnding) return "/bgm/검거성공bgm.mp3";

    // 4. 검거 실패 엔딩 확인
    const isFailEnding = ENDING_FAIL_PATHS.some((target) =>
      path.startsWith(target),
    );
    if (isFailEnding) return "/bgm/검거실패bgm.mp3";

    return null;
  };

  const tryPlayMusic = async (audio: HTMLAudioElement) => {
    try {
      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // 1. 트랙 결정
    const targetTrack = getTargetBgm(pathname);

    // 2. 볼륨 조절 로직
    if (pathname.startsWith("/interrogation")) {
      audio.volume = 0.1;
    } else {
      audio.volume = 0.3;
    }

    // 3. 트랙 변경 감지 및 재생 로직
    if (targetTrack !== lastTrackRef.current) {
      lastTrackRef.current = targetTrack;

      // ✅ [핵심 수정 1] 상태 업데이트를 비동기(setTimeout)로 처리하여 렌더링 충돌 방지
      setTimeout(() => {
        setCurrentTrack(targetTrack);
      }, 0);

      if (targetTrack) {
        console.log(`🎵 BGM 변경: ${targetTrack}`);
        audio.src = targetTrack;

        // 반복 재생(loop) 여부 결정
        if (targetTrack.includes("ending")) {
          audio.loop = false; // 한 번만 재생
        } else {
          audio.loop = true; // 무한 반복
        }

        audio.load();
        void tryPlayMusic(audio);
      } else {
        console.log("⏹️ BGM 정지");
        audio.pause();

        // ✅ [핵심 수정 2] 여기서도 상태 업데이트 지연
        setTimeout(() => {
          setIsPlaying(false);
        }, 0);
      }
    } else {
      // 트랙은 같은데 멈춰있다면 재생 (예: 새로고침 시)
      if (targetTrack && audio.paused && !audio.ended) {
        void tryPlayMusic(audio);
      }
    }
  }, [pathname]);

  const toggleMusic = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      await tryPlayMusic(audioRef.current);
    }
  };

  return (
    <>
      <audio ref={audioRef} preload="auto" />

      {currentTrack && (
        <button
          onClick={() => void toggleMusic()}
          className="fixed bottom-4 left-4 z-[9999] w-12 h-12 bg-black/70 rounded-full border-2 border-[#D4AF37] flex items-center justify-center text-2xl hover:bg-black/90 transition-all active:scale-95 shadow-lg cursor-pointer"
          title={isPlaying ? "배경음악 끄기" : "배경음악 켜기"}
        >
          {isPlaying ? "🔊" : "🔇"}
        </button>
      )}
    </>
  );
}
