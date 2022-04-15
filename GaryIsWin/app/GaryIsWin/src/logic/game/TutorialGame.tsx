import { Direction } from "../../types";
import Board from "../Board";
import Tutorials from "../Tutorials";
import Game from "./Game";

export default class TutorialGame extends Game {
  board = new Board(9);
  tutorialNum = 1;

  constructor() {
    super();
    this.board = new Board(9, this.tutorialNum);
  }

  reset() {
    this.quit();
    this.board = new Board(9, this.tutorialNum);
    this.onUpdate();
  }

  turnText() {
    return "";
  }

  subText() {
    return Tutorials[this.tutorialNum - 1].blurb;
  }

  move(dir: Direction) {
    this.board?.move(dir);
    this.onUpdate();
  }

  place(x: number, y: number) {
    this.board.place(x, y);
    this.onUpdate();
  }

  quit() {
    delete this.board;
  }

  nextTutorial() {
    this.tutorialNum++;
    this.reset();
  }
}
