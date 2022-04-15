import { Animated, Easing } from "react-native";

import { Direction, Position } from "../types";
import Board from "./Board";
import { Definitions, Shapes } from "./TileTypes";

declare global {
  interface Array<T extends Tile> {
    filterTypes(types: (Shapes | Definitions)[]): Array<Shape>;
  }
}

Array.prototype.filterTypes = function (types) {
  return this.filter(
    (tile) => tile instanceof Shape && types.includes(tile.type)
  ) as Shape[];
};

export class Tile {
  static id: number = 0;
  id: number = Tile.id;
  type: Shapes | Definitions;
  pos: Position;
  location: Animated.ValueXY;

  constructor(type: Shapes | Definitions, pos: Position) {
    this.type = type;
    this.pos = pos;
    this.location = new Animated.ValueXY({ x: pos[1], y: pos[0] });
    Tile.id++;
  }

  selectAvatar() {
    let p1AvatarTypes = [Shapes.avatar1, Definitions.avatar1];
    let p2AvatarTypes = [Shapes.avatar2, Definitions.avatar2];
    if (p1AvatarTypes.some((type) => type == this.type)) {
      return 1;
    } else if (p2AvatarTypes.some((type) => type == this.type)) {
      return 2;
    } else {
      return undefined;
    }
  }

  move(
    dir: Direction,
    board: Board,
    grid?: Tile[][][]
  ): [boolean, Tile[][][], Animated.CompositeAnimation[]] {
    let pos = this.pos;
    let newPos: Position = [pos[0] + dir[0], pos[1] + dir[1]];
    if (!board.isValidPosition(newPos) || board.containsStop(newPos)) {
      return [false, [], []];
    }

    grid = grid ?? board.grid;
    let animations: Animated.CompositeAnimation[] = [];

    // Move recursively
    let pushTypes = board.tileTypesThatAre(Definitions.push);
    let pushTiles: Tile[] = board.tilesAt(newPos).filterTypes(pushTypes);
    pushTiles = pushTiles.concat(
      board
        .definitionTiles()
        .filter((tile) => tile.pos[0] == newPos[0] && tile.pos[1] == newPos[1])
    );

    let pushSuccess = true;
    pushTiles.forEach((tile) => {
      let [success, updatedGrid, newAnimations] = tile.move(dir, board, grid);
      if (success) {
        grid = updatedGrid;
        animations = animations.concat(newAnimations);
      } else {
        pushSuccess = false;
      }
    });
    if (!pushSuccess) return [false, [], []];

    this.pos = newPos;
    animations.push(
      Animated.timing(this.location, {
        toValue: {
          x: newPos[1],
          y: newPos[0],
        },
        easing: Easing.out(Easing.ease),
        duration: 120,
        useNativeDriver: true,
      })
    );

    let newGrid = grid;
    newGrid[pos[0]][pos[1]].forEach((tile) => {
      if (tile.type === this.type) {
        newGrid[this.pos[0]][this.pos[1]].push(tile);
        newGrid[pos[0]][pos[1]].splice(
          newGrid[pos[0]][pos[1]].indexOf(tile),
          1
        );
      }
    });

    return [true, newGrid, animations];
  }
}

export class Shape extends Tile {
  constructor(type: Shapes, pos: Position) {
    super(type, pos);
  }
}

export class Connector extends Tile {
  constructor(type: Definitions, pos: Position) {
    super(type, pos);
  }
}

export class Definition extends Tile {
  constructor(type: Definitions, pos: Position) {
    super(type, pos);
  }

  getAdjacent(board: Board) {
    let toCheck: Direction[] = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ];
    return toCheck
      .map((pos) => {
        let neighborPos: Position = [
          this.pos[0] + pos[0],
          this.pos[1] + pos[1],
        ];
        return board
          .tilesAt(neighborPos)
          .filter((tile) => tile instanceof Definition) as Definition[];
      })
      .reduce((neighbors, list) => neighbors.concat(list), []);
  }
}
