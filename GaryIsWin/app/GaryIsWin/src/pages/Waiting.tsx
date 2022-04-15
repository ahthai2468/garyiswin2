import React, { useEffect, useState } from "react";
import { BackHandler, Image, SafeAreaView, Text } from "react-native";

import shared from "../Shared";
import { User } from "../types";
import { AvatarShapeImages } from "../utils/Assets";
import { Colors, Fonts } from "../utils/Styles";
import useInterval from "../utils/useInterval";
import Button from "../views/Button";

const tickRate = 300;

export default function Waiting({ navigation, route }: any) {
  let { isRandomMatch } = route.params;
  let [tick, setTick] = useState(0);
  useInterval(() => setTick((x) => x + 1), tickRate);

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", () => true);
    return () =>
      BackHandler.removeEventListener("hardwareBackPress", () => true);
  }, []);

  if (isRandomMatch) {
    shared.socket.emit("match_random");
    shared.socket.on("match_initiate", (opponent: User) => {
      navigation.navigate("Match", { isOnlineMatch: true, opponent });
    });
  }

  return (
    <SafeAreaView
      testID="Waiting Page"
      style={{
        flex: 1,
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
        backgroundColor: Colors.black,
      }}>
      <Text
        style={{
          fontSize: 40,
          fontFamily: Fonts.handwriting,
          color: Colors.green,
          paddingTop: 30,
        }}>
        {isRandomMatch ? "Entered Queue!" : "Challenged Friend!"}
      </Text>
      <Text
        style={{
          fontSize: 60,
          fontFamily: Fonts.handwriting,
          color: Colors.orange,
          paddingTop: 30,
        }}>
        Waiting for {"\n"}
        {isRandomMatch ? "Opponent " : "Friend "}
        {".".repeat(tick % 4)}
      </Text>
      <Image
        source={AvatarShapeImages[shared.currentUser?.avatar ?? 0][tick % 3]}
        resizeMode="cover"
        style={{ width: "20%", height: "10%" }}
      />
      <Button
        image={require("../../assets/images/backButton.png")}
        height={30}
        width={46}
        onPress={() => {
          navigation.navigate("Friends");
          if (isRandomMatch) {
            shared.socket.emit("match_dequeue");
          }
        }}
      />
    </SafeAreaView>
  );
}
