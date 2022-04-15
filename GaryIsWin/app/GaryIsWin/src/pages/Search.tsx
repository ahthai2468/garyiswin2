import React, { useEffect, useState } from "react";
import { BackHandler, FlatList, SafeAreaView, Text, View } from "react-native";

import shared from "../Shared";
import { User } from "../types";
import { Colors, Fonts } from "../utils/Styles";
import useInterval from "../utils/useInterval";
import Button from "../views/Button";
import Friend from "../views/Friend";
import InputField from "../views/InputField";

export default function Search({ navigation }: any) {
  let [searchResults, setSearchResults] = useState<User[]>([]);

  let [tick, setTick] = useState(0);
  useInterval(() => setTick((x) => x + 1), shared.tickRate);

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", () => true);
    return () =>
      BackHandler.removeEventListener("hardwareBackPress", () => true);
  }, []);

  useEffect(() => {
    shared.socket.on("find_users", (success: boolean, results: User[]) => {
      if (success) setSearchResults(results);
    });
    return () => {
      shared.socket.off("find_users");
    };
  }, []);

  return (
    <SafeAreaView
      testID="Search Page"
      style={{
        flex: 1,
        backgroundColor: Colors.black,
      }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          height: 50,
        }}>
        <View style={{ flex: 1 }}>
          <Button
            image={require("../../assets/images/backButton.png")}
            height={30}
            width={46}
            onPress={() => navigation.navigate("Friends")}
          />
        </View>
        <Text
          style={{
            flex: 1,
            fontSize: 40,
            fontFamily: Fonts.handwriting,
            textAlign: "center",
            color: Colors.orange,
          }}>
          Search
        </Text>
        <View style={{ flex: 1 }} />
      </View>
      <InputField
        androidType="username"
        iosType="username"
        placeholder="Username"
        onText={(query: string) => shared.socket.emit("find_users", query)}
      />
      <Text
        style={{
          fontSize: 34,
          color: "white",
          textAlign: "center",
          fontFamily: Fonts.handwriting,
          paddingTop: 40,
        }}>
        Results
      </Text>
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) =>
          Friend(item, false, false, navigation, tick, true)
        }
      />
    </SafeAreaView>
  );
}
