import { Direction } from "../../types";
import Board from "../Board";
import { Definitions, Shapes } from "../TileTypes";

export default abstract class Game {
  board?: Board;
  onUpdate!: () => void;

  constructor() {}

  abstract turnText(): string;
  abstract move(dir: Direction): void;
  abstract place(x: number, y: number): void;
  abstract quit(): void;
  abstract reset(): void;

  subText(): string {
    if (this.board === undefined) return "";
    return this.board?.moveCount === 0
      ? this.board?.currentPlayer == Definitions.player1
        ? `Placing ${Shapes[this.board.p1PlaceQueue[0]]}`
        : `Placing ${Shapes[this.board.p2PlaceQueue[0]]}`
      : "Moves Left: " + (4 - this.board?.moveCount);
  }
}
