"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

import backgroundImage from "@/assets/images/취조 페이지 배경.png";
import characterDialogBg from "@/assets/images/캐릭터 대사 배경.png";
import userChatBg from "@/assets/images/사용자 채팅칸 배경.png";
import userMemoBg from "@/assets/images/사용자 메모.png";
import inventoryBg from "@/assets/images/인벤토리 배경.png";
import { getSessionInventory, ITEM_ID_REVERSE_MAP } from "@/lib/api/inventory";
import { Item, NpcStatus } from "@/types/game";
import {
  BASE_URL,
  ITEMS,
  CHARACTER_BUSTS,
  REVERSE_NAME_MAP,
  CHARACTER_NAMES_KO,
  INITIAL_GREETINGS,
} from "@/constants/gameData";

export default function GameInterface() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSending, setIsSending] = useState(false);
  const [remainingQuestions, setRemainingQuestions] = useState(20);

  const [npcStatus, setNpcStatus] = useState<NpcStatus>({
    suspicionScore: 0,
    affectionScore: 0,
    isConfessed: false,
  });

  const [npcReply, setNpcReply] = useState("");
  const [displayedReply, setDisplayedReply] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const endingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const failTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [showEndingModal, setShowEndingModal] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);
  const [showMemoModal, setShowMemoModal] = useState(false);

  const [showItemAcquiredModal, setShowItemAcquiredModal] = useState(false);
  const [newlyAcquiredItems, setNewlyAcquiredItems] = useState<Item[]>([]);

  const [userInput, setUserInput] = useState("");
  const [lastSentMessage, setLastSentMessage] = useState("");
  const [memoText, setMemoText] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState("RYAN");

  const [inventory, setInventory] = useState<Item[]>([]);
  const [showInventory, setShowInventory] = useState(false);
  const [showItemDetailModal, setShowItemDetailModal] = useState(false);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);

  useEffect(() => {
    const paramCharacter = searchParams.get("character");
    let currentTarget = "RYAN";

    if (paramCharacter) {
      if (CHARACTER_BUSTS[paramCharacter]) {
        currentTarget = paramCharacter;
      } else if (REVERSE_NAME_MAP[paramCharacter]) {
        currentTarget = REVERSE_NAME_MAP[paramCharacter];
      }
      setSelectedCharacter(currentTarget);
    }

    const savedQuestions = localStorage.getItem("remainingQuestions");
    if (savedQuestions) {
      setRemainingQuestions(parseInt(savedQuestions, 10));
    }

    const savedStatus = localStorage.getItem(`npcStatus_${currentTarget}`);
    if (savedStatus) {
      setNpcStatus(JSON.parse(savedStatus));
    } else {
      setNpcStatus({
        suspicionScore: 0,
        affectionScore: 0,
        isConfessed: false,
      });
    }

    const savedReply = localStorage.getItem(`lastReply_${currentTarget}`);
    console.log("====== localStorage 복구 ======");
    console.log("savedReply:", savedReply);

    if (savedReply && savedReply.trim() && savedReply !== "undefined") {
      const cleanSavedReply = savedReply
        .split("undefined")
        .join("")
        .split("Undefined")
        .join("")
        .split("UNDEFINED")
        .join("")
        .trim();

      console.log("정제된 savedReply:", cleanSavedReply);

      if (cleanSavedReply && cleanSavedReply.length > 0) {
        setNpcReply(cleanSavedReply);
        setDisplayedReply(cleanSavedReply);
      } else {
        const greeting =
          INITIAL_GREETINGS[currentTarget] || INITIAL_GREETINGS.RYAN;
        setNpcReply(greeting);
        setDisplayedReply(greeting);
      }
    } else {
      const greeting =
        INITIAL_GREETINGS[currentTarget] || INITIAL_GREETINGS.RYAN;
      setNpcReply(greeting);
      setDisplayedReply(greeting);
    }

    setUserInput("");

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
            if (!itemData) return null;

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
        localStorage.setItem("collectedItems", JSON.stringify(frontendItems));
      } catch (error) {
        console.error("인벤토리 로드 실패:", error);
        const savedItems = localStorage.getItem("collectedItems");
        if (savedItems) {
          setInventory(JSON.parse(savedItems));
        }
      }
    };

    const savedMemo = localStorage.getItem("userMemo");
    if (savedMemo) {
      setMemoText(savedMemo);
    }

    loadInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleLogout = () => {
    router.push("/characterselect");
  };

  const typeText = (text: string, onComplete?: () => void) => {
    console.log("====== 타이핑 효과 시작 ======");
    console.log("입력 텍스트:", text);
    console.log("입력 길이:", text?.length);

    if (!text || text.length === 0) {
      console.warn("타이핑할 텍스트가 없습니다");
      setDisplayedReply("");
      setIsTyping(false);
      if (onComplete) onComplete();
      return;
    }

    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }

    setIsTyping(true);
    setDisplayedReply("");
    let index = 0;

    typingIntervalRef.current = setInterval(() => {
      if (index < text.length) {
        const char = text[index];
        setDisplayedReply((prev) => {
          const newText = prev + char;
          if (newText.includes("undefined")) {
            console.error("타이핑 중 undefined 발견!", newText);
          }
          return newText;
        });
        index++;
      } else {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }
        setIsTyping(false);
        console.log("====== 타이핑 효과 완료 ======");

        if (onComplete) {
          console.log("타이핑 완료 콜백 실행");
          onComplete();
        }
      }
    }, 70);
  };

  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
      if (endingTimeoutRef.current) {
        clearTimeout(endingTimeoutRef.current);
      }
      if (failTimeoutRef.current) {
        clearTimeout(failTimeoutRef.current);
      }
    };
  }, []);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isSending) return;

    const messageContent = userInput;
    const targetName = selectedCharacter;
    const sessionId = localStorage.getItem("sessionId");
    const accessToken = localStorage.getItem("accessToken");

    setLastSentMessage(messageContent);
    setIsSending(true);
    setDisplayedReply("생각 중...");

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
      console.log("====== 백엔드 응답 디버깅 시작 ======");
      console.log("전체 응답:", JSON.stringify(resData, null, 2));
      console.log("reply 원본:", resData.reply);
      console.log("reply 타입:", typeof resData.reply);
      console.log("reply 길이:", resData.reply?.length);

      if (resData.reply) {
        let cleanReply = String(resData.reply);

        console.log("변환 후 cleanReply:", cleanReply);
        console.log("변환 후 길이:", cleanReply.length);

        if (
          cleanReply === "undefined" ||
          cleanReply.toLowerCase() === "undefined"
        ) {
          console.error("응답 전체가 undefined입니다!");
          const fallbackMsg = "응답을 받지 못했습니다.";
          setNpcReply(fallbackMsg);
          setDisplayedReply(fallbackMsg);
          setIsTyping(false);
          return;
        }

        cleanReply = cleanReply
          .split("undefined")
          .join("")
          .split("Undefined")
          .join("")
          .split("UNDEFINED")
          .join("")
          .trim();

        console.log("undefined 제거 후:", cleanReply);
        console.log("제거 후 길이:", cleanReply.length);

        if (cleanReply && cleanReply.length > 0) {
          console.log("최종 저장될 reply:", cleanReply);
          setNpcReply(cleanReply);
          localStorage.setItem(`lastReply_${targetName}`, cleanReply);

          const onTypingComplete = () => {
            console.log("타이핑 완료 - 모달 조건 체크");
            console.log("isConfessed:", resData.state?.isConfessed);
            console.log("remainingQuestions:", resData.remainingQuestions);

            if (resData.state?.isConfessed === true) {
              console.log("✅ 검거 성공! 성공 모달 1.5초 후 표시");
              if (endingTimeoutRef.current) {
                clearTimeout(endingTimeoutRef.current);
              }
              endingTimeoutRef.current = setTimeout(() => {
                setShowEndingModal(true);
              }, 1500);
            } else if (
              typeof resData.remainingQuestions === "number" &&
              resData.remainingQuestions <= 0
            ) {
              console.log("❌ 검거 실패! 실패 모달 1.5초 후 표시");
              if (failTimeoutRef.current) {
                clearTimeout(failTimeoutRef.current);
              }
              failTimeoutRef.current = setTimeout(() => {
                setShowFailModal(true);
              }, 1500);
            }
          };

          typeText(cleanReply, onTypingComplete);
        } else {
          console.error("정제 후 빈 문자열!");
          const fallbackMsg = "응답을 처리할 수 없습니다.";
          setNpcReply(fallbackMsg);
          setDisplayedReply(fallbackMsg);
          setIsTyping(false);
        }
      } else {
        console.error("reply가 없습니다!");
      }

      console.log("====== 백엔드 응답 디버깅 끝 ======");

      if (typeof resData.remainingQuestions === "number") {
        setRemainingQuestions(resData.remainingQuestions);
        localStorage.setItem(
          "remainingQuestions",
          resData.remainingQuestions.toString()
        );
      }

      if (resData.state) {
        const newState = {
          suspicionScore: resData.state.suspicionScore,
          affectionScore: resData.state.affectionScore,
          isConfessed: resData.state.isConfessed,
        };

        setNpcStatus(newState);
        localStorage.setItem(
          `npcStatus_${targetName}`,
          JSON.stringify(newState)
        );
      }

      if (resData.rewards && resData.rewards.length > 0) {
        const newItems: Item[] = [];

        resData.rewards.forEach(
          (reward: { itemId: string; description?: string }) => {
            const frontendId = ITEM_ID_REVERSE_MAP[reward.itemId];
            const itemData = ITEMS.find((i) => i.id === frontendId);
            const isDuplicate = inventory.some((inv) => inv.id === frontendId);

            if (itemData && !isDuplicate) {
              let cleanDescription = itemData.description;
              if (reward.description && reward.description !== "undefined") {
                cleanDescription = String(reward.description)
                  .replace(/undefined/gi, "")
                  .trim();
                if (!cleanDescription) {
                  cleanDescription = itemData.description;
                }
              }

              newItems.push({
                ...itemData,
                description: cleanDescription,
              });
            }
          }
        );

        if (newItems.length > 0) {
          setNewlyAcquiredItems(newItems);
          setShowItemAcquiredModal(true);

          setInventory((prev) => {
            const updatedInventory = [...prev, ...newItems];
            localStorage.setItem(
              "collectedItems",
              JSON.stringify(updatedInventory)
            );
            return updatedInventory;
          });
        }
      }
    } catch (error) {
      console.error("API 요청 실패:", error);
      const errorMsg = "...(서버와의 연결이 불안정합니다)...";
      setNpcReply(errorMsg);
      setDisplayedReply(errorMsg);
      setIsTyping(false);
    } finally {
      setIsSending(false);
    }
  };

  const handleEndingNext = () => {
    router.push("/ending_arrest");
  };

  const handleFailNext = () => {
    router.push("/ending_fail");
  };

  const handleAcquiredModalConfirm = () => {
    setShowItemAcquiredModal(false);
    setNewlyAcquiredItems([]);
  };

  const handleSaveMemo = () => {
    console.log("메모 저장:", memoText);
    localStorage.setItem("userMemo", memoText);
    setShowMemoModal(false);
  };

  const handleCloseMemo = () => {
    setShowMemoModal(false);
    const savedMemo = localStorage.getItem("userMemo");
    if (savedMemo) {
      setMemoText(savedMemo);
    }
  };

  const handleItemDetail = (item: Item) => {
    setCurrentItem(item);
    setShowItemDetailModal(true);
  };

  const getCharacterImageSrc = () => {
    const koreanName = CHARACTER_NAMES_KO[selectedCharacter];
    let emotion = "기본";

    if (npcStatus.isConfessed) {
      emotion = "당황";
    } else if (npcStatus.suspicionScore >= 30) {
      emotion = "당황";
    } else if (npcStatus.affectionScore >= 30) {
      emotion = "호감";
    }

    return `/character/${koreanName}_${emotion}_흉상.svg`;
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

        {/* 상단 아이콘들 */}
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-3 pt-4">
          {/* 왼쪽: 나가기 버튼 */}
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

          {/* 중앙: 남은 질문 횟수 표시 */}
          <div className="absolute left-1/2 -translate-x-1/2 top-6 bg-black/50 px-4 py-1 rounded-full border border-[#864313]">
            <span className="text-[#D4AF37] font-bold text-lg drop-shadow-md whitespace-nowrap">
              남은 질문 횟수: {remainingQuestions}
            </span>
          </div>

          {/* 오른쪽: 메모 & 인벤토리 버튼 */}
          <div className="flex items-center gap-2">
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

        {/* 게이지 바 UI */}
        <div className="absolute left-1/2 top-[220px] -translate-x-1/2 z-40 w-[230px] space-y-3">
          {/* 호감도 */}
          <div className="flex items-center gap-3">
            <div className="w-[30px] flex-shrink-0 flex justify-center">
              <Image
                src="/icon/heart_icon.svg"
                alt="호감도"
                width={30}
                height={30}
              />
            </div>
            <div className="relative flex-1 h-[16px] rounded-full bg-gray-300/70 overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-pink-400 to-pink-500 transition-all duration-500 ease-out"
                style={{ width: `${npcStatus.affectionScore}%` }}
              />
            </div>
          </div>

          {/* 의심도 */}
          <div className="flex items-center gap-3">
            <div className="w-[30px] flex-shrink-0 flex justify-center">
              <Image
                src="/icon/cloud_icon.svg"
                alt="의심도"
                width={30}
                height={30}
              />
            </div>
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
              src={getCharacterImageSrc()}
              alt={selectedCharacter}
              fill
              priority
              className="select-none object-contain transition-opacity duration-300"
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
              {displayedReply}
              {isTyping && <span className="animate-pulse">|</span>}
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
                onFocus={() => {
                  if (userInput === lastSentMessage && lastSentMessage !== "") {
                    setUserInput("");
                    setLastSentMessage("");
                  }
                }}
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

        {/* 범인 검거 실패 모달 */}
        {showFailModal && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/80 animate-fadeIn">
            <div className="relative w-[360px] bg-[#1a1a1a] border-2 border-[#D4AF37] rounded-lg p-8 flex flex-col items-center shadow-[0_0_20px_rgba(212,175,55,0.3)] text-center">
              <div className="space-y-4 mb-8">
                <p className="text-[#ffffff] text-base leading-relaxed whitespace-pre-line font-bold">
                  사건의 진실은
                  <br />
                  끝내 밝혀지지 않았다.
                  <br />
                  정체를 알 수 없는 범인은
                  <br />
                  혼란 속을 틈타
                  <br />
                  어둠 속으로 사라졌고,
                  <br />
                  황금 콘의 행방은
                  <br />
                  여전히 모연하다.
                  <br />
                  남겨진 것은 부서진 흔적과
                  <br />
                  풀리지 않은 의문뿐.
                  <br />
                  &quot;황금 콘 도난 사건&quot;은
                  <br />
                  미해결 사건으로 남았고
                  <br />
                  카카오 회사에는
                  <br />
                  완전하지 않은 평화가
                  <br />
                  찾아왔다...
                </p>
              </div>
              <button
                onClick={handleFailNext}
                className="px-10 py-2 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors font-bold rounded shadow-[0_0_10px_rgba(212,175,55,0.2)]"
              >
                확인
              </button>
            </div>
          </div>
        )}

        {/* 아이템 획득 모달 */}
        {showItemAcquiredModal && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/80 animate-fadeIn">
            <div className="relative w-[360px] bg-[#1a1a1a] border-2 border-[#D4AF37] rounded-lg p-8 flex flex-col items-center shadow-[0_0_20px_rgba(212,175,55,0.3)] text-center">
              <div className="space-y-6 mb-8 flex flex-col items-center">
                <p className="text-[#D4AF37] text-xl font-bold mb-2">
                  ✨ 단서 획득! ✨
                </p>
                {newlyAcquiredItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="w-20 h-20 relative">
                      <Image
                        src={item.icon}
                        alt={item.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <p className="text-white text-lg font-bold">
                      [{item.name}]
                    </p>
                    <p className="text-gray-300 text-sm whitespace-pre-wrap">
                      을(를) 찾았습니다!
                    </p>
                  </div>
                ))}
              </div>
              <button
                onClick={handleAcquiredModalConfirm}
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
                  width={21}
                  height={21}
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
