import React, { useEffect, useState } from "react";
import { BackHandler, FlatList, SafeAreaView, Text, View } from "react-native";

import SegmentedControl from "@react-native-community/segmented-control";

import shared from "../Shared";
import { User } from "../types";
import { Colors, Fonts } from "../utils/Styles";
import Button from "../views/Button";

export default function Leaderboard({ navigation }: any) {
  let [friends, setFriends] = useState<User[]>([]);
  let [topPlayers, setTopPlayers] = useState<User[]>([]);
  const [leaderboardIdx, setLeaderboardIdx] = useState(0);

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", () => true);
    return () =>
      BackHandler.removeEventListener("hardwareBackPress", () => true);
  }, []);

  useEffect(() => {
    shared.socket.on("get_friends", (success: boolean, friends: User[]) => {
      if (success)
        setFriends(friends.sort((a, b) => b.stats.rank - a.stats.rank));
    });
    shared.socket.on("top_players", (success: boolean, topPlayers: User[]) => {
      if (success) setTopPlayers(topPlayers);
    });

    shared.socket.emit("get_friends");
    shared.socket.emit("top_players");
    return () => {
      shared.socket.off("get_friends");
      shared.socket.off("top_players");
    };
  }, []);

  function Row(user: User) {
    let { rank, wins, losses } = user.stats;
    let name = user.username;
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 16,
          borderRadius: 10,
          borderWidth: 0.5,
          borderColor: "white",
          marginVertical: 8,
          marginHorizontal: 16,
        }}>
        <Text
          style={{
            fontFamily: Fonts.handwriting,
            color: "white",
            alignSelf: "flex-start",
            fontSize: 30,
          }}>
          {rank}
        </Text>
        <Text
          style={{
            fontFamily: Fonts.handwriting,
            color: "white",
            alignSelf: "stretch",
            fontSize: 30,
          }}>
          {name}
        </Text>
        <View style={{ flexDirection: "row" }}>
          <Text
            style={{
              color: Colors.green,
              fontFamily: Fonts.handwriting,
              fontSize: 30,
            }}>
            {wins}
          </Text>
          <Text
            style={{
              color: "white",
              fontFamily: Fonts.handwriting,
              fontSize: 30,
            }}>
            —
          </Text>
          <Text
            style={{
              color: Colors.red,
              fontFamily: Fonts.handwriting,
              fontSize: 30,
            }}>
            {losses}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.black }}>
      <View
        testID="Leaderboard Page"
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
            fontSize: 40,
            fontFamily: Fonts.handwriting,
            color: Colors.orange,
            textAlign: "center",
          }}>
          Leaderboard
        </Text>
        <View style={{ flex: 1 }} />
      </View>
      <View style={{ alignSelf: "center", width: "80%", paddingBottom: 10 }}>
        <SegmentedControl
          values={["GLOBAL", "FRIENDS"]}
          selectedIndex={leaderboardIdx}
          onChange={(e) =>
            setLeaderboardIdx(e.nativeEvent.selectedSegmentIndex)
          }
        />
      </View>
      <FlatList
        data={leaderboardIdx == 0 ? topPlayers : friends}
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => Row(item)}
      />
    </SafeAreaView>
  );
}
