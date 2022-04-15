import { Animated } from "react-native";

import { Connector, Tile } from "../logic/Tiles";

type TileLayoutProps = {
  size: number;
  minDim: number;
  padding: number;
  cellMargin: number;
  tile: Tile;
};

export default function TileLayout(props: TileLayoutProps) {
  let { size, tile, minDim, padding, cellMargin } = props;
  let cellSize = (minDim - padding * 2) / size - cellMargin * 2;

  let position = (index: number) => {
    let offset = index * (cellSize + cellMargin * 2);
    return padding + offset + cellMargin;
  };

  let interpConfig: Animated.InterpolationConfigType = {
    inputRange: [0, size - 1],
    outputRange: [position(0), position(size - 1)],
  };

  if (tile instanceof Connector) {
    return {
      position: "absolute",
      top: cellSize / 4,
      left: cellSize / 4,
      height: cellSize / 2,
      width: cellSize / 2,
      transform: [
        { translateX: tile.location.x.interpolate(interpConfig) },
        { translateY: tile.location.y.interpolate(interpConfig) },
      ],
    };
  }

  return {
    position: "absolute",
    top: 0,
    left: 0,
    height: cellSize,
    width: cellSize,
    transform: [
      { translateX: tile.location.x.interpolate(interpConfig) },
      { translateY: tile.location.y.interpolate(interpConfig) },
    ],
  };
}
