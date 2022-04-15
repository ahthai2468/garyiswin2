import React, { useEffect, useState } from "react";
import {
  Alert, BackHandler, SafeAreaView, SectionList, Text, View
} from "react-native";
import { RTCSessionDescriptionType } from "react-native-webrtc";

import shared from "../Shared";
import { User } from "../types";
import { Colors, Fonts } from "../utils/Styles";
import useInterval from "../utils/useInterval";
import Button from "../views/Button";
import Friend from "../views/Friend";

export default function Friends({ navigation }: any) {
  let [editing, setEditing] = useState(false);
  let [showBlocked, setShowBlocked] = useState(false);
  let [friends, setFriends] = useState<User[]>([]);
  let [blocked, setBlocked] = useState<User[]>([]);

  let [tick, setTick] = useState(0);
  useInterval(() => setTick((x) => x + 1), shared.tickRate);

  let listData = showBlocked
    ? [
        { title: "ONLINE:", data: blocked.filter((x) => x.online) },
        { title: "OFFLINE:", data: blocked.filter((x) => !x.online) },
      ]
    : [
        { title: "ONLINE:", data: friends.filter((x) => x.online) },
        { title: "OFFLINE:", data: friends.filter((x) => !x.online) },
      ];

  let onFocus = () => {
    shared.socket.emit("get_friends");
    shared.socket.emit("whoami");
    shared.socket.emit("match_dequeue");
  };

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", () => true);
    return () =>
      BackHandler.removeEventListener("hardwareBackPress", () => true);
  }, []);

  useEffect(() => {
    navigation.addListener("focus", onFocus);
    return () => navigation.removeListener("focus", onFocus);
  }, [navigation]);

  useEffect(() => {
    shared.socket.on("get_friends", (success: boolean, friends: User[]) => {
      if (success) setFriends(friends);
    });
    shared.socket.on(
      "get_blocked_users",
      (success: boolean, blocked: User[]) => {
        if (success) setBlocked(blocked);
      }
    );
    shared.socket.on(
      "challenge_user",
      (success: boolean, opponent: User, offer: RTCSessionDescriptionType) => {
        if (success)
          navigation.navigate("Match", {
            isOnlineMatch: true,
            opponent,
            offer,
          });
      }
    );
    shared.socket.on("challenge_received", (opponent: User) => {
      Alert.alert(
        "Challenge Received",
        `You have been challenged by ${opponent.username}`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Accept",
            onPress: () =>
              navigation.navigate("Match", { isOnlineMatch: true, opponent }),
          },
        ],
        { cancelable: false }
      );
    });

    shared.socket.emit("whoami");
    shared.socket.emit("get_friends");
    shared.socket.emit("get_blocked_users");
    return () => {
      shared.socket.off("get_friends");
      shared.socket.off("challenge_user");
      shared.socket.off("challenge_received");
      shared.socket.off("get_blocked_users");
    };
  }, []);

  return (
    <SafeAreaView
      testID="Friends Page"
      style={{
        flex: 1,
        backgroundColor: Colors.black,
      }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          height: 45,
        }}>
        {!editing && !showBlocked && (
          <View style={{ flex: 0.8 }}>
            <Button
              image={require("../../assets/images/backButton.png")}
              height={30}
              width={46}
              onPress={() => navigation.navigate("Home")}
            />
          </View>
        )}
        <Text
          style={{
            flex: 1,
            fontSize: 40,
            textAlign: "center",
            fontFamily: Fonts.handwriting,
            color: Colors.orange,
          }}>
          {showBlocked ? "Blocked Players" : "Friends"}
        </Text>
        {!editing && !showBlocked && (
          <View style={{ flex: 0.8 }}>
            <Button
              height={40}
              width={40}
              image={require("../../assets/images/addFriend.png")}
              onPress={() => navigation.navigate("Search")}
            />
          </View>
        )}
      </View>
      {editing || showBlocked ? (
        (editing && (
          <Button
            title="Done Editing"
            font={Fonts.handwriting}
            onPress={() => setEditing(false)}
          />
        )) ||
        (showBlocked && (
          <Button
            title="View Friends List"
            font={Fonts.handwriting}
            onPress={() => setShowBlocked(false)}
          />
        ))
      ) : (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
          }}>
          <Button
            title="Edit Friends"
            font={Fonts.handwriting}
            onPress={() => setEditing(true)}
          />
          <Button
            title="Blocked Players"
            font={Fonts.handwriting}
            onPress={() => {
              setShowBlocked(true);
              setEditing(false);
            }}
          />
        </View>
      )}
      <SectionList
        sections={listData}
        keyExtractor={(item) => item.userId}
        renderSectionHeader={({ section: { title } }) => {
          return (
            <Text
              style={{
                paddingLeft: 20,
                marginBottom: 5,
                fontSize: 20,
                fontFamily: Fonts.handwriting,
                color: "white",
                backgroundColor: "gray",
                letterSpacing: 2,
              }}>
              {title}
            </Text>
          );
        }}
        renderItem={({ item }) =>
          Friend(item, editing, showBlocked, navigation, tick, false)
        }
      />
      <Button
        title="Random Play"
        testID="Random Play Button"
        font={Fonts.handwriting}
        onPress={() =>
          navigation.navigate("WaitingPage", { isRandomMatch: true })
        }
      />
    </SafeAreaView>
  );
}
