import Board from "./Board";
import { Definitions, Shapes } from "./TileTypes";

type Tutorial = {
  blurb: string;
  load: (board: Board) => void;
};

let Tutorials: Tutorial[] = [
  {
    blurb: "Move to the square to win!",
    load: (board: Board) => {
      board.createEmptyBoard(5);
      board.addDefinition(Definitions.player1, 0, 0);
      board.addDefinition(Definitions.avatar1, 1, 0);
      board.addDefinition(Definitions.square, 4, 4);
      board.addDefinition(Definitions.win, 4, 3);
      board.addShape(Shapes.avatar1, 2, 2);
      board.addShape(Shapes.square, 0, 4);
    },
  },
  {
    blurb: "Make square win by pushing win!",
    load: (board: Board) => {
      board.createEmptyBoard(5);
      board.addDefinition(Definitions.player1, 3, 0);
      board.addDefinition(Definitions.avatar1, 4, 0);
      board.addDefinition(Definitions.square, 0, 4);
      board.addDefinition(Definitions.win, 0, 2);
      board.addShape(Shapes.avatar1, 2, 2);
      board.addShape(Shapes.square, 4, 4);
    },
  },
  {
    blurb: "Make yourself win!",
    load: (board: Board) => {
      board.createEmptyBoard(5);
      board.addDefinition(Definitions.player1, 3, 0);
      board.addDefinition(Definitions.avatar1, 4, 0);
      board.addDefinition(Definitions.win, 1, 3);
      board.addShape(Shapes.avatar1, 2, 2);
    },
  },
  {
    blurb: "Make triangle not stop!",
    load: (board: Board) => {
      board.createEmptyBoard(7);
      board.addDefinition(Definitions.player1, 0, 0);
      board.addDefinition(Definitions.avatar1, 1, 0);
      board.addDefinition(Definitions.square, 6, 0);
      board.addDefinition(Definitions.win, 6, 1);
      board.addDefinition(Definitions.triangle, 1, 6);
      board.addDefinition(Definitions.stop, 1, 5);
      board.addShape(Shapes.avatar1, 2, 2);
      board.addShape(Shapes.square, 6, 6);
      board.addShape(Shapes.triangle, 3, 0);
      board.addShape(Shapes.triangle, 3, 1);
      board.addShape(Shapes.triangle, 3, 2);
      board.addShape(Shapes.triangle, 3, 3);
      board.addShape(Shapes.triangle, 3, 4);
      board.addShape(Shapes.triangle, 3, 5);
      board.addShape(Shapes.triangle, 3, 6);
    },
  },
  {
    blurb: "Make yourself star!",
    load: (board: Board) => {
      board.createEmptyBoard(7);
      board.addDefinition(Definitions.player1, 0, 0);
      board.addDefinition(Definitions.avatar1, 0, 1);
      board.addDefinition(Definitions.square, 6, 6);
      board.addDefinition(Definitions.win, 6, 5);
      board.addDefinition(Definitions.star, 3, 0);
      board.addDefinition(Definitions.circle, 6, 0);
      board.addDefinition(Definitions.stop, 5, 0);
      board.addShape(Shapes.avatar1, 2, 2);
      board.addShape(Shapes.square, 4, 4);
      board.addShape(Shapes.circle, 0, 3);
      board.addShape(Shapes.circle, 1, 3);
      board.addShape(Shapes.circle, 2, 3);
      board.addShape(Shapes.circle, 3, 3);
      board.addShape(Shapes.circle, 4, 3);
      board.addShape(Shapes.circle, 5, 3);
      board.addShape(Shapes.circle, 6, 3);
      board.addShape(Shapes.star, 4, 5);
    },
  },
];

export default Tutorials;
