// 인벤토리 API 관련 함수들

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const API_VERSION = '/api/v1';

// 아이템 타입
export type Item = {
  itemId: string;
  name: string;
  description?: string;
  obtainedAt?: string;
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

// 아이템 마스터 목록 조회
export async function getItemsMaster(): Promise<Item[]> {
  const response = await fetch(`${API_BASE_URL}${API_VERSION}/items`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
    }
    throw new Error(`Failed to fetch items master: ${response.status}`);
  }

  const result = await response.json();
  return result.success && result.data ? result.data : result;
}

// 세션 인벤토리 조회
export async function getSessionInventory(sessionId: string): Promise<Item[]> {
  const response = await fetch(
    `${API_BASE_URL}${API_VERSION}/sessions/${sessionId}/inventory`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
    }
    if (response.status === 403) {
      throw new Error('세션 소유자가 아닙니다.');
    }
    throw new Error(`Failed to fetch inventory: ${response.status}`);
  }

  const result = await response.json();
  return result.success && result.data ? result.data : result;
}

// 바닥 아이템 클릭 획득
export async function acquireItem(
  sessionId: string,
  itemId: string
): Promise<Item> {
  const response = await fetch(
    `${API_BASE_URL}${API_VERSION}/sessions/${sessionId}/inventory/acquire`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ itemId }),
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
    }
    if (response.status === 404) {
      throw new Error('존재하지 않는 아이템입니다.');
    }
    if (response.status === 403) {
      throw new Error('세션 소유자가 아닙니다.');
    }
    if (response.status === 409) {
      throw new Error('이미 획득한 아이템입니다.');
    }
    throw new Error(`Failed to acquire item: ${response.status}`);
  }

  const result = await response.json();
  return result.success && result.data ? result.data : result;
}

// 아이템 ID 매핑 (프론트엔드 ID -> 백엔드 ID)
export const ITEM_ID_MAP: Record<string, string> = {
  fur: 'ITEM_01', // 갈색 털뭉치
  coffee: 'ITEM_02', // 커피 자국
  card: 'ITEM_03', // 보안카드
  chocolate: 'ITEM_04', // 초콜릿 봉지
};

// 백엔드 ID -> 프론트엔드 ID
export const ITEM_ID_REVERSE_MAP: Record<string, string> = {
  ITEM_01: 'fur',
  ITEM_02: 'coffee',
  ITEM_03: 'card',
  ITEM_04: 'chocolate',
};

// NPC 이름 매핑 (프론트엔드 -> 백엔드)
export const NPC_NAME_MAP: Record<string, string> = {
  라이언: 'RYAN',
  무지: 'MUZI',
  어피치: 'APEACH',
  프로도: 'FRODO',
};

// 백엔드 NPC 이름 -> 프론트엔드
export const NPC_NAME_REVERSE_MAP: Record<string, string> = {
  RYAN: '라이언',
  MUZI: '무지',
  APEACH: '어피치',
  FRODO: '프로도',
};
