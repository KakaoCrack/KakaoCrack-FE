"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CHARACTERS } from "./character_data";
import bgImage from "@/assets/images/캐릭터 선택 페이지 배경화면.png";
import bgImage2 from "@/assets/images/캐릭터 선택 배경 1.png";
import buttonBg from "@/assets/images/캐릭터 선택 배경 2.png";
import nameBg from "@/assets/images/캐릭터 선택 배경 3 (캐릭터 이름).png";
import frameBg from "@/assets/images/캐릭터 액자 배경.png";
import inventoryBg from "@/assets/images/인벤토리 배경.png";
import userMemoBg from "@/assets/images/사용자 메모.png";

// 아이템 타입 정의
type Item = {
  id: string;
  name: string;
  description: string;
  icon: string;
  miniIcon: string;
};

// 아이템 데이터
const ITEMS: Item[] = [
  {
    id: "fur",
    name: "갈색 털뭉치",
    description: "누군가가 떨어뜨린\n갈색 털뭉치이다.",
    icon: "/character/아이템_갈색털뭉치.svg",
    miniIcon: "/character/아이템_갈색털뭉치_미니.svg",
  },
  {
    id: "coffee",
    name: "커피 자국",
    description: "누군가가 흘린\n커피 자국이다.",
    icon: "/character/아이템_커피자국.svg",
    miniIcon: "/character/아이템_커피자국_미니.svg",
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
];

export default function CharacterSelectPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showMemoModal, setShowMemoModal] = useState(false);
  const [memoText, setMemoText] = useState("");

  // 인벤토리 관련 상태
  const [inventory, setInventory] = useState<Item[]>(ITEMS);
  const [showInventory, setShowInventory] = useState(false);
  const [showItemDetailModal, setShowItemDetailModal] = useState(false);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);

  // 오류 모달 상태
  const [showErrorModal, setShowErrorModal] = useState(false);

  // 캐릭터 선택 토글 함수
  const handleCharacterClick = (id: string) => {
    if (selectedId === id) {
      setSelectedId(null);
    } else {
      setSelectedId(id);
    }
  };

  const handleSaveMemo = () => {
    console.log("메모 저장:", memoText);
    setShowMemoModal(false);
  };

  const handleCloseMemo = () => {
    setShowMemoModal(false);
    setMemoText(""); // 닫으면 내용 버리기
  };

  // 인벤토리에서 아이템 상세 보기 함수
  const handleItemDetail = (item: Item) => {
    setCurrentItem(item);
    setShowItemDetailModal(true);
  };

  // 시작 버튼 클릭 핸들러
  const handleStartClick = () => {
    if (selectedId) {
      // 선택된 캐릭터의 이름 찾기
      const selectedCharacter = CHARACTERS.find(
        (char) => char.id === selectedId
      );
      if (selectedCharacter) {
        console.log("취조 시작:", selectedCharacter.name);
        // 캐릭터 이름과 함께 취조 페이지로 이동
        router.push(`/interrogation?character=${selectedCharacter.name}`);
      }
    } else {
      // 캐릭터가 선택되지 않았을 때 오류 모달 띄우기
      setShowErrorModal(true);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#121212] flex items-center justify-center font-dunggeunmo p-4">
      <main
        className="relative overflow-hidden flex flex-col items-center shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-[#3e2723] rounded-lg"
        style={{ width: "1100px", height: "844px" }}
      >
        {/* 1. 메인 배경 이미지 */}
        <div className="absolute inset-0 z-0">
          <Image
            src={bgImage}
            alt="Background"
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0" />
        </div>

        {/* 2. 상단 네비게이션 */}
        <div className="relative z-20 w-full grid grid-cols-3 items-center px-10 py-10">
          {/* 왼쪽: 뒤로가기 (왼쪽 정렬) */}
          <div className="justify-self-start">
            <button
              onClick={() => router.push("/start")}
              className="hover:scale-110 transition-transform active:scale-95"
            >
              <Image
                src="/icon/sign_out_icon.svg"
                alt="Back"
                width={48}
                height={48}
              />
            </button>
          </div>

          {/* 가운데: 타이틀 (진짜 가운데 정렬) */}
          <div className="justify-self-center">
            <div className="relative w-[520px] overflow-hidden bg-[#4a3427]/95 border-3 border-[#8b5e3c] px-12 py-3 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.6)] flex items-center justify-center">
              <div className="absolute inset-0 z-0">
                <Image
                  src={bgImage2}
                  alt="Title Background"
                  fill
                  className="object-cover opacity-40"
                />
              </div>
              <h1 className="relative z-10 text-[#f3e5ab] text-2xl whitespace-nowrap tracking-tight font-bold">
                취조 할 캐릭터를 선택해주세요
              </h1>
            </div>
          </div>

          {/* 오른쪽: 아이콘들 (오른쪽 정렬) */}
          <div className="justify-self-end flex gap-5">
            <button
              onClick={() => setShowMemoModal(true)}
              className="hover:scale-110 transition-transform active:scale-95"
            >
              {" "}
              <Image
                src="/icon/memo_icon.svg"
                alt="Memo"
                width={48}
                height={48}
              />{" "}
            </button>
            <button
              onClick={() => setShowInventory(!showInventory)}
              className="hover:scale-110 transition-transform active:scale-95"
            >
              <Image
                src="/icon/bag_icon.svg"
                alt="Inventory"
                width={48}
                height={48}
              />
            </button>
          </div>
        </div>

        {/* 메모 모달 */}
        {showMemoModal && (
          <div className="absolute inset-0 z-[999] bg-black/60 animate-fadeIn">
            <div className="absolute top-[110px] left-1/2 -translate-x-1/2 w-[360px] h-[330px] relative">
              {/* 배경 이미지가 클릭을 가로채지 않게 */}
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

        {/* 인벤토리 패널 */}
        {showInventory && (
          <div className="absolute top-24 right-10 z-40 animate-fadeIn">
            <div className="relative w-[150px] h-[240px] rounded-2xl overflow-hidden border-4 border-[#463017] shadow-2xl">
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
                          ? "border-b-4 border-[#2b1b0f]/80"
                          : "",
                      ].join(" ")}
                      style={{ background: "rgba(0,0,0,0.10)" }}
                    >
                      <div className="w-12 h-12 flex items-center justify-center">
                        {inventoryItem && (
                          <Image
                            src={inventoryItem.miniIcon}
                            alt={inventoryItem.name}
                            width={50}
                            height={50}
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
                          width={24}
                          height={24}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 아이템 상세 모달 (StartPage 스타일 적용) */}
        {showItemDetailModal && currentItem && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 animate-fadeIn">
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

        {/* [수정] 오류 모달 (StartPage의 디자인 스타일 적용) */}
        {showErrorModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 animate-fadeIn">
            <div className="bg-black/90 border-4 border-[#D4AF37] rounded-3xl p-10 w-[500px] h-[300px] flex flex-col items-center justify-center shadow-2xl">
              {/* 제목: StartPage의 금색(#D4AF37) 사용 */}
              <div className="text-[#D4AF37] text-3xl font-bold mb-8">오류</div>

              {/* 메시지: StartPage의 금색(#D4AF37) 사용 */}
              <div className="text-[#D4AF37] text-xl font-bold mb-10">
                취조할 캐릭터를 선택하세요 !!
              </div>

              {/* 버튼: StartPage의 버튼 스타일 그대로 사용 */}
              <button
                onClick={() => setShowErrorModal(false)}
                className="px-10 py-3 bg-[#4A4A4A] hover:bg-[#5A5A5A] text-[#D4AF37] font-bold text-lg rounded-lg transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        )}

        {/* 3. 캐릭터 선택 그리드 */}
        <div className="relative z-20 grid grid-cols-4 gap-6 mt-24 px-10 w-full justify-items-center">
          {CHARACTERS.map((char) => (
            <div
              key={char.id}
              className="flex flex-col items-center w-full max-w-[220px]"
            >
              <div
                onClick={() => handleCharacterClick(char.id)}
                className={`relative overflow-hidden w-full aspect-[3/4] rounded-xl cursor-pointer border-4 transition-all duration-300
                  ${
                    selectedId === char.id
                      ? "border-[#ffcc33] shadow-[0_0_30px_rgba(255,204,51,0.5)] scale-105"
                      : "border-[#5d4037] hover:border-[#8b5e3c]"
                  }`}
              >
                <div className="absolute inset-0 z-0">
                  <Image
                    src={frameBg}
                    alt="Frame Bg"
                    fill
                    className="object-cover opacity-80"
                  />
                </div>
                <div className="relative z-10 w-full h-full">
                  <Image
                    src={char.image}
                    alt={char.name}
                    fill
                    className="p-8 object-contain"
                  />
                </div>
              </div>
              <div className="mt-4 relative overflow-hidden w-full border-4 border-[#5d4037] py-3 rounded-lg text-center shadow-lg">
                <div className="absolute inset-0 z-0">
                  <Image
                    src={nameBg}
                    alt="Name Bg"
                    fill
                    className="object-cover opacity-60"
                  />
                </div>
                <p className="relative z-10 text-white text-lg font-bold tracking-wider text-[20px] mb-1 uppercase tracking-tighter">
                  {char.role}
                  <br />
                  {char.name}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 4. 시작 버튼 */}
        <div className="relative z-20 mt-14">
          <button
            onClick={handleStartClick}
            className={`relative overflow-hidden px-24 py-3 border-4 rounded-md text-2xl font-bold transition-all duration-300 shadow-[0_6px_0_0_#2a1d15] active:translate-y-1 active:shadow-none
              ${
                selectedId
                  ? "border-[#ffcc33] text-[#ffcc33] cursor-pointer shadow-[0_0_25px_rgba(255,204,51,0.6)] scale-105"
                  : "border-[#8b5e3c] text-white cursor-pointer hover:brightness-110"
              }`}
          >
            <div className="absolute inset-0 z-0">
              <Image
                src={buttonBg}
                alt="Button Bg"
                fill
                className="object-cover"
              />
            </div>
            <span className="relative z-10 drop-shadow-md">취조 시작하기</span>
          </button>
        </div>
      </main>

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
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
