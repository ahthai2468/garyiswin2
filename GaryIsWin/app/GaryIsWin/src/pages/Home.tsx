import React, { useEffect } from "react";
import { BackHandler, Image, SafeAreaView } from "react-native";

import shared from "../Shared";
import { User } from "../types";
import { Colors, Fonts } from "../utils/Styles";
import Button from "../views/Button";

export default function Home({ navigation }: any) {
  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", () => true);
    return () =>
      BackHandler.removeEventListener("hardwareBackPress", () => true);
  }, []);

  useEffect(() => {
    shared.socket.on("whoami", (success: boolean, user: User) => {
      if (success) shared.currentUser = user;
    });
    shared.socket.emit("whoami");
    return () => {
      shared.socket.off("whoami");
    };
  }, []);

  return (
    <SafeAreaView
      testID="Home Page"
      style={{
        flex: 1,
        justifyContent: "center",
        backgroundColor: Colors.black,
      }}>
      <Image
        source={require("../../assets/images/gary_logo_still.png")}
        style={{ width: "100%", height: "20%" }}
      />
      <Button
        title="Friends"
        testID="Friends Page Button"
        font={Fonts.handwriting}
        onPress={() => navigation.navigate("Friends")}
      />
      <Button
        title="Profile"
        testID="Profile Page Button"
        font={Fonts.handwriting}
        onPress={() => {
          shared.socket.emit("whoami");
          navigation.navigate("Profile");
        }}
      />
      <Button
        title="Local Play"
        testID="Local Play Button"
        font={Fonts.handwriting}
        onPress={() =>
          navigation.navigate("Match", {
            isOnlineGame: false,
            tutorialNum: 0,
          })
        }
      />
      <Button
        title="Tutorial"
        testID="Tutorial Button"
        font={Fonts.handwriting}
        onPress={() => navigation.navigate("Tutorial")}
      />
      <Button
        title="Leaderboard"
        testID="Leaderboard Button"
        font={Fonts.handwriting}
        onPress={() => navigation.navigate("Leaderboard")}
      />
    </SafeAreaView>
  );
}
