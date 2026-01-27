export type Item = {
  id: string;
  name: string;
  description: string;
  icon: string;
  miniIcon: string;
};

export type NpcStatus = {
  suspicionScore: number;
  affectionScore: number;
  isConfessed: boolean;
};
