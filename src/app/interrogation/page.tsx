"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

import backgroundImage from "@/assets/images/취조 페이지 배경.png";
import characterDialogBg from "@/assets/images/캐릭터 대사 배경.png";
import userChatBg from "@/assets/images/사용자 채팅칸 배경.png";
import userMemoBg from "@/assets/images/사용자 메모.png";
import inventoryBg from "@/assets/images/인벤토리 배경.png";
import { getSessionInventory, ITEM_ID_REVERSE_MAP } from "@/lib/api/inventory";

type Item = {
  id: string;
  name: string;
  description: string;
  icon: string;
  miniIcon: string;
};

type NpcStatus = {
  suspicionScore: number;
  affectionScore: number;
  isConfessed: boolean;
};

const ITEMS: Item[] = [
  {
    id: "fur",
    name: "갈색 털뭉치",
    description: "누군가가 떨어뜨린\n갈색 털뭉치이다.",
    icon: "/character/아이템_갈색털뭉치.svg",
    miniIcon: "/character/아이템_갈색털뭉치_미니.svg",
  },
  {
    id: "card",
    name: "보안카드",
    description: "누군가가 떨어뜨린\n보안카드이다.",
    icon: "/character/아이템_보안카드.svg",
    miniIcon: "/character/아이템_보안카드_미니.svg",
  },
  {
    id: "chocolate",
    name: "초콜릿 봉지",
    description: "누군가가 떨어뜨린\n초콜릿 봉지이다.",
    icon: "/character/아이템_초콜릿봉지.svg",
    miniIcon: "/character/아이템_초콜릿봉지_미니.svg",
  },
  {
    id: "coffee",
    name: "커피 자국",
    description: "누군가가 흘린\n커피 자국이다.",
    icon: "/character/아이템_커피자국.svg",
    miniIcon: "/character/아이템_커피자국_미니.svg",
  },
];

const CHARACTER_BUSTS: Record<string, string> = {
  RYAN: "/character/라이언_기본_흉상.svg",
  MUZI: "/character/무지_기본_흉상.svg",
  APEACH: "/character/어피치_기본_흉상.svg",
  FRODO: "/character/프로도_기본_흉상.svg",
};

// [추가] URL로 한글이 들어올 경우를 대비한 역방향 매핑
const REVERSE_NAME_MAP: Record<string, string> = {
  라이언: "RYAN",
  무지: "MUZI",
  어피치: "APEACH",
  프로도: "FRODO",
};

const CHARACTER_NAMES_KO: Record<string, string> = {
  RYAN: "라이언",
  MUZI: "무지",
  APEACH: "어피치",
  FRODO: "프로도",
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function InterrogationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // [로딩 상태 추가 권장]
  const [isSending, setIsSending] = useState(false);
  const [remainingQuestions, setRemainingQuestions] = useState(20);

  // 1. NPC 상태
  const [npcStatus, setNpcStatus] = useState<NpcStatus>({
    suspicionScore: 0,
    affectionScore: 0,
    isConfessed: false,
  });

  // 3. NPC 답변
  const [npcReply, setNpcReply] = useState("");

  // ------------------------------------------------

  const [showEndingModal, setShowEndingModal] = useState(false);
  const [showMemoModal, setShowMemoModal] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [memoText, setMemoText] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState("RYAN");

  const [inventory, setInventory] = useState<Item[]>([]);
  const [showInventory, setShowInventory] = useState(false);
  const [showItemDetailModal, setShowItemDetailModal] = useState(false);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);

  useEffect(() => {
    const paramCharacter = searchParams.get("character"); // URL 값 가져오기 (예: "무지" or "MUZI")
    if (paramCharacter) {
      // Case 1: URL이 영어 ID로 온 경우 (정석)
      if (CHARACTER_BUSTS[paramCharacter]) {
        setSelectedCharacter(paramCharacter);
      }
      // Case 2: URL이 한글 이름으로 온 경우 (변환 필요)
      else if (REVERSE_NAME_MAP[paramCharacter]) {
        setSelectedCharacter(REVERSE_NAME_MAP[paramCharacter]); // "MUZI"로 변환해서 저장
      }
      setNpcReply("");
      setNpcStatus({
        suspicionScore: 0,
        affectionScore: 0,
        isConfessed: false,
      });
      setUserInput("");
    }

    const loadInventory = async () => {
      const sessionId = localStorage.getItem("sessionId");
      if (!sessionId) {
        console.log("세션 ID가 없습니다. localStorage에서 불러옵니다.");
        const savedItems = localStorage.getItem("collectedItems");
        if (savedItems) {
          setInventory(JSON.parse(savedItems));
        }
        return;
      }

      try {
        const items = await getSessionInventory(sessionId);
        const frontendItems: Item[] = items
          .map((item) => {
            const frontendId = ITEM_ID_REVERSE_MAP[item.itemId];
            const itemData = ITEMS.find((i) => i.id === frontendId);
            return itemData ? { ...itemData } : null;
          })
          .filter((item): item is Item => item !== null);

        setInventory(frontendItems);
        localStorage.setItem("collectedItems", JSON.stringify(frontendItems));
      } catch (error) {
        console.error("인벤토리 로드 실패:", error);
        const savedItems = localStorage.getItem("collectedItems");
        if (savedItems) {
          setInventory(JSON.parse(savedItems));
        }
      }
    };

    loadInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleLogout = () => {
    router.push("/characterselect");
  };

  // --- AI 서버 통신 로직 구현 ---
  const handleSendMessage = async () => {
    if (!userInput.trim() || isSending) return;

    const messageContent = userInput;
    const targetName = selectedCharacter;
    const sessionId = localStorage.getItem("sessionId");
    const accessToken = localStorage.getItem("accessToken");

    setUserInput("");
    setIsSending(true);

    try {
      const requestBody = {
        message: messageContent,
      };

      const apiUrl = `${BASE_URL}/sessions/${sessionId}/npcs/${targetName}/chat`;

      const response = await axios.post(apiUrl, requestBody, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const resData = response.data;
      console.log("백엔드 응답:", resData); // 디버깅용 로그

      if (resData.reply) {
        setNpcReply(resData.reply);
      }

      // [추가] 남은 질문 횟수 업데이트
      if (typeof resData.remainingQuestions === "number") {
        setRemainingQuestions(resData.remainingQuestions);

        // 0회가 되면 검거 실패
        if (resData.remainingQuestions <= 0) {
          // (선택사항) 사용자가 상황을 인지할 수 있게 짧은 지연을 주거나 알림을 줄 수도 있습니다.
          alert("질문 기회를 모두 소진했습니다. 검거에 실패했습니다.");
          router.push("/ending_fail");
          return; // 이후 로직 실행 방지
        }
      }

      // [변경 2] 게이지 업데이트 -> 백엔드 DTO 구조인 'state' 사용
      if (resData.state) {
        setNpcStatus({
          suspicionScore: resData.state.suspicionScore,
          affectionScore: resData.state.affectionScore,
          isConfessed: resData.state.isConfessed,
        });

        if (resData.state.isConfessed) {
          setShowEndingModal(true);
        }
      }

      if (resData.rewards && resData.rewards.length > 0) {
        const newItems: Item[] = [];

        resData.rewards.forEach((reward: { itemId: string }) => {
          // 3-1. 백엔드 ID (예: "ITEM_02") -> 프론트 ID (예: "coffee") 변환
          // (상단에 import된 ITEM_ID_REVERSE_MAP 사용)
          const frontendId = ITEM_ID_REVERSE_MAP[reward.itemId];

          // 3-2. 전체 아이템 목록(ITEMS)에서 해당 아이템 정보(이미지, 설명 등) 찾기
          const itemData = ITEMS.find((i) => i.id === frontendId);

          // 3-3. 중복 확인: 이미 인벤토리에 있는 아이템이면 제외
          const isDuplicate = inventory.some((inv) => inv.id === frontendId);

          if (itemData && !isDuplicate) {
            newItems.push(itemData);
          }
        });

        // 3-4. 새로 얻은 아이템이 있다면 반영
        if (newItems.length > 0) {
          // (1) 알림창 띄우기
          const itemNames = newItems.map((i) => i.name).join(", ");
          alert(`✨ 단서 획득! [${itemNames}]을(를) 찾았습니다!`);

          // (2) 화면(State) 및 로컬스토리지 업데이트
          setInventory((prev) => {
            const updatedInventory = [...prev, ...newItems];

            // 새로고침 해도 유지되도록 저장
            localStorage.setItem(
              "collectedItems",
              JSON.stringify(updatedInventory),
            );

            return updatedInventory;
          });
        }
      }
    } catch (error) {
      console.error("API 요청 실패:", error);
      setNpcReply("...(서버와의 연결이 불안정합니다)...");
    } finally {
      setIsSending(false);
    }
  };
  // -------------------------------------------------------

  const handleEndingNext = () => {
    router.push("/ending_arrest");
  };

  const handleSaveMemo = () => {
    console.log("메모 저장:", memoText);
    setShowMemoModal(false);
  };

  const handleCloseMemo = () => {
    setShowMemoModal(false);
    setMemoText("");
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

        {/* 테스트 버튼 */}
        <button
          onClick={() => setShowEndingModal(true)}
          className="absolute top-16 left-4 z-50 bg-red-500/50 text-white text-xs px-2 py-1 rounded hover:bg-red-500"
        >
          (TEST) 자백 성공
        </button>

        {/* 상단 아이콘들 */}
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

          {/* [추가] 2. 남은 질문 횟수 표시 (화면 중앙 상단) */}
          <div className="absolute left-1/3 -translate-x-1/3 top-6 bg-black/50 px-4 py-1 rounded-full border border-[#864313]">
            <span className="text-[#D4AF37] font-bold text-lg drop-shadow-md">
              남은 질문 횟수: {remainingQuestions}
            </span>
          </div>

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

        {/* ---  게이지 바 UI --- */}
        <div className="absolute left-1/2 top-[220px] -translate-x-1/2 z-40 w-[230px] space-y-3">
          {/* 호감도 */}
          <div className="flex items-center gap-3">
            {/* 왼쪽 아이콘 */}
            <div className="w-[30px] flex-shrink-0 flex justify-center">
              <Image
                src="/icon/heart_icon.svg"
                alt="호감도"
                width={30}
                height={30}
              />
            </div>
            {/* 오른쪽 바 */}
            <div className="relative flex-1 h-[16px] rounded-full bg-gray-300/70 overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-pink-400 to-pink-500 transition-all duration-500 ease-out"
                style={{ width: `${npcStatus.affectionScore}%` }}
              />
            </div>
          </div>

          {/* 의심도 */}
          <div className="flex items-center gap-3">
            {/* 왼쪽 아이콘 */}
            <div className="w-[30px] flex-shrink-0 flex justify-center">
              <Image
                src="/icon/cloud_icon.svg"
                alt="의심도"
                width={30}
                height={30}
              />
            </div>
            {/* 오른쪽 바 */}
            <div className="relative flex-1 h-[16px] rounded-full bg-gray-300/70 overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-500 ease-out"
                style={{ width: `${npcStatus.suspicionScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* 캐릭터 흉상 */}
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

        {/* 캐릭터 대화창 */}
        <div className="absolute left-1/2 top-[540px] -translate-x-1/2 z-30 w-[400px] h-[170px] rounded-2xl overflow-hidden border-[4px] border-[#864313] shadow-[0_12px_30px_rgba(0,0,0,0.55)]">
          <Image
            src={characterDialogBg}
            alt="대사 배경"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 flex items-center justify-center px-8 py-6">
            <p className="text-white text-center text-base leading-relaxed whitespace-pre-wrap">
              {npcReply}
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
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                    handleSendMessage();
                  }
                }}
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

        {/* 엔딩 모달 */}
        {showEndingModal && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/80 animate-fadeIn">
            <div className="relative w-[360px] bg-[#1a1a1a] border-2 border-[#D4AF37] rounded-lg p-8 flex flex-col items-center shadow-[0_0_20px_rgba(212,175,55,0.3)] text-center">
              <div className="space-y-4 mb-8">
                <p className="text-[#ffffff] text-lg leading-relaxed whitespace-pre-line font-bold">
                  사건의 범인은{" "}
                  <span className="text-[#D4AF37]">
                    {CHARACTER_NAMES_KO[selectedCharacter]}
                  </span>
                  (으)로 밝혀졌다.
                  <br />
                  <br />
                  {CHARACTER_NAMES_KO[selectedCharacter]}는 자신의 잘못을
                  뉘우치고 동상을 원래대로 돌려놓았다.
                  <br />
                  <br />
                  {CHARACTER_NAMES_KO[selectedCharacter]}의 반성하는 태도와
                  자백으로 선처해 주기로 하였다.
                  <br />
                  <br />
                  &quot;황금 콘 도난 사건&quot;은 이렇게 일단락되었고... 카카오
                  회사의 평화가 찾아왔다...
                </p>
              </div>
              <button
                onClick={handleEndingNext}
                className="px-10 py-2 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors font-bold rounded shadow-[0_0_10px_rgba(212,175,55,0.2)]"
              >
                확인
              </button>
            </div>
          </div>
        )}

        {/* 인벤토리 모달 */}
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
