"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import backgroundImage from "@/assets/images/취조 페이지 배경.png";
import characterDialogBg from "@/assets/images/캐릭터 대사 배경.png";
import userChatBg from "@/assets/images/사용자 채팅칸 배경.png";
import userMemoBg from "@/assets/images/사용자 메모.png";
import inventoryBg from "@/assets/images/인벤토리 배경.png";
import {
  getSessionInventory,
  ITEM_ID_REVERSE_MAP,
} from "@/lib/api/inventory";

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
    description: "현장 바닥에서 발견된\n갈색 털뭉치",
    icon: "/character/아이템_갈색털뭉치.svg",
    miniIcon: "/character/아이템_갈색털뭉치_미니.svg",
  },
  {
    id: "card",
    name: "보안카드",
    description: "사무실에 떨어져 있던\n직원가의 출입 보안카드",
    icon: "/character/아이템_보안카드.svg",
    miniIcon: "/character/아이템_보안카드_미니.svg",
  },
  {
    id: "chocolate",
    name: "초콜릿 봉지",
    description: "발품 뜯려 있는\n초콜릿 봉지",
    icon: "/character/아이템_초콜릿봉지.svg",
    miniIcon: "/character/아이템_초콜릿봉지_미니.svg",
  },
  {
    id: "coffee",
    name: "커피 자국",
    description: "누군가 흘렸게 쓴은 듯한\n커피 자국",
    icon: "/character/아이템_커피자국.svg",
    miniIcon: "/character/아이템_커피자국_미니.svg",
  },
  // 커피자국은 서버 API 연동 시 어피치 호감도 조건 충족으로 자동 지급
];

const CHARACTER_BUSTS: Record<string, string> = {
  라이언: "/character/라이언_기본_흉상.svg",
  무지: "/character/무지_기본_흉상.svg",
  어피치: "/character/어피치_기본_흉상.svg",
  프로도: "/character/프로도_기본_흉상.svg",
};

export default function InterrogationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 엔딩 모달 표시 여부 상태
  const [showEndingModal, setShowEndingModal] = useState(false);

  const [showMemoModal, setShowMemoModal] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [memoText, setMemoText] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState("라이언");

  // 인벤토리 관련 상태 - localStorage에서 획득한 아이템만 불러오기
  const [inventory, setInventory] = useState<Item[]>([]);
  const [showInventory, setShowInventory] = useState(false);
  const [showItemDetailModal, setShowItemDetailModal] = useState(false);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);

  useEffect(() => {
    const character = searchParams.get("character");
    if (character && CHARACTER_BUSTS[character]) {
      setSelectedCharacter(character);
    }

    // 세션 인벤토리 불러오기
    const loadInventory = async () => {
      const sessionId = localStorage.getItem("sessionId");
      if (!sessionId) {
        console.log("세션 ID가 없습니다. localStorage에서 불러옵니다.");
        // 세션 ID가 없으면 localStorage에서 불러오기 (폴백)
        const savedItems = localStorage.getItem("collectedItems");
        if (savedItems) {
          setInventory(JSON.parse(savedItems));
        }
        return;
      }

      try {
        const items = await getSessionInventory(sessionId);
        
        // 백엔드 아이템을 프론트엔드 형식으로 변환
        const frontendItems: Item[] = items
          .map((item) => {
            const frontendId = ITEM_ID_REVERSE_MAP[item.itemId];
            const itemData = ITEMS.find((i) => i.id === frontendId);
            return itemData ? { ...itemData } : null;
          })
          .filter((item): item is Item => item !== null);

        setInventory(frontendItems);

        // localStorage에도 저장 (동기화)
        localStorage.setItem("collectedItems", JSON.stringify(frontendItems));
      } catch (error) {
        console.error("인벤토리 로드 실패:", error);
        // 에러 시 localStorage에서 불러오기 (폴백)
        const savedItems = localStorage.getItem("collectedItems");
        if (savedItems) {
          setInventory(JSON.parse(savedItems));
        }
      }
    };

    loadInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    router.push("/characterselect");
  };

  const handleSendMessage = () => {
    if (!userInput.trim()) return;
    console.log("전송:", userInput);

    // 테스트용 코드: "너 범인이지?" 입력 시 모달 출력
    if (userInput == "너 범인이지?") {
      setShowEndingModal(true);
      setUserInput("");
    }
  }; // <--- 여기가 닫혀야 화면이 나옵니다.

  // [추가됨] 엔딩 모달에서 NEXT 버튼 클릭 시 실행
  const handleEndingNext = () => {
    // 성공 결과 페이지로 이동 (쿼리 파라미터는 필요에 따라 조정)
    router.push("/ending_arrest");
  };

  const handleSaveMemo = () => {
    console.log("메모 저장:", memoText);
    setShowMemoModal(false);
  };

  const handleCloseMemo = () => {
    setShowMemoModal(false);
    setMemoText(""); // 닫으면 내용 버리기
  };

  const handleItemDetail = (item: Item) => {
    setCurrentItem(item);
    setShowItemDetailModal(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="relative w-[430px] h-[844px] overflow-hidden">
        {/* 배경 */}
        <Image
          src={backgroundImage}
          alt="취조 배경"
          fill
          className="object-cover"
          priority
        />

        {/* 개발 테스트용 버튼 (화면 왼쪽 상단 구석에 배치) */}
        {/* 나중에 실제 게임 로직이 완성되면 삭제 */}
        <button
          onClick={() => setShowEndingModal(true)}
          className="absolute top-16 left-4 z-50 bg-red-500/50 text-white text-xs px-2 py-1 rounded hover:bg-red-500"
        >
          (TEST) 자백 성공
        </button>

        {/* 상단 아이콘: 왼쪽(나가기) + 오른쪽(메모/인벤) */}
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 pt-4">
          <button
            onClick={handleLogout}
            className="w-12 h-12 transition-transform hover:scale-110 active:scale-95"
          >
            <Image
              src="/icon/sign_out_icon.svg"
              alt="뒤로가기"
              width={40}
              height={40}
            />
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowMemoModal(true)}
              className="w-12 h-12 transition-transform hover:scale-110 active:scale-95"
            >
              <Image
                src="/icon/memo_icon.svg"
                alt="메모"
                width={40}
                height={40}
              />
            </button>

            <button
              onClick={() => setShowInventory((v) => !v)}
              className="w-12 h-12 transition-transform hover:scale-110 active:scale-95"
            >
              <Image
                src="/icon/bag_icon.svg"
                alt="인벤토리"
                width={40}
                height={40}
              />
            </button>
          </div>
        </div>

        {/* =========================
          완전 분리(absolute) 레이아웃
           ========================= */}

        {/* 게이지 */}
        <div className="absolute left-1/2 top-[220px] -translate-x-1/2 z-40 w-[230px] space-y-3">
          <div className="relative h-[16px] rounded-full bg-gray-300/70 overflow-visible">
            <div className="absolute left-0 top-0 h-full w-[60%] rounded-full bg-gradient-to-r from-pink-400 to-pink-500" />
            <div className="absolute left-[60%] top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Image
                src="/icon/heart_icon.svg"
                alt="호감도"
                width={30}
                height={30}
              />
            </div>
          </div>

          <div className="relative h-[16px] rounded-full bg-gray-300/70 overflow-visible">
            <div className="absolute left-0 top-0 h-full w-[50%] rounded-full bg-gradient-to-r from-blue-400 to-blue-500" />
            <div className="absolute left-[50%] top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Image
                src="/icon/cloud_icon.svg"
                alt="의심도"
                width={30}
                height={30}
              />
            </div>
          </div>
        </div>

        {/* 캐릭터 */}
        <div className="absolute left-1/2 top-[290px] -translate-x-1/2 z-50 pointer-events-none w-[250px] h-[250px] flex items-center justify-center">
          <div className="relative w-full h-full">
            <Image
              src={CHARACTER_BUSTS[selectedCharacter]}
              alt={selectedCharacter}
              fill
              priority
              className="select-none object-contain"
            />
          </div>
        </div>

        {/* 캐릭터 말 박스 */}
        <div className="absolute left-1/2 top-[540px] -translate-x-1/2 z-30 w-[400px] h-[170px] rounded-2xl overflow-hidden border-[4px] border-[#864313] shadow-[0_12px_30px_rgba(0,0,0,0.55)]">
          <Image
            src={characterDialogBg}
            alt="대사 배경"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 flex items-center justify-center px-8 py-6">
            <p className="text-white text-center text-base leading-relaxed">
              캐릭터 말
            </p>
          </div>
        </div>

        {/* 사용자 입력창 */}
        <div className="absolute left-1/2 bottom-6 -translate-x-1/2 z-40 w-[400px] h-[92px]">
          <div className="relative w-full h-full border-[4px] border-[#864313] rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.6)] overflow-hidden">
            <Image
              src={userChatBg}
              alt="입력창 배경"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 flex items-center px-8">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="질문을 입력하세요..."
                className="flex-1 bg-transparent text-white text-lg outline-none placeholder-white/60"
              />
              <button
                onClick={handleSendMessage}
                className="ml-3 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
              >
                <Image
                  src="/icon/reading_glasses_icon.svg"
                  alt="전송"
                  width={25}
                  height={25}
                />
              </button>
            </div>
          </div>
        </div>

        {/* =========================
          오버레이들
           ========================= */}

        {/* 엔딩 안내 모달 (디자인 시안 반영) */}
        {showEndingModal && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/80 animate-fadeIn">
            {/* 모달 컨테이너 */}
            <div className="relative w-[360px] bg-[#1a1a1a] border-2 border-[#D4AF37] rounded-lg p-8 flex flex-col items-center shadow-[0_0_20px_rgba(212,175,55,0.3)] text-center">
              {/* 텍스트 내용 */}
              <div className="space-y-4 mb-8">
                <p className="text-[#ffffff] text-lg leading-relaxed whitespace-pre-line font-bold">
                  사건의 범인은{" "}
                  <span className="text-[#D4AF37]">{selectedCharacter}</span>
                  (으)로 밝혀졌다.
                  <br />
                  <br />
                  {selectedCharacter}는 자신의 잘못을 뉘우치고 동상을 원래대로
                  돌려놓았다.
                  <br />
                  <br />
                  {selectedCharacter}의 반성하는 태도와 자백으로 선처해 주기로
                  하였다.
                  <br />
                  <br />
                  &quot;황금 콘 도난 사건&quot;은 이렇게 일단락되었고... 카카오
                  회사의 평화가 찾아왔다...
                </p>
              </div>

              {/* NEXT 버튼 */}
              <button
                onClick={handleEndingNext}
                className="px-10 py-2 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors font-bold rounded shadow-[0_0_10px_rgba(212,175,55,0.2)]"
              >
                확인
              </button>
            </div>
          </div>
        )}

        {/* 인벤토리 패널 (1번만) */}
        {showInventory && (
          <div className="absolute top-[86px] right-4 z-50 animate-fadeIn">
            <div className="relative w-[150px] h-[240px] rounded-2xl overflow-hidden border-[5px] border-[#463017] shadow-2xl">
              <Image
                src={inventoryBg}
                alt="인벤토리 배경"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 flex flex-col">
                {ITEMS.map((item, idx) => {
                  const inventoryItem = inventory.find((i) => i.id === item.id);

                  return (
                    <div
                      key={item.id}
                      className={[
                        "flex-1 flex items-center justify-between px-2",
                        idx !== ITEMS.length - 1
                          ? "border-b-[4px] border-[#2b1b0f]/80"
                          : "",
                      ].join(" ")}
                      style={{ background: "rgba(0,0,0,0.10)" }}
                    >
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

                      <button
                        onClick={() =>
                          inventoryItem && handleItemDetail(inventoryItem)
                        }
                        disabled={!inventoryItem}
                        className={[
                          "w-8 h-8 flex items-center justify-center transition-transform",
                          inventoryItem
                            ? "hover:scale-110 cursor-pointer"
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

        {/* 아이템 상세 모달 */}
        {showItemDetailModal && currentItem && (
          <div className="absolute inset-0 z-[999] flex items-center justify-center bg-black/60 animate-fadeIn">
            <div className="bg-black/90 border-4 border-[#D4AF37] rounded-3xl p-8 w-[380px] shadow-2xl">
              <div className="flex flex-col items-center">
                <div className="text-[#D4AF37] text-lg font-bold mb-6 text-center leading-relaxed whitespace-pre-line">
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

        {/* 메모 모달 */}
        {showMemoModal && (
          <div className="absolute inset-0 z-[999] bg-black/60 animate-fadeIn">
            <div className="absolute top-[110px] left-1/2 -translate-x-1/2 w-[360px] h-[330px] relative">
              <Image
                src={userMemoBg}
                alt="메모지"
                fill
                priority
                className="object-contain pointer-events-none"
              />

              {/* X 닫기 버튼: 무조건 최상단 + 클릭 가능 */}
              <button
                type="button"
                onClick={handleCloseMemo}
                className="absolute top-11 right-2 z-50 w-8 h-9 flex items-center justify-center pointer-events-auto hover:scale-110 active:scale-95 transition-transform"
              >
                <Image
                  src="/icon/cancel_icon.svg"
                  alt="닫기"
                  width={25}
                  height={25}
                  className="pointer-events-none"
                />
              </button>

              {/* 내용 */}
              <div className="absolute inset-0 px-10 pt-20 pb-10 flex flex-col z-40">
                <h3 className="text-2xl text-gray-800 text-center mb-4">
                  사용자 메모
                </h3>

                <textarea
                  value={memoText}
                  onChange={(e) => setMemoText(e.target.value)}
                  placeholder="메모를 입력하세요..."
                  className="flex-1 bg-transparent text-gray-800 text-base resize-none outline-none placeholder-gray-500 p-2"
                />

                <button
                  onClick={handleSaveMemo}
                  className="mt-4 mx-auto px-10 py-2 bg-[#D4AF37] hover:bg-[#E2BF25] text-black font-semibold rounded-lg transition-colors"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.25s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
}
