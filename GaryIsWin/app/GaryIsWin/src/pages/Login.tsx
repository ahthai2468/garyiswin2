import React, { useEffect, useState } from "react";
import {
  BackHandler, Image, Keyboard, SafeAreaView, TouchableWithoutFeedback, View
} from "react-native";

import AsyncStorage from "@react-native-community/async-storage";
import { CommonActions } from "@react-navigation/native";

import shared from "../Shared";
import { Colors, Fonts } from "../utils/Styles";
import Button from "../views/Button";
import InputField from "../views/InputField";

export default function Login({ navigation }: any) {
  let [username, setUsername] = useState("");
  let [password, setPassword] = useState("");

  const login = () => {
    AsyncStorage.multiSet([
      ["username", username],
      ["password", password],
    ]);
    shared.socket.emit("login", { username, password });
  };

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", () => true);
    return () =>
      BackHandler.removeEventListener("hardwareBackPress", () => true);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.black }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          testID="Login Page"
          style={{
            flex: 0.8,
            flexDirection: "column",
            justifyContent: "center",
            alignContent: "center",
          }}>
          <Image
            source={require("../../assets/images/gary_logo_still.png")}
            style={{ width: "100%", height: "20%" }}
          />
          <InputField
            testID="username"
            iosType="username"
            androidType="username"
            placeholder="Username"
            onText={setUsername}
          />
          <InputField
            secure
            testID="password"
            iosType="password"
            androidType="password"
            placeholder="Password"
            onText={setPassword}
          />
          <View style={{ flexDirection: "column", justifyContent: "center" }}>
            <Button
              title="Login"
              testID="Login Button"
              image={require("../../assets/images/sign_in.png")}
              height={60}
              width={175}
              onPress={login}
            />
            <Button
              title="Back"
              testID="Back Button"
              image={require("../../assets/images/back_blue.png")}
              height={60}
              width={175}
              onPress={() => navigation.dispatch(CommonActions.goBack())}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
