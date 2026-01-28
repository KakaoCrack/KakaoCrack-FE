// src/utils/sound.ts

export type SfxType =
  | "typing" // 캐릭터 텍스트 출력
  | "click" // 기본 클릭
  | "hover" // 마우스 호버
  | "item_get" // 아이템 획득
  | "modal_open" // 모달 열기
  | "hint"; // 힌트 알림

export const playSFX = (type: SfxType) => {
  // 1. 타입별 파일 경로 매핑 (스크린샷 파일명 기준)
  const sfxFiles: Record<SfxType, string> = {
    click: "/sfx/버튼클릭.mp3",
    hover: "/sfx/마우스호버.mp3",
    item_get: "/sfx/아이템획득.mp3",
    modal_open: "/sfx/모달열기.mp3",
    hint: "/sfx/힌트.mp3",
    typing: "/sfx/타이핑.mp3",
  };

  try {
    // 2. 오디오 객체 생성
    const audio = new Audio(sfxFiles[type]);

    // 3. 타입별 볼륨 조절 (호버는 작게, 중요 알림은 크게)
    switch (type) {
      case "hover":
        audio.volume = 0.2; // 거슬리지 않게 작게
        break;
      case "typing":
        audio.volume = 0.3; // 타자 소리 적당히
        break;
      case "click":
        audio.volume = 0.5;
        break;
      case "modal_open":
        audio.volume = 0.5;
        break;
      case "item_get":
      case "hint":
        audio.volume = 0.6; // 기분 좋은 소리는 명확하게
        break;
    }

    // 4. 재생 (빠르게 반복될 수 있도록 탐색 위치 초기화)
    audio.currentTime = 0;
    audio.play().catch(() => {
      // 사용자 인터랙션 전이라 재생이 막히는 경우 무시
    });
  } catch (e) {
    console.error("Audio Play Error:", e);
  }
};
