import { Direction, User } from "../../types";
import Board from "../Board";
import { Definitions, randomShape } from "../TileTypes";
import Game from "./Game";

export default class LocalGame extends Game {
  board = new Board(9);

  reset() {
    this.quit();
    this.board = new Board(9);
  }

  turnText() {
    let playerName = this.isPlayer1() ? "P1" : "P2";
    return `${playerName}'s Turn`;
  }

  isPlayer1() {
    let currentPlayer = this.board.currentPlayer;
    return currentPlayer === Definitions.player1;
  }

  move(dir: Direction) {
    this.board.move(dir);
    this.onUpdate();
  }

  place(x: number, y: number) {
    this.board.place(x, y);
    this.onUpdate();
  }

  quit() {
    delete this.board;
  }
}
