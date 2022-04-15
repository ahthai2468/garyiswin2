import React, { RefObject, useMemo, useRef, useState } from "react";
import {
  Animated, Dimensions, PanResponder, Platform, TouchableOpacity, View
} from "react-native";
import { FlatList } from "react-native-gesture-handler";

import { Connector, Definition, Shape, Tile } from "../logic/Tiles";
import {
  Definitions, DefinitionStrings, Shapes, ShapeStrings
} from "../logic/TileTypes";
import shared from "../Shared";
import { Direction } from "../types";
import TileLayout from "../utils/Layout";
import { Colors } from "../utils/Styles";
import useInterval from "../utils/useInterval";
import TileImage from "./TileImage";

type BoardViewProps = {
  size?: number;
  padding?: number;
  cellMargin?: number;
  grid?: Tile[][][];
  definitionAdjacencies?: [Definition, Definition][];
  activePlayer?: Definitions.player1 | Definitions.player2;
  p1Avatar?: number;
  p2Avatar?: number;
  p1PlaceQueue?: Shapes[];
  p2PlaceQueue?: Shapes[];
  onPress: (row: number, col: number) => void;
  onSwipe: (dir: Direction) => void;
};

const backgroundBorderWidth = 0.5;

export default function BoardView(props: BoardViewProps) {
  let {
    size = 9,
    padding = 10,
    cellMargin = 2,
    grid,
    definitionAdjacencies,
    activePlayer,
    p1Avatar = 0,
    p2Avatar = 0,
    p1PlaceQueue,
    p2PlaceQueue,
    onPress,
    onSwipe,
  } = props;

  let { height, width } = Dimensions.get("window");
  let minDim = Math.min(height, width);
  let layoutConstants = { size, minDim, padding, cellMargin };
  let boardRef = useRef<View>();

  let [tick, setTick] = useState(0);
  useInterval(() => setTick((x) => x + 1), shared.tickRate);

  let panResp = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          const pos = [gestureState.dx, gestureState.dy];
          return pos.some((x) => Math.abs(x) > 0);
        },
        onMoveShouldSetPanResponderCapture: (_, gestureState) => {
          const pos = [gestureState.dx, gestureState.dy];
          return pos.some((x) => Math.abs(x) > 0);
        },
        onPanResponderRelease: (_, gestureState) => {
          const { dx, dy } = gestureState;
          let dir: Direction;
          if (Math.abs(dx) > Math.abs(dy)) dir = dx > 0 ? [0, 1] : [0, -1];
          else dir = dy > 0 ? [1, 0] : [-1, 0];
          onSwipe(dir);
        },
      }),
    [onSwipe]
  );

  return (
    <>
      {(p1PlaceQueue || p2PlaceQueue) && (
        <View style={{ height: (minDim - padding * 2) / size }} />
      )}
      <View {...panResp.panHandlers}>
        <TouchableOpacity
          activeOpacity={1}
          style={{
            zIndex: 0,
            height: minDim + backgroundBorderWidth * 2,
            width: minDim + backgroundBorderWidth * 2,
            padding,
          }}
          onPress={(e) => {
            if ((boardRef.current as any)?._nativeTag != e.nativeEvent.target)
              return;
            let rescale =
              size / (minDim + backgroundBorderWidth * 2 - padding * 2);
            let row = Math.trunc((e.nativeEvent.locationY - padding) * rescale);
            let col = Math.trunc((e.nativeEvent.locationX - padding) * rescale);
            onPress(row, col);
          }}>
          <FlatList
            key={size}
            data={Array(size * size).fill(0)}
            keyExtractor={(_, index) => index.toString()}
            numColumns={size}
            contentContainerStyle={{
              backgroundColor: "black",
              opacity: Platform.select({
                ios: 0.37,
                android: 1,
              }),
            }}
            renderItem={() => {
              return (
                <View
                  style={{
                    borderColor: "black",
                    borderWidth: backgroundBorderWidth,
                    height: (minDim - padding * 2) / size,
                    width: (minDim - padding * 2) / size,
                    backgroundColor: Colors.black,
                  }}
                />
              );
            }}
          />
          <View
            ref={boardRef as RefObject<View>}
            style={{
              zIndex: 1,
              position: "absolute",
              height: minDim,
              width: minDim,
            }}>
            {grid?.map((row) => {
              return row.map((cell) => {
                return cell.map((tile) => {
                  let avatar: number | undefined;
                  let selection = tile.selectAvatar();
                  if (selection == 1) avatar = p1Avatar;
                  else if (selection == 2) avatar = p2Avatar;
                  let alternate = selection == 2 && p1Avatar == p2Avatar;
                  let image = TileImage(tile, tick, avatar, alternate);
                  let layout = TileLayout({ ...layoutConstants, tile });
                  return image ? (
                    <Animated.Image
                      key={tile.id}
                      source={image}
                      resizeMode="cover"
                      fadeDuration={0}
                      style={layout}
                    />
                  ) : (
                    <Animated.Text
                      key={tile.id}
                      style={{
                        ...layout,
                        color: "white",
                        borderRadius: 5,
                        borderWidth: 1,
                        borderColor:
                          tile instanceof Definition ? "red" : "blue",
                        padding: 5,
                      }}>
                      {tile instanceof Definition
                        ? DefinitionStrings[tile.type]
                        : ShapeStrings[tile.type]}
                    </Animated.Text>
                  );
                });
              });
            })}
            {p1PlaceQueue?.map((shape, idx) => {
              let tile = new Shape(shape, [-1, idx]);
              let layout = TileLayout({ ...layoutConstants, tile });
              let image = TileImage(tile, idx);
              let tint =
                activePlayer == Definitions.player1 && idx == 0
                  ? {}
                  : { tintColor: "gray" };
              return (
                image && (
                  <Animated.Image
                    key={tile.id}
                    source={image}
                    resizeMode="cover"
                    fadeDuration={0}
                    style={{ ...layout, ...tint }}
                  />
                )
              );
            })}
            {p2PlaceQueue?.map((shape, idx) => {
              let tile = new Shape(shape, [-1, size - idx - 1]);
              let layout = TileLayout({ ...layoutConstants, tile });
              let image = TileImage(tile, idx);
              let tint =
                activePlayer == Definitions.player2 && idx == 0
                  ? {}
                  : { tintColor: "gray" };
              return (
                image && (
                  <Animated.Image
                    key={tile.id}
                    source={image}
                    resizeMode="cover"
                    fadeDuration={0}
                    style={{ ...layout, ...tint }}
                  />
                )
              );
            })}
          </View>
        </TouchableOpacity>
        {definitionAdjacencies?.map(([tile, neighbor]) => {
          let x = (tile.pos[0] + neighbor.pos[0]) / 2;
          let y = (tile.pos[1] + neighbor.pos[1]) / 2;
          let newTile = new Connector(Definitions.is, [x, y]);
          let layout = TileLayout({ ...layoutConstants, tile: newTile });
          let image = TileImage(newTile, tick);
          return (
            <Animated.Image
              source={image}
              resizeMode="cover"
              fadeDuration={0}
              style={{ ...layout }}
            />
          );
        })}
      </View>
    </>
  );
}
