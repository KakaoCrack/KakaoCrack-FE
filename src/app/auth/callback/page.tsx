"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { kakaoCallback, saveAuthData } from "@/lib/api/auth";

export default function KakaoCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      // URL에서 인가코드 가져오기
      const code = searchParams.get("code");

      if (!code) {
        setError("인가코드가 없습니다.");
        return;
      }

      try {
        // 백엔드 API 호출
        const response = await kakaoCallback(code);

        // 인증 정보 저장
        saveAuthData(response.user, response.tokens);

        console.log("로그인 성공:", response.user.nickname);
        console.log("신규 유저:", response.isNewUser);

        // 게임 시작 페이지로 이동
        router.push("/game");
      } catch (err) {
        console.error("로그인 실패:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("로그인에 실패했습니다.");
        }

        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="relative w-[430px] h-[844px] flex items-center justify-center">
        <div className="text-center">
          {error ? (
            <div>
              <p className="text-red-500 text-xl font-bold mb-4">❌ {error}</p>
              <p className="text-white text-sm">
                잠시 후 로그인 페이지로 이동합니다...
              </p>
            </div>
          ) : (
            <div>
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400 mx-auto mb-4"></div>
              <p className="text-white text-xl font-bold">로그인 중...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
