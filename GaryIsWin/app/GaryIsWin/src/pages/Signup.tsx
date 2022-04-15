import React, { useEffect, useState } from "react";
import {
  Alert, BackHandler, Image, Keyboard, SafeAreaView, TouchableWithoutFeedback,
  View
} from "react-native";

import { CommonActions } from "@react-navigation/native";

import shared from "../Shared";
import { Colors, Fonts } from "../utils/Styles";
import Button from "../views/Button";
import InputField from "../views/InputField";

export default function Login({ navigation }: any) {
  let [email, setEmail] = useState("");
  let [username, setUsername] = useState("");
  let [password, setPassword] = useState("");

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", () => true);
    return () =>
      BackHandler.removeEventListener("hardwareBackPress", () => true);
  }, []);

  useEffect(() => {
    shared.socket.on("signup", (success: boolean, message: any) => {
      if (success) {
        navigation.dispatch(CommonActions.goBack());
      } else {
        try {
          let errors = Object.keys(message.errors).map(
            (x) => message.errors[x]
          );
          Alert.alert("Signup Failed", errors.map((x) => x.message).join("\n"));
        } catch (e) {}
      }
    });

    return () => {
      shared.socket.off("signup");
    };
  }, []);

  const signup = () =>
    shared.socket.emit("signup", { email, username, password });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.black }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          testID="Sign Up Page"
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
            iosType="emailAddress"
            androidType="email"
            placeholder="Email"
            onText={setEmail}
          />
          <InputField
            iosType="username"
            androidType="username"
            placeholder="Username"
            onText={setUsername}
          />
          <InputField
            secure
            iosType="newPassword"
            androidType="password"
            placeholder="Password"
            onText={setPassword}
          />
          <View style={{ flexDirection: "column", justifyContent: "center" }}>
            <Button
              title="Sign Up"
              image={require("../../assets/images/sign_up.png")}
              height={60}
              width={175}
              onPress={signup}
            />
            <Button
              title="Back"
              image={require("../../assets/images/back_green.png")}
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
