import React, { useEffect, useState } from "react";
import { Alert, BackHandler, Text, View } from "react-native";
import { RTCSessionDescriptionType } from "react-native-webrtc";

import Game from "../logic/game/Game";
import LocalGame from "../logic/game/LocalGame";
import OnlineGame from "../logic/game/OnlineGame";
import { Definitions } from "../logic/TileTypes";
import shared from "../Shared";
import { User } from "../types";
import { Colors, Fonts } from "../utils/Styles";
import BoardView from "../views/BoardView";
import Button from "../views/Button";

type RouteParams = {
  isOnlineMatch: boolean;
  opponent?: User;
  offer?: RTCSessionDescriptionType;
  isRematch?: boolean;
};

type MatchProps = {
  route: { params: RouteParams };
  navigation: any;
};

export default function Match(props: MatchProps) {
  let { navigation, route } = props;
  let { isOnlineMatch, opponent, offer }: RouteParams = route.params;

  let [_, setNeedsUpdate] = useState(false);
  const [game] = useState(() => {
    let { isOnlineMatch } = route.params;
    let game: Game = isOnlineMatch
      ? new OnlineGame(opponent!, offer)
      : new LocalGame();
    game.onUpdate = () => setNeedsUpdate((x) => !x);
    if (game instanceof OnlineGame) {
      game.onClose = () => {
        Alert.alert(
          "Disconnect",
          "You have been disconnected from your opponent",
          [
            {
              text: "Quit",
              style: "destructive",
              onPress: () => {
                game?.quit();
                navigation.navigate("Friends");
              },
            },
          ]
        );
      };
    }
    return game;
  });

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", () => true);
    return () =>
      BackHandler.removeEventListener("hardwareBackPress", () => true);
  }, []);

  let p1Avatar = shared.currentUser?.avatar;
  let p2Avatar = shared.currentUser?.avatar;

  if (game instanceof OnlineGame) {
    p1Avatar =
      game?.playerNumber() == Definitions.player1
        ? shared.currentUser?.avatar
        : opponent?.avatar;
    p2Avatar =
      game?.playerNumber() == Definitions.player2
        ? shared.currentUser?.avatar
        : opponent?.avatar;

    if (game.isOver()) {
      let [connection, offer] = game.getConnectionInfo();

      if (game.playerNumber() == Definitions.player1) {
        shared.socket.emit(
          "game_finished",
          opponent?.userId,
          { winner: game.isWinner() },
          { winner: !game.isWinner() }
        );
      }

      setTimeout(() => {
        navigation.navigate("PostGame", {
          isWinner: game.isWinner(),
          opponent,
          connection,
          game,
          offer,
        });
      }, 1000);
    }
  }

  return (
    <View
      testID="Match Page"
      style={{
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.black,
      }}>
      <Text
        style={{
          fontSize: 46,
          fontFamily: Fonts.handwriting,
          textAlign: "center",
          color: Colors.blue,
        }}>
        {game?.turnText()}
        {game?.board?.player1WinStatus && "\nPlayer 1 Wins"}
        {game?.board?.player2WinStatus && "\nPlayer 2 Wins"}
      </Text>
      <View style={{ flexDirection: "row" }}>
        {[0, 1, 2, 3].map((idx) => {
          return (
            <View
              key={idx}
              style={{
                height: 20,
                width: 20,
                marginLeft: idx == 0 ? 0 : 6,
                marginRight: idx == 3 ? 0 : 6,
                borderColor: Colors.orange,
                borderWidth: 3,
                borderRadius: idx > 0 ? 10 : 0,
                backgroundColor:
                  game?.board?.moveCount! <= idx
                    ? "transparent"
                    : Colors.orange,
              }}
            />
          );
        })}
      </View>
      <BoardView
        size={game?.board?.size}
        grid={game?.board?.grid}
        activePlayer={game?.board?.currentPlayer}
        definitionAdjacencies={game?.board?.getDefinitionAdjacencies()}
        p1PlaceQueue={game?.board?.p1PlaceQueue}
        p2PlaceQueue={game?.board?.p2PlaceQueue}
        p1Avatar={p1Avatar}
        p2Avatar={p2Avatar}
        onPress={(row, col) => game?.place(row, col)}
        onSwipe={(dir) => game?.move(dir)}
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
        }}>
        <Button
          title="Quit"
          font={Fonts.handwriting}
          onPress={() => {
            Alert.alert("Quit Game", "Are you sure you want to quit?", [
              {
                text: "Quit",
                style: "destructive",
                onPress: () => {
                  game?.quit();
                  navigation.navigate(isOnlineMatch ? "Friends" : "Home");
                },
              },
              {
                text: "Cancel",
                style: "cancel",
              },
            ]);
          }}
        />
      </View>
    </View>
  );
}
