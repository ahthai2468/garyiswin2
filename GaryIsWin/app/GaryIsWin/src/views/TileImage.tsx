import { Connector, Definition, Shape, Tile } from "../logic/Tiles";
import { Definitions, Shapes } from "../logic/TileTypes";
import { Images } from "../utils/Assets";
import { AvatarDefinitionImage, AvatarShapeImage } from "./AvatarImage";

function ShapeImage(
  type: Shapes,
  tick: number,
  avatar?: number,
  alternate: boolean = false
) {
  let idx = tick % 3;
  switch (type) {
    case Shapes.avatar1:
    case Shapes.avatar2:
      return AvatarShapeImage(avatar!, tick, alternate);
    case Shapes.triangle:
      return Images.shapes.triangle[idx];
    case Shapes.circle:
      return Images.shapes.circle[idx];
    case Shapes.square:
      return Images.shapes.square[idx];
    case Shapes.star:
      return Images.shapes.star[idx];
  }
}

function DefinitionImage(
  type: Definitions,
  tick: number,
  avatar?: number,
  alternate: boolean = false
) {
  let idx = tick % 3;
  switch (type) {
    case Definitions.player1:
      return Images.definitions.p1[idx];
    case Definitions.player2:
      return Images.definitions.p2[idx];
    case Definitions.triangle:
      return Images.definitions.triangle[idx];
    case Definitions.circle:
      return Images.definitions.circle[idx];
    case Definitions.square:
      return Images.definitions.square[idx];
    case Definitions.star:
      return Images.definitions.star[idx];
    case Definitions.avatar1:
    case Definitions.avatar2:
      return AvatarDefinitionImage(avatar!, tick, alternate);
    case Definitions.win:
      return Images.definitions.win[idx];
    case Definitions.lose:
      return Images.definitions.lose[idx];
    case Definitions.push:
      return Images.definitions.push[idx];
    case Definitions.stop:
      return Images.definitions.stop[idx];
  }
}

export default function TileImage(
  tile: Tile,
  tick: number,
  avatar?: number,
  alternate: boolean = false
) {
  if (tile instanceof Shape) {
    return ShapeImage(tile.type as Shapes, tick, avatar, alternate);
  } else if (tile instanceof Definition) {
    return DefinitionImage(tile.type as Definitions, tick, avatar, alternate);
  } else if (tile instanceof Connector) {
    return Images.definitions.is[tick % 3];
  } else return undefined;
}
