import { Animated, Easing } from "react-native";
import Haptics from "react-native-haptic-feedback";
import seedrandom from "seedrandom";
import UnionFind from "union-find";

import { Direction, Position } from "../types";
import { Definition, Shape, Tile } from "./Tiles";
import { Definitions, DefinitionStrings, randomShape, Shapes } from "./TileTypes";
import Tutorials from "./Tutorials";

export default class Board {
  size: number;
  grid: Tile[][][] = [];
  currentPlayer: Definitions.player1 | Definitions.player2 =
    Definitions.player1;
  moveCount: 0 | 1 | 2 | 3 = 0; // 0 for place, 1-3 for move
  player1WinStatus?: boolean;
  player2WinStatus?: boolean;
  ADT?: any;
  disjointSets: any = {};
  seed?: number;
  rng?: any;
  isTutorial: boolean;
  tutorialNum: number;
  p1PlaceQueue: Shapes[] = [];
  p2PlaceQueue: Shapes[] = [];
  defaultMin: Position = [2, 2];
  defaultMax: Position = [7, 7];

  constructor(size: number, tutorialNum = 0, seed?: number) {
    this.size = size;
    this.isTutorial = tutorialNum > 0;
    this.tutorialNum = tutorialNum;
    this.moveCount = this.isTutorial ? 1 : 0;
    this.seed = seed ?? new Date().getTime();
    this.generateBoard();
  }

  generateBoard() {
    if (this.isTutorial) {
      this.loadTutorial();
      this.p1PlaceQueue = [];
      this.p2PlaceQueue = [];
      return;
    }
    this.rng = seedrandom(this.seed);
    this.p1PlaceQueue = [
      randomShape(this.rng),
      randomShape(this.rng),
      randomShape(this.rng),
    ];
    this.p2PlaceQueue = [
      randomShape(this.rng),
      randomShape(this.rng),
      randomShape(this.rng),
    ];
    this.createEmptyBoard(this.size);
    this.randomizeBoard();
    this.updateDefinitions();
  }

  createEmptyBoard(size: number) {
    this.size = size;
    this.grid = [];
    for (let i = 0; i < this.size; i++) {
      this.grid.push([]);
      for (let j = 0; j < this.size; j++) {
        this.grid[i].push([]);
      }
    }
  }

  loadTutorial() {
    try {
      Tutorials[this.tutorialNum - 1].load(this);
    } catch {}
    this.updateDefinitions();
  }

  randomizeBoard() {
    let preset = this.rng();
    // Default situation where players start on opposite ends and defintions
    // are all placed in the middle
    this.addShape(Shapes.avatar1, 0, 0);
    this.addShape(Shapes.avatar2, this.size - 1, this.size - 1);
    this.addDefinition(Definitions.avatar1, this.size - 2, 0);
    this.addDefinition(Definitions.player1, this.size - 1, 0);
    this.addDefinition(Definitions.avatar2, 0, this.size - 1);
    this.addDefinition(Definitions.player2, 1, this.size - 1);
    this.placeRandomDefinitions([
      { name: Definitions.triangle, weight: 1 },
      { name: Definitions.square, weight: 1 },
      { name: Definitions.circle, weight: 1 },
      { name: Definitions.star, weight: 1 },
      { name: Definitions.push, weight: 1 },
      { name: Definitions.stop, weight: 1 },
    ]);
    this.addDefinition(Definitions.win, undefined, undefined, true);
  }

  placeRandomShapes(
    shapeWeights: { name: Shapes; weight: number }[],
    min: Position = this.defaultMin,
    max: Position = this.defaultMax
  ) {
    shapeWeights.forEach((shape) => {
      let amount = Math.floor(shape.weight);
      amount += this.rng() < shape.weight % 1 ? 1 : 0;
      for (let i = 0; i < amount; i++) {
        this.addShape(shape.name, undefined, undefined, min, max);
      }
    });
  }

  placeRandomDefinitions(
    definitionWeights: { name: Definitions; weight: number }[],
    min: Position = this.defaultMin,
    max: Position = this.defaultMax
  ) {
    definitionWeights.forEach((definition) => {
      let amount = Math.floor(definition.weight);
      amount += this.rng() < definition.weight % 1 ? 1 : 0;
      for (let i = 0; i < amount; i++) {
        this.addDefinition(
          definition.name,
          undefined,
          undefined,
          false,
          min,
          max
        );
      }
    });
  }

  shapeTiles() {
    return this.grid
      .reduce((neighbors, list) => neighbors.concat(list), [])
      .reduce((neighbors, list) => neighbors.concat(list), [])
      .filter((tile) => tile instanceof Shape) as Shape[];
  }

  definitionTiles() {
    return this.grid
      .reduce((neighbors, list) => neighbors.concat(list), [])
      .reduce((neighbors, list) => neighbors.concat(list), [])
      .filter((tile) => tile instanceof Definition) as Definition[];
  }

  addShape(
    type: Shapes,
    x?: number,
    y?: number,
    min: Position = this.defaultMin,
    max: Position = this.defaultMax
  ) {
    if (x != undefined && y != undefined) {
      this.grid[x][y].push(new Shape(type, [x, y]));
    } else {
      let pos = this.randomOpenPos(min, max, false);
      this.grid[pos[0]][pos[1]].push(new Shape(type, pos));
    }
  }

  addDefinition(
    type: Definitions,
    x?: number,
    y?: number,
    isolate = false,
    min: Position = [2, 2],
    max: Position = [7, 7]
  ) {
    if (x != undefined && y != undefined) {
      this.grid[x][y].push(new Definition(type, [x, y]));
    } else {
      let pos = this.randomOpenPos(min, max, isolate);
      this.grid[pos[0]][pos[1]].push(new Definition(type, pos));
    }
  }

  randomOpenPos(
    min: Position = [0, 0],
    max: Position = [this.size, this.size],
    isolate: boolean
  ): Position {
    let pos: Position[] = [];
    do {
      pos = [
        [
          min[0] + Math.trunc(this.rng() * (max[0] - min[0])),
          min[1] + Math.trunc(this.rng() * (max[1] - min[1])),
        ],
      ];
      if (isolate) {
        pos = pos.concat(this.getAdjacentPositions(pos[0]));
      }
    } while (this.tilesAtAll(pos).length > 0);
    return pos[0];
  }

  getAdjacentPositions(pos: Position): Position[] {
    return [
      [pos[0], pos[1] + 1],
      [pos[0], pos[1] - 1],
      [pos[0] + 1, pos[1]],
      [pos[0] - 1, pos[1]],
    ];
  }

  isValidPosition(pos: Position) {
    return pos.every((a) => a >= 0 && a < this.size);
  }

  tilesAt(pos: Position) {
    if (!this.isValidPosition(pos)) return [];
    return this.grid[pos[0]][pos[1]];
  }

  tilesAtAll(positions: Position[]) {
    return positions.reduce(
      (tiles: Tile[], cur: Position) => tiles.concat(this.tilesAt(cur)),
      []
    );
  }

  containsStop(pos: Position) {
    let stopTypes = this.tileTypesThatAre(Definitions.stop);
    let stopTiles = this.tilesAt(pos).filterTypes(stopTypes);
    return stopTiles.length > 0;
  }

  tileTypesThatAre(type: Definitions) {
    let idx = this.ADT.find(this.disjointSets[DefinitionStrings[type]]);
    let definitionsEquivalentToType = DefinitionStrings.filter(
      (str) => this.ADT.find(this.disjointSets[str]) == idx
    );
    return definitionsEquivalentToType.map((str) =>
      DefinitionStrings.indexOf(str)
    );
  }

  getDefinitionAdjacencies() {
    return this.definitionTiles().reduce((tilePairs, tile) => {
      tile.getAdjacent(this).forEach((neighbor) => {
        tilePairs.push([tile, neighbor]);
      });
      return tilePairs;
    }, [] as [Definition, Definition][]);
  }

  updateDefinitions() {
    this.ADT = new UnionFind(DefinitionStrings.length);
    DefinitionStrings.forEach((definition) => {
      this.disjointSets[definition] = this.ADT.makeSet();
    });
    this.getDefinitionAdjacencies().forEach(([tile, neighbor]) => {
      this.ADT.link(
        this.disjointSets[DefinitionStrings[tile.type]],
        this.disjointSets[DefinitionStrings[neighbor.type]]
      );
    });
    this.checkWinConditions();
  }

  checkWinConditions() {
    let winTileTypes = this.tileTypesThatAre(Definitions.win);
    let loseTileTypes = this.tileTypesThatAre(Definitions.lose);
    let player1TileTypes = this.tileTypesThatAre(Definitions.player1);
    let player2TileTypes = this.tileTypesThatAre(Definitions.player2);
    let winShapes = this.shapeTiles().filterTypes(winTileTypes);
    let loseShapes = this.shapeTiles().filterTypes(loseTileTypes);
    winShapes.forEach((shape) => {
      this.tilesAt(shape.pos).forEach((tile) => {
        if (tile instanceof Definition) return;
        if (player1TileTypes.includes(tile.type)) {
          this.player1WinStatus = true;
        }
        if (player2TileTypes.includes(tile.type)) {
          this.player2WinStatus = true;
        }
      });
    });

    loseShapes.forEach((shape) => {
      this.tilesAt(shape.pos).forEach((tile) => {
        if (tile instanceof Definition) return;
        if (player1TileTypes.includes(tile.type)) {
          this.player1WinStatus = false;
        }
        if (player2TileTypes.includes(tile.type)) {
          this.player2WinStatus = false;
        }
      });
    });
  }

  advanceMove() {
    if (!this.isTutorial) {
      this.moveCount++;
      if (this.moveCount > 3) {
        this.moveCount = 0;
        this.currentPlayer =
          this.currentPlayer == Definitions.player1
            ? Definitions.player2
            : Definitions.player1;
      }
    }
  }

  move(dir: Direction) {
    if (this.isTutorial && this.player1WinStatus) return false;
    if (this.moveCount < 1) return false;
    let playerTypes = this.tileTypesThatAre(this.currentPlayer);
    let playerShapes = this.shapeTiles().filterTypes(playerTypes);
    let success = false;
    let oldGrid = this.grid;
    let animations: Animated.CompositeAnimation[] = [];
    let failureAnimations: Animated.CompositeAnimation[] = [];
    playerShapes.forEach((shape) => {
      let [shapeSuccess, newGrid, newAnimations] = shape.move(dir, this);
      if (shapeSuccess) {
        success = true;
        this.grid = newGrid;
        animations = animations.concat(newAnimations);
      } else {
        let springTo = {
          x: shape.pos[1] + dir[1] / 3,
          y: shape.pos[0] + dir[0] / 3,
        };
        failureAnimations.push(
          Animated.sequence([
            Animated.timing(shape.location, {
              toValue: springTo,
              duration: 120,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.spring(shape.location, {
              toValue: {
                x: shape.pos[1],
                y: shape.pos[0],
              },
              useNativeDriver: true,
            }),
          ])
        );
      }
    });

    if (!success && playerShapes.length > 0) {
      this.grid = oldGrid;
      Haptics.trigger("notificationError");
      Animated.parallel(failureAnimations).start();
      return false;
    }

    Animated.parallel(animations).start();
    this.updateDefinitions();
    this.advanceMove();
    return true;
  }

  place(x: number, y: number) {
    if (this.moveCount != 0) return false;
    if (this.tilesAt([x, y]).length > 0) return false;
    let shape: Shapes;
    if (this.currentPlayer == Definitions.player1) {
      shape = this.p1PlaceQueue.shift()!;
      this.addShape(shape, x, y);
      this.p1PlaceQueue.push(randomShape(this.rng));
    } else {
      shape = this.p2PlaceQueue.shift()!;
      this.addShape(shape, x, y);
      this.p2PlaceQueue.push(randomShape(this.rng));
    }
    this.advanceMove();
    return shape;
  }
}
