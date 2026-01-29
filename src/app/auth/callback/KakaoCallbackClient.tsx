"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { kakaoCallback, saveAuthData } from "@/lib/api/auth";

export default function KakaoCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");

      if (!code) {
        setError("인가코드가 없습니다.");
        return;
      }

      try {
        const response = await kakaoCallback(code);
        saveAuthData(response.user, response.tokens);
        router.push("/game");
      } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError("로그인에 실패했습니다.");

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
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400 mx-auto mb-4" />
              <p className="text-white text-xl font-bold">로그인 중...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
