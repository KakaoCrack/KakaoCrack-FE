"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import backgroundImage from "@/assets/images/시작 페이지 배경화면.png";
import inventoryBg from "@/assets/images/인벤토리 배경.png";
import {
  getSessionInventory,
  acquireItem,
  ITEM_ID_MAP,
  ITEM_ID_REVERSE_MAP,
} from "@/lib/api/inventory";
import {
  createGameSession,
  saveSessionData,
  getSessionId,
} from "@/lib/api/session";

// 아이템 타입 정의
type Item = {
  id: string;
  name: string;
  description: string;
  icon: string;
  miniIcon: string;
};

const ITEMS: Item[] = [
  {
    id: "fur",
    name: "갈색 털뭉치",
    description:
      "갈색 털뭉치\n\n누군가가 떨어뜨린\n갈색 털뭉치이다.\n갈색 털뭉치의 것일까?",
    icon: "/character/아이템_갈색털뭉치.svg",
    miniIcon: "/character/아이템_갈색털뭉치_미니.svg",
  },
  {
    id: "card",
    name: "보안카드",
    description:
      "보안카드\n\n현장에서 발견된 보안카드이다.\n오후 11시부터 11시 3분 사이에\n외출했다는 기록이 남아있다.\n소유자는 라이언 경비원으로 보인다.",
    icon: "/character/아이템_보안카드.svg",
    miniIcon: "/character/아이템_보안카드_미니.svg",
  },
  {
    id: "chocolate",
    name: "초콜릿 봉지",
    description:
      "초콜릿 봉지\n\n누군가가 떨어뜨린\n초콜릿 봉지이다.\n탐식실에 비치된 초콜릿과\n동일한 브랜드이다.",
    icon: "/character/아이템_초콜릿봉지.svg",
    miniIcon: "/character/아이템_초콜릿봉지_미니.svg",
  },
  {
    id: "coffee",
    name: "커피 자국",
    description:
      "커피 자국\n\n누군가가 커피를 흘린 자국이\n제대로 지워지지 않고\n희미하게 남아 있었다.\n어피치의 동선을 추적 의도했다.",
    icon: "/character/아이템_커피자국.svg",
    miniIcon: "/character/아이템_커피자국_미니.svg",
  },
  // 커피자국은 화면에 표시되지 않고, 서버 API 연동 시 어피치 호감도 조건 충족으로 자동 지급
];

export default function StartPage() {
  const router = useRouter();

  // 상태 관리
  const [inventory, setInventory] = useState<Item[]>([]);
  const [collectedItems, setCollectedItems] = useState<string[]>([]);
  const [showInventory, setShowInventory] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showItemDetailModal, setShowItemDetailModal] = useState(false);
  const [showLionModal, setShowLionModal] = useState(false);
  const [showStartButton, setShowStartButton] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [isAcquiring, setIsAcquiring] = useState(false); // 아이템 획득 중 상태

  // 페이지 로드 시 세션 생성 및 인벤토리 불러오기
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTutorialModal(true);
    }, 1000);

    let isInitializing = false; // 중복 실행 방지

    const initializeGame = async () => {
      // 이미 초기화 중이면 중단
      if (isInitializing) {
        console.log("이미 초기화 중입니다. 중복 실행 방지.");
        return;
      }

      let sessionId = getSessionId();

      // 세션이 없으면 새로 생성
      if (!sessionId) {
        // 세션 생성 중 플래그 체크
        const isCreating = sessionStorage.getItem("sessionCreating");
        if (isCreating === "true") {
          console.log("세션 생성 중입니다. 대기...");
          return;
        }

        console.log("세션이 없습니다. 새 게임 세션을 생성합니다...");
        isInitializing = true;
        sessionStorage.setItem("sessionCreating", "true");

        try {
          const session = await createGameSession();
          saveSessionData(session);
          sessionId = session.sessionId.toString();

          // 🎮 게임 시작 시간을 현재 시간으로 설정 (실제 플레이타임 측정용)
          const currentTime = new Date().toISOString();
          localStorage.setItem("gameStartTime", currentTime);

          console.log("✅ 새 게임 세션 생성 완료:", {
            sessionId: session.sessionId,
            remainingQuestions: session.remainingQuestions,
            gameStartTime: currentTime,
          });
        } catch (error) {
          console.error("세션 생성 실패:", error);

          // 인증 오류 또는 403 에러 시 로그인 페이지로 이동
          if (
            error instanceof Error &&
            (error.message.includes("인증") ||
              error.message.includes("403") ||
              error.message.includes("401"))
          ) {
            alert("로그인이 필요합니다. 로그인 페이지로 이동합니다.");
            router.push("/login");
          } else {
            alert("세션 생성에 실패했습니다. 다시 시도해주세요.");
          }
          return;
        } finally {
          sessionStorage.removeItem("sessionCreating");
          isInitializing = false;
        }
      } else {
        // 세션이 있지만 gameStartTime이 없으면 설정 (혹시 모를 경우 대비)
        const existingStartTime = localStorage.getItem("gameStartTime");
        if (!existingStartTime) {
          const currentTime = new Date().toISOString();
          localStorage.setItem("gameStartTime", currentTime);
          console.log("⏱️ 게임 시작 시간 설정:", currentTime);
        }
      }

      // 세션 인벤토리 불러오기
      try {
        const items = await getSessionInventory(sessionId);

        // 백엔드 아이템을 프론트엔드 형식으로 변환 (백엔드 description 사용)
        const frontendItems: Item[] = items
          .map((item) => {
            const frontendId = ITEM_ID_REVERSE_MAP[item.itemId];
            const itemData = ITEMS.find((i) => i.id === frontendId);
            if (!itemData) return null;

            // description에서 undefined 완전 제거
            let cleanDescription = itemData.description;
            if (item.description && item.description !== "undefined") {
              cleanDescription = String(item.description)
                .replace(/undefined/gi, "")
                .trim();
              if (!cleanDescription) {
                cleanDescription = itemData.description;
              }
            }

            return {
              ...itemData,
              description: cleanDescription,
            };
          })
          .filter((item): item is Item => item !== null);

        setInventory(frontendItems);
        setCollectedItems(frontendItems.map((item) => item.id));

        // localStorage에도 저장 (다른 페이지와 동기화)
        localStorage.setItem("collectedItems", JSON.stringify(frontendItems));
      } catch (error) {
        console.error("인벤토리 로드 실패:", error);
      }
    };

    initializeGame();

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 아이템 획득
  const handleItemClick = async (item: Item) => {
    // 중복 클릭 방지: 이미 획득했거나 현재 획득 중이면 무시
    if (collectedItems.includes(item.id) || isAcquiring) return;

    const sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
      alert("세션 ID가 없습니다. 로그인이 필요합니다.");
      return;
    }

    setIsAcquiring(true); // 획득 중 상태 시작

    try {
      // 백엔드 API 호출
      const backendItemId = ITEM_ID_MAP[item.id];
      const acquiredItem = await acquireItem(sessionId, backendItemId);

      // 성공 시 상태 업데이트 (백엔드에서 받은 description 사용)
      let cleanDescription = item.description;
      if (
        acquiredItem.description &&
        acquiredItem.description !== "undefined"
      ) {
        cleanDescription = String(acquiredItem.description)
          .replace(/undefined/gi, "")
          .trim();
        if (!cleanDescription) {
          cleanDescription = item.description;
        }
      }

      const itemWithDescription = {
        ...item,
        description: cleanDescription,
      };
      const newInventory = [...inventory, itemWithDescription];
      const newCollectedItems = [...collectedItems, item.id];

      setCollectedItems(newCollectedItems);
      setInventory(newInventory);
      setCurrentItem(itemWithDescription);
      setShowItemModal(true);

      // localStorage에도 저장 (다른 페이지와 동기화)
      localStorage.setItem("collectedItems", JSON.stringify(newInventory));
    } catch (error) {
      console.error("아이템 획득 실패:", error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("아이템 획득에 실패했습니다.");
      }
    } finally {
      setIsAcquiring(false); // 획득 완료 후 상태 해제
    }
  };

  // 아이템 획득 모달 닫기
  const closeItemModal = () => {
    setShowItemModal(false);
    setCurrentItem(null);
  };

  // 인벤토리에서 아이템 상세 보기
  const handleItemDetail = (item: Item) => {
    setCurrentItem(item);
    setShowItemDetailModal(true);
  };

  // 황금 콘 클릭
  const handleGoldenConeClick = () => {
    setShowLionModal(true);
  };

  // 라이언 모달 확인
  const handleLionConfirm = () => {
    setShowLionModal(false);
    setShowStartButton(true);
  };

  // 취조 시작
  const handleStartInvestigation = () => {
    console.log("캐릭터 선택 페이지로 이동");
    router.push("/characterselect");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="relative w-[430px] h-[844px] overflow-hidden">
        {/* 배경 이미지 */}
        <Image
          src={backgroundImage}
          alt="게임 배경"
          fill
          className="object-cover"
          priority
        />

        {/* 인벤토리 버튼 (우측 상단) */}
        <button
          onClick={() => setShowInventory(!showInventory)}
          className="absolute top-2 right-1 z-20 w-14 h-14 transition-transform hover:scale-110"
        >
          <Image
            src="/icon/bag_icon.svg"
            alt="인벤토리"
            width={40}
            height={40}
          />
        </button>

        {/* 동상 조사 돋보기 버튼 */}
        <button
          onClick={handleGoldenConeClick}
          className="absolute top-[200px] left-1/2 -translate-x-1/2 z-20 transition-transform hover:scale-110"
        >
          <Image
            src="/icon/reading_glasses_icon.svg"
            alt="조사하기"
            width={40}
            height={40}
          />
        </button>

        {/* 하단 아이템들 - 흩어진 배치 */}
        <div className="absolute bottom-0 left-0 right-0 w-full h-[200px] z-10">
          {/* 갈색 털뭉치 - 왼쪽 하단 */}
          <button
            onClick={() => handleItemClick(ITEMS[0])}
            className={`absolute bottom-30 left-8 transition-all duration-300 hover:scale-110 ${
              collectedItems.includes(ITEMS[0].id)
                ? "opacity-0 scale-0"
                : "opacity-100 scale-150"
            }`}
            style={{
              animation: collectedItems.includes(ITEMS[0].id)
                ? "collectItem 0.5s ease-out"
                : "none",
            }}
          >
            <Image
              src={ITEMS[0].icon}
              alt={ITEMS[0].name}
              width={70}
              height={70}
            />
          </button>

          {/* 보안카드 - 중앙 왼쪽 하단 */}
          <button
            onClick={() => handleItemClick(ITEMS[1])}
            className={`absolute bottom-10 left-[30%] transition-all duration-300 hover:scale-110 ${
              collectedItems.includes(ITEMS[1].id)
                ? "opacity-0 scale-0"
                : "opacity-100 scale-150"
            }`}
            style={{
              animation: collectedItems.includes(ITEMS[1].id)
                ? "collectItem 0.5s ease-out"
                : "none",
            }}
          >
            <Image
              src={ITEMS[1].icon}
              alt={ITEMS[1].name}
              width={90}
              height={90}
            />
          </button>

          {/* 초콜릿 봉지 - 오른쪽 하단 */}
          <button
            onClick={() => handleItemClick(ITEMS[2])}
            className={`absolute bottom-20 right-8 transition-all duration-300 hover:scale-110 ${
              collectedItems.includes(ITEMS[2].id)
                ? "opacity-0 scale-0"
                : "opacity-100 scale-150"
            }`}
            style={{
              animation: collectedItems.includes(ITEMS[2].id)
                ? "collectItem 0.5s ease-out"
                : "none",
            }}
          >
            <Image
              src={ITEMS[2].icon}
              alt={ITEMS[2].name}
              width={80}
              height={80}
            />
          </button>
        </div>

        {/* 취조 시작하기 버튼 */}
        {showStartButton && (
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-30 animate-fadeIn">
            <button
              onClick={handleStartInvestigation}
              className="px-8 py-3 bg-[#4D4D4D] hover:text-[#D4AF37] text-white font-bold text-xl rounded-lg transition-colors shadow-lg"
            >
              취조 시작하기
            </button>
          </div>
        )}

        {/* 인벤토리 패널 */}
        {showInventory && (
          <div className="absolute top-16 right-6 z-40 animate-fadeIn">
            <div className="relative w-[150px] h-[240px] rounded-2xl overflow-hidden border-5 border-[#463017] shadow-2xl">
              {/* 배경 */}
              <Image
                src={inventoryBg}
                alt="인벤토리 배경"
                fill
                className="object-cover"
                priority
              />

              {/* 내용(4칸) */}
              <div className="absolute inset-0 flex flex-col">
                {ITEMS.map((item, idx) => {
                  const inventoryItem = inventory.find((i) => i.id === item.id);

                  return (
                    <div
                      key={item.id}
                      className={[
                        "flex-1 flex items-center justify-between px-2",
                        idx !== ITEMS.length - 1
                          ? "border-b-4 border-[#2b1b0f]/80"
                          : "",
                      ].join(" ")}
                      style={{ background: "rgba(0,0,0,0.10)" }}
                    >
                      {/* 아이템 아이콘 */}
                      <div className="w-12 h-12 flex items-center justify-center">
                        {inventoryItem && (
                          <Image
                            src={inventoryItem.miniIcon}
                            alt={inventoryItem.name}
                            width={60}
                            height={60}
                          />
                        )}
                      </div>

                      {/* 돋보기 버튼 */}
                      <button
                        onClick={() =>
                          inventoryItem && handleItemDetail(inventoryItem)
                        }
                        disabled={!inventoryItem}
                        className={[
                          "w-8 h-8 flex items-center justify-center transition-transform",
                          inventoryItem
                            ? "hover:scale-110"
                            : "opacity-20 cursor-default",
                        ].join(" ")}
                      >
                        <Image
                          src="/icon/small_reading_glasses_icon.svg"
                          alt="상세보기"
                          width={30}
                          height={30}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 아이템 획득 모달 */}
        {showItemModal && currentItem && (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/60 animate-fadeIn">
            <div className="bg-black/90 border-4 border-[#D4AF37] rounded-3xl p-8 w-80">
              <div className="flex flex-col items-center">
                <div className="text-[#D4AF37] text-2xl font-bold mb-4">
                  단서 획득!
                </div>
                <Image
                  src={currentItem.icon}
                  alt={currentItem.name}
                  width={120}
                  height={120}
                  className="mb-4"
                />
                <div className="text-white text-xl font-semibold mb-6">
                  {currentItem.name}
                </div>
                <button
                  onClick={closeItemModal}
                  className="px-8 py-2 bg-[#4A4A4A] hover:bg-[#5A5A5A] text-[#D4AF37] font-semibold rounded-lg transition-colors"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 아이템 상세 모달 - 하단에 표시 */}
        {showItemDetailModal && currentItem && (
          <div className="absolute inset-0 z-50 animate-fadeIn">
            <div className="absolute bottom-80 left-1/2 -translate-x-1/2 w-[380px] bg-black/95 border-4 border-[#D4AF37] rounded-2xl p-6">
              <div className="flex flex-col items-center">
                <div className="text-[#D4AF37] text-lg font-bold mb-4 text-center leading-relaxed whitespace-pre-line">
                  {currentItem.description}
                </div>
                <button
                  onClick={() => setShowItemDetailModal(false)}
                  className="px-8 py-2 bg-[#4A4A4A] hover:bg-[#5A5A5A] text-[#D4AF37] font-semibold rounded-lg transition-colors"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 게임 진행 방법 튜토리얼 모달 */}
        {showTutorialModal && (
          <div
            className={`absolute inset-0 flex items-center justify-center z-50 transition-opacity duration-1000 animate-fadeIn ${
              showTutorialModal
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            }`}
          >
            {/* 배경 오버레이 */}
            <div className="absolute inset-0 bg-black/60" />

            {/* 모달 컨텐츠 */}
            <div className="relative w-[380px] max-h-[700px] bg-black/90 border-4 border-[#D4AF37] rounded-3xl p-8 overflow-y-auto">
              {/* 제목 */}
              <h2 className="text-2xl font-bold text-white text-center mb-6">
                게임 진행 방법
              </h2>

              {/* 설명 텍스트 */}
              <div className="space-y-6">
                <p className="text-white text-m leading-relaxed text-center">
                  황금 콘 도난 사건의 범인을 찾아라!
                  <br />
                  사건 현장에 남아있는 아이템들을 활용해 캐릭터들과 대화하여
                  범인을 찾아내세요.
                </p>

                {/* 인벤토리 섹션 */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                    <Image
                      src="/icon/bag_icon.svg"
                      alt="bag icon"
                      width={40}
                      height={40}
                    />
                  </div>
                  <p className="text-white text-m leading-relaxed flex-1">
                    오른쪽 상단의 인벤토리에
                    <br />
                    아이템이 저장됩니다.
                  </p>
                </div>

                {/* 메모 섹션 */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                    <Image
                      src="/icon/memo_icon.svg"
                      alt="memo icon"
                      width={48}
                      height={48}
                    />
                  </div>
                  <p className="text-white text-m leading-relaxed flex-1">
                    캐릭터와의 대화 내용 중 단서가 될 만한 내용들은 메모로
                    남겨보세요.
                  </p>
                </div>

                {/* 게이지 설명 */}
                <p className="text-white text-m leading-relaxed text-center">
                  대화 내용에 따라 캐릭터들의 호감도,<br></br> 의심도 게이지가
                  변합니다. 게이지에 맞춰서 변화하는 캐릭터의 표정도 단서로
                  활용하세요!
                </p>

                <div className="space-y-3">
                  {/* 호감도 게이지 (고정값 60%) */}
                  <div className="flex items-center gap-3">
                    {/* 1. 텍스트 */}
                    <span className="text-white text-m w-16">호감도 :</span>

                    {/* 2. 아이콘 (게이지 바 밖으로 꺼내서 왼쪽 배치) */}
                    <div className="w-[32px] flex justify-center flex-shrink-0">
                      <Image
                        src="/icon/heart_icon.svg"
                        alt="heart"
                        width={32}
                        height={32}
                      />
                    </div>

                    {/* 3. 게이지 바 (캡처본의 고정값 w-[60%] 유지) */}
                    <div className="relative flex-1 h-7 bg-gray-600 rounded-full overflow-hidden">
                      <div className="absolute left-0 top-0 h-full w-[60%] bg-gradient-to-r from-pink-400 to-pink-500 rounded-full" />
                    </div>
                  </div>

                  {/* 의심도 게이지 (고정값 50%) */}
                  <div className="flex items-center gap-3">
                    {/* 1. 텍스트 */}
                    <span className="text-white text-m w-16">의심도 :</span>

                    {/* 2. 아이콘 (게이지 바 밖으로 꺼내서 왼쪽 배치) */}
                    <div className="w-[32px] flex justify-center flex-shrink-0">
                      <Image
                        src="/icon/humidity_fill.svg"
                        alt="humidity"
                        width={32}
                        height={32}
                        className="scale-130"
                      />
                    </div>

                    {/* 3. 게이지 바 (캡처본의 고정값 w-[50%] 유지) */}
                    <div className="relative flex-1 h-7 bg-gray-600 rounded-full overflow-hidden">
                      <div className="absolute left-0 top-0 h-full w-[50%] bg-gradient-to-r from-blue-400 to-blue-500 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 확인 버튼 */}
              <button
                onClick={() => setShowTutorialModal(false)}
                className="mt-8 w-32 mx-auto block px-6 py-2 bg-[#4A4A4A] hover:bg-[#5A5A5A] text-m text-[#D4AF37] font-semibold rounded-lg transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        )}

        {/* 라이언 모달 */}
        {showLionModal && (
          <div className="absolute inset-0 z-50 bg-black/60 animate-fadeIn">
            {/* 하단 검은 모달 */}
            <div className="absolute bottom-0 left-0 right-0 h-[300px] bg-gradient-to-b from-[#000000] via-[#282828] to-[#000000] px-6 pt-7 pb-6">
              {/* 상단 제목 + 닫기 */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-white font-bold text-lg">
                  보안 직원 라이언
                </div>
                <button onClick={handleLionConfirm}>
                  <img
                    src="/icon/cancel_icon.svg"
                    alt="닫기"
                    className="w-6 h-6"
                  />
                </button>
              </div>

              {/* 대사 */}
              <p className="text-[#D4AF37] text-sm leading-relaxed text-center whitespace-pre-line mb-6">
                안녕하세요 !!
                {"\n"}
                카카오 회사의 보안직원 라이언입니다.
                {"\n"}
                어제 밤 11시에 카카오 닷투투 건물의
                {"\n"}
                “황금 콘 동상”이 사라졌습니다.
                {"\n"}
                서둘러 범인을 찾아야 합니다.
                {"\n"}
                범인을 찾을 수 있게 도와주세요 !!
              </p>

              {/* 확인 버튼 */}
              <button
                onClick={handleLionConfirm}
                className="mx-auto block px-10 py-2 bg-[#4A4A4A] hover:bg-[#5A5A5A] text-[#D4AF37] font-semibold rounded-lg transition-colors"
              >
                확인
              </button>
            </div>

            {/* 라이언 캐릭터 (모달에 딱 걸치게) */}
            <div className="absolute bottom-[300px] left-1/2 -translate-x-1/2 z-50 pointer-events-none">
              <img
                src="/character/라이언_당황_흉상.svg"
                alt="라이언"
                className="w-[280px] h-auto"
              />
            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes collectItem {
            0% {
              transform: scale(1) translateY(0);
              opacity: 1;
            }
            50% {
              transform: scale(1.2) translateY(-20px);
              opacity: 0.8;
            }
            100% {
              transform: scale(0) translateY(-50px);
              opacity: 0;
            }
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          .animate-fadeIn {
            animation: fadeIn 1s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
}
