import React, { useContext, useEffect, useState } from "react";
import { BackHandler, Image, SafeAreaView, Text, View } from "react-native";
import { changeIcon } from "react-native-change-icon";

import AsyncStorage from "@react-native-community/async-storage";

import shared from "../Shared";
import { AvatarShapeImages, AvatarShapeNames } from "../utils/Assets";
import { Colors, Fonts } from "../utils/Styles";
import useInterval from "../utils/useInterval";
import { AvatarShapeImage } from "../views/AvatarImage";
import Button from "../views/Button";

export default function Profile({ navigation }: any) {
  let { setLoggedIn } = useContext(shared.authContext);
  const [avatarIdx, setAvatarIdx] = useState(shared.currentUser?.avatar ?? 0);

  let [tick, setTick] = useState(0);
  useInterval(() => setTick((x) => x + 1), shared.tickRate);

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", () => true);
    return () =>
      BackHandler.removeEventListener("hardwareBackPress", () => true);
  }, []);

  useEffect(() => {
    shared.socket.emit("set_avatar", avatarIdx);
    if (shared.currentUser !== undefined) shared.currentUser.avatar = avatarIdx;
  }, [avatarIdx]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.black }}>
      <View
        testID="Profile Page"
        style={{
          flexDirection: "row",
          alignItems: "center",
          maxHeight: 100,
        }}>
        <View style={{ flex: 1 }}>
          <Button
            image={require("../../assets/images/backButton.png")}
            height={30}
            width={46}
            onPress={() => navigation.navigate("Home")}
          />
        </View>
        <Text
          style={{
            flex: 1,
            fontSize: 40,
            fontFamily: Fonts.handwriting,
            color: Colors.orange,
            textAlign: "center",
          }}>
          Profile
        </Text>
        <View style={{ flex: 1 }} />
      </View>
      <View
        style={{
          flex: 1,
          justifyContent: "space-evenly",
          alignItems: "center",
          backgroundColor: Colors.black,
        }}>
        <Text
          adjustsFontSizeToFit
          style={{
            fontFamily: Fonts.handwriting,
            color: "white",
            fontSize: 50,
            alignSelf: "center",
          }}>
          {shared.currentUser?.username}
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>
          <Button
            title="<"
            font={Fonts.handwriting}
            onPress={() =>
              setAvatarIdx(
                (i) =>
                  (i - 1 + AvatarShapeImages.length) % AvatarShapeImages.length
              )
            }
          />
          <Image
            source={AvatarShapeImage(avatarIdx, tick)}
            fadeDuration={0}
            resizeMode="contain"
            style={{
              width: 70,
              height: 70,
            }}
          />
          <Button
            title=">"
            font={Fonts.handwriting}
            onPress={() =>
              setAvatarIdx((i) => (i + 1) % AvatarShapeImages.length)
            }
          />
        </View>
        <View style={{ alignItems: "center" }}>
          <Text
            style={{
              fontFamily: Fonts.handwriting,
              color: "white",
              fontSize: 30,
            }}>
            Rating: {shared.currentUser?.stats.rank}
          </Text>
          <Text
            style={{
              fontFamily: Fonts.handwriting,
              color: Colors.green,
              fontSize: 30,
            }}>
            Wins: {shared.currentUser?.stats.wins}
          </Text>
          <Text
            style={{
              fontFamily: Fonts.handwriting,
              color: Colors.red,
              fontSize: 30,
            }}>
            Losses: {shared.currentUser?.stats.losses}
          </Text>
        </View>
        <View>
          <Button
            title="Set App Icon"
            testID="Set App Icon"
            font={Fonts.handwriting}
            padding={10}
            onPress={() => changeIcon(AvatarShapeNames[avatarIdx])}
          />
          <Button
            title="Sign Out"
            testID="Sign Out Button"
            font={Fonts.handwriting}
            backgroundColor={Colors.red}
            padding={10}
            onPress={() => {
              AsyncStorage.multiSet([
                ["username", ""],
                ["password", ""],
              ]);
              shared.socket.emit("sign_out");
              shared.currentUser = undefined;
              setLoggedIn(false);
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
