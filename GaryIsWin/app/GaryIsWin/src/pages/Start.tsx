import React, { useEffect } from "react";
import { BackHandler, Image, SafeAreaView, View } from "react-native";

import { Colors } from "../utils/Styles";
import Button from "../views/Button";

export default function Start({ navigation }: any) {
  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", () => true);
    return () =>
      BackHandler.removeEventListener("hardwareBackPress", () => true);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.black }}>
      <View
        testID="Start Page"
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
        <View style={{ height: 60 }} />
        <View style={{ flexDirection: "column", justifyContent: "center" }}>
          <Button
            title="Login"
            testID="Login Page Button"
            image={require("../../assets/images/sign_in.png")}
            height={60}
            width={175}
            onPress={() => navigation.navigate("Login")}
          />
          <Button
            title="Sign Up"
            testID="Sign Up Page Button"
            image={require("../../assets/images/sign_up.png")}
            height={60}
            width={175}
            onPress={() => navigation.navigate("Sign Up")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
