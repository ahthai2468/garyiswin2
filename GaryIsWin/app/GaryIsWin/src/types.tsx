export type User = {
  username: string;
  userId: string;
  stats: {
    lastLogin: Date;
    wins: number;
    losses: number;
    rank: number;
  };
  online: boolean;
  blockedUsers: string[];
  avatar: number;
};

export type Position = [number, number];
export type Up = [0, 1];
export type Down = [0, -1];
export type Left = [1, 0];
export type Right = [-1, 0];
export type Direction = Up | Down | Left | Right;
