import { Item } from "@/types/game";

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const ITEMS: Item[] = [
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
];

export const CHARACTER_BUSTS: Record<string, string> = {
  RYAN: "/character/라이언_기본_흉상.svg",
  MUZI: "/character/무지_기본_흉상.svg",
  APEACH: "/character/어피치_기본_흉상.svg",
  FRODO: "/character/프로도_기본_흉상.svg",
};

export const REVERSE_NAME_MAP: Record<string, string> = {
  라이언: "RYAN",
  무지: "MUZI",
  어피치: "APEACH",
  프로도: "FRODO",
};

export const CHARACTER_NAMES_KO: Record<string, string> = {
  RYAN: "라이언",
  MUZI: "무지",
  APEACH: "어피치",
  FRODO: "프로도",
};

export const INITIAL_GREETINGS: Record<string, string> = {
  RYAN: "질문을 입력해서\n취조를 시작하세요.",
  MUZI: "질문을 입력해서\n취조를 시작하세요.",
  APEACH: "질문을 입력해서\n취조를 시작하세요.",
  FRODO: "질문을 입력해서\n취조를 시작하세요.",
};
