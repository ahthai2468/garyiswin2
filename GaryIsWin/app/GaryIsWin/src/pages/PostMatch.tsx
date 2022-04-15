import React, { useEffect, useState } from "react";
import {
  Animated, BackHandler, Easing, Image, SafeAreaView, Text, View
} from "react-native";
import { RTCSessionDescriptionType } from "react-native-webrtc";

import AnimateNumber from "@bankify/react-native-animate-number";

import OnlineGame from "../logic/game/OnlineGame";
import shared from "../Shared";
import { User } from "../types";
import PeerConnection from "../utils/Networking";
import { Colors, Fonts } from "../utils/Styles";
import Button from "../views/Button";
import ConfettiEffect from "../views/ConfettiEffect";

type RouteParams = {
  isWinner: boolean;
  opponent: User;
  connection: PeerConnection;
  offer?: RTCSessionDescriptionType;
  game: OnlineGame;
};

export default function PostGame({ navigation, route }: any) {
  let {
    isWinner,
    opponent,
    connection,
    offer,
    game,
  }: RouteParams = route.params;

  let [requestRematch, setRequestRematch] = useState(false);
  let [opponentRequestRematch, setOpponentRequestRematch] = useState(false);
  let [changeOpacity, _] = useState(new Animated.Value(1));
  let [displayTarget, setDisplayTarget] = useState(0);

  let rematch = () => {
    opponent.stats.rank -= rankChange;
    shared.currentUser!.stats.rank += rankChange;
    game.resetBoard();
    navigation.navigate("Match", {
      isOnlineMatch: true,
      opponent,
      offer,
      isRematch: true,
    });
  };

  let rankChange = Math.trunc(
    Math.max(
      Math.min((opponent.stats.rank - shared.currentUser!.stats.rank) / 20, 45),
      -45
    )
  );
  rankChange += isWinner ? 50 : -50;

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", () => true);
    return () =>
      BackHandler.removeEventListener("hardwareBackPress", () => true);
  }, []);

  useEffect(() => {
    connection.onMessage = (data: String) => {
      if (data == "rematch") {
        if (requestRematch) {
          rematch();
        } else {
          setOpponentRequestRematch(true);
        }
      }
    };

    setTimeout(() => setDisplayTarget(rankChange), 1000);
  });

  return (
    <SafeAreaView
      testID="Post Game Page"
      style={{
        flex: 1,
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
        backgroundColor: Colors.black,
      }}>
      <Image
        source={
          isWinner
            ? require("../../assets/images/winningTrophy.png")
            : require("../../assets/images/losingTrophy.png")
        }
        style={{ height: 50, width: 60, marginTop: 50 }}
      />
      <View
        style={{
          flex: 1,
          justifyContent: "center",
        }}>
        <Text
          style={{
            fontFamily: Fonts.handwriting,
            fontSize: 50,
            color: Colors.green,
            textAlign: "center",
          }}>
          You {isWinner ? "Won" : "Lost"}!
        </Text>
        <Text
          style={{
            fontFamily: Fonts.handwriting,
            fontSize: 35,
            color: Colors.orange,
            textAlign: "center",
          }}>
          {requestRematch
            ? "You requested a rematch"
            : opponentRequestRematch
            ? "Your opponent requested a rematch"
            : ""}
        </Text>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
          }}>
          <AnimateNumber
            value={displayTarget}
            steps={Math.abs(rankChange / 2 + 10)}
            timing="easeOut"
            onFinish={() => {
              if (displayTarget != 0) {
                Animated.timing(changeOpacity, {
                  toValue: 0,
                  duration: 600,
                  easing: Easing.out(Easing.ease),
                  useNativeDriver: true,
                }).start();
              }
            }}
            renderContent={(displayValue: number) => {
              return (
                <Text
                  style={{
                    fontFamily: Fonts.handwriting,
                    fontSize: 35,
                    color: Colors.orange,
                    textAlign: "center",
                    position: "absolute",
                  }}>
                  Rating:{" "}
                  {shared.currentUser!.stats.rank + Math.trunc(displayValue)}
                </Text>
              );
            }}
          />
          <Animated.Text
            style={{
              fontFamily: Fonts.handwriting,
              fontSize: 35,
              color: rankChange >= 0 ? Colors.green : Colors.red,
              opacity: changeOpacity,
              position: "absolute",
              left: "100%",
            }}>
            {rankChange != 0 && (rankChange >= 0 ? "+" : "") + rankChange}
          </Animated.Text>
        </View>
      </View>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
        }}>
        <Button
          title="Rematch"
          font={Fonts.handwriting}
          backgroundColor={Colors.orange}
          onPress={() => {
            if (opponentRequestRematch) {
              rematch();
            } else {
              setRequestRematch(true);
            }
            connection.send("rematch");
          }}
        />
        <Button
          title="Quit"
          font={Fonts.handwriting}
          onPress={() => {
            game.quit();
            navigation.navigate("Friends");
          }}
        />
      </View>
      {isWinner && <ConfettiEffect />}
    </SafeAreaView>
  );
}
