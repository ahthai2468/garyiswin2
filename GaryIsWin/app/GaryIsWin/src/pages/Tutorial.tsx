import React, { useEffect, useState } from "react";
import { Alert, BackHandler, Text, View } from "react-native";

import TutorialGame from "../logic/game/TutorialGame";
import Tutorials from "../logic/Tutorials";
import shared from "../Shared";
import { Colors, Fonts } from "../utils/Styles";
import BoardView from "../views/BoardView";
import Button from "../views/Button";
import ConfettiEffect from "../views/ConfettiEffect";

export default function Tutorial({ navigation }: any) {
  let [_, setNeedsUpdate] = useState(false);
  let [game] = useState(() => {
    let game = new TutorialGame();
    game.onUpdate = () => setNeedsUpdate((x) => !x);
    return game;
  });

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", () => true);
    return () =>
      BackHandler.removeEventListener("hardwareBackPress", () => true);
  }, []);

  if (game?.board?.player1WinStatus) {
    setTimeout(() => game?.nextTutorial(), 2000);
  }

  if (game?.tutorialNum == Tutorials.length + 1) {
    return (
      <View
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
          You've completed all the tutorials!
        </Text>
        <Button
          title="Finish"
          font={Fonts.handwriting}
          onPress={() => {
            navigation.navigate("Home");
          }}
        />
        <ConfettiEffect />
      </View>
    );
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
        {game?.board?.player1WinStatus
          ? "You Win!"
          : `Tutorial: ${game?.tutorialNum}`}
      </Text>
      <Text
        style={{
          fontSize: 26,
          height: 40,
          letterSpacing: 2,
          fontFamily: Fonts.handwriting,
          color: Colors.orange,
        }}>
        {game?.subText()}
      </Text>
      <BoardView
        size={game?.board?.size}
        grid={game?.board?.grid}
        p1PlaceQueue={game?.board?.p1PlaceQueue}
        definitionAdjacencies={game?.board?.getDefinitionAdjacencies()}
        p2PlaceQueue={game?.board?.p2PlaceQueue}
        p1Avatar={shared.currentUser?.avatar}
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
                  navigation.navigate("Home");
                },
              },
              {
                text: "Cancel",
                style: "cancel",
              },
            ]);
          }}
        />
        <Button
          title="Reset"
          font={Fonts.handwriting}
          onPress={() => {
            Alert.alert("Reset Tutorial", "Are you sure you want to reset?", [
              {
                text: "Reset",
                style: "destructive",
                onPress: () => game?.reset(),
              },
              {
                text: "Cancel",
                style: "cancel",
              },
            ]);
          }}
        />
      </View>
      {game?.board?.player1WinStatus && <ConfettiEffect />}
    </View>
  );
}
