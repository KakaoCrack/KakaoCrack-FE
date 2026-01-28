// 게임 세션 API 관련 함수들

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const API_VERSION = '/api/v1';

// 세션 타입
export type GameSession = {
  sessionId: number;
  remainingQuestions: number;
  startTime: string;
  gameProgress: number;
};

// JWT 토큰을 포함한 헤더 생성
function getAuthHeaders(): HeadersInit {
  const accessToken = localStorage.getItem('accessToken');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  return headers;
}

// 새 게임 시작 (세션 생성)
export async function createGameSession(): Promise<GameSession> {
  const response = await fetch(`${API_BASE_URL}${API_VERSION}/sessions`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
    }
    throw new Error(`Failed to create session: ${response.status}`);
  }

  const result = await response.json();
  
  // 백엔드 응답 형식: { success, data, message }
  if (result.success && result.data) {
    return result.data;
  }
  
  throw new Error(result.message || 'Failed to create session');
}

// localStorage에 세션 정보 저장
export function saveSessionData(session: GameSession) {
  localStorage.setItem('sessionId', session.sessionId.toString());
  localStorage.setItem('remainingQuestions', session.remainingQuestions.toString());
  // gameStartTime은 start 페이지에서 현재 시간으로 직접 설정됨 (실제 플레이타임 측정용)
  localStorage.setItem('gameProgress', session.gameProgress.toString());
}

// 세션 ID 가져오기
export function getSessionId(): string | null {
  return localStorage.getItem('sessionId');
}
