// 인증 API 관련 함수들

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const API_VERSION = '/api/v1';

// 사용자 타입
export type User = {
  id: number;
  kakaoId: string;
  nickname: string;
  createdAt: string;
};

// 토큰 타입
export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

// 카카오 콜백 응답 타입
export type KakaoCallbackResponse = {
  user: User;
  tokens: Tokens;
  isNewUser: boolean;
};

// 카카오 콜백 처리 (인가코드로 로그인)
export async function kakaoCallback(code: string): Promise<KakaoCallbackResponse> {
  const response = await fetch(
    `${API_BASE_URL}${API_VERSION}/auth/kakao/callback?code=${code}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error('잘못된 인가코드입니다.');
    }
    if (response.status === 401) {
      throw new Error('카카오 로그인에 실패했습니다.');
    }
    throw new Error(`Login failed: ${response.status}`);
  }

  return response.json();
}

// 토큰 재발급
export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
  const response = await fetch(
    `${API_BASE_URL}${API_VERSION}/auth/refresh`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('리프레시 토큰이 만료되었습니다. 다시 로그인해주세요.');
    }
    throw new Error(`Token refresh failed: ${response.status}`);
  }

  return response.json();
}

// localStorage에 인증 정보 저장
export function saveAuthData(user: User, tokens: Tokens) {
  localStorage.setItem('accessToken', tokens.accessToken);
  localStorage.setItem('refreshToken', tokens.refreshToken);
  localStorage.setItem('userId', user.id.toString());
  localStorage.setItem('userNickname', user.nickname);
}

// localStorage에서 인증 정보 삭제 (로그아웃)
export function clearAuthData() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('userNickname');
  localStorage.removeItem('sessionId');
  localStorage.removeItem('collectedItems');
  localStorage.removeItem('gameStartTime');
  localStorage.removeItem('playTime');
}

// 카카오 로그인 URL 생성
export function getKakaoLoginUrl(): string {
  const KAKAO_REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
  const KAKAO_REDIRECT_URI = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI || 
    `${window.location.origin}/auth/callback`;

  if (!KAKAO_REST_API_KEY) {
    throw new Error('카카오 REST API 키가 설정되지 않았습니다. .env.local 파일을 확인해주세요.');
  }

  return `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${encodeURIComponent(KAKAO_REDIRECT_URI)}&response_type=code`;
}
