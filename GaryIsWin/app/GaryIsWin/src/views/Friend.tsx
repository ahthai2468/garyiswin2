import moment from "moment";
import React from "react";
import { Image, Text, View } from "react-native";

import shared from "../Shared";
import { User } from "../types";
import { Colors, Fonts } from "../utils/Styles";
import { AvatarShapeImage } from "./AvatarImage";
import Button, { ButtonProps } from "./Button";

export default function Friend(
  user: User,
  editing: boolean,
  showBlocked: boolean,
  navigation: any,
  tick: number,
  searching: boolean,
  noInteract = false
) {
  let { rank, wins, losses } = user.stats;
  let sideButtons: ButtonProps[] = [];

  if (noInteract) {
  } else if (searching) {
    sideButtons = [
      {
        title: "Add",
        backgroundColor: Colors.orange,
        onPress: () => {
          shared.socket.emit("add_friend", user.userId);
          shared.socket.emit("get_friends");
        },
      },
    ];
  } else if (editing) {
    sideButtons = [
      {
        title: "Remove",
        backgroundColor: Colors.orange,
        onPress: () => {
          shared.socket.emit("remove_friend", user.userId);
          shared.socket.emit("get_friends");
        },
      },
      {
        title: "Block",
        backgroundColor: Colors.red,
        onPress: () => {
          shared.socket.emit("block_user", user.userId);
          shared.socket.emit("get_friends");
          shared.socket.emit("get_blocked_users");
        },
      },
    ];
  } else if (showBlocked) {
    sideButtons = [
      {
        title: "Unblock",
        backgroundColor: Colors.red,
        onPress: () => {
          shared.socket.emit("unblock_user", user.userId);
          shared.socket.emit("get_blocked_users");
        },
      },
    ];
  } else if (!editing && user.online) {
    sideButtons = [
      {
        title: "Challenge",
        backgroundColor: Colors.green,
        onPress: () => {
          navigation.navigate("WaitingPage", { isRandomMatch: false });
          shared.socket.emit("challenge_user", user.userId);
        },
      },
    ];
  }

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
      }}>
      <View
        style={{
          width: "70%",
          flexDirection: "row",
          justifyContent: "flex-start",
          paddingRight: 20,
        }}>
        <Image
          source={AvatarShapeImage(user.avatar, tick)}
          fadeDuration={0}
          resizeMode="cover"
          style={{
            width: 70,
            height: 70,
            alignSelf: "center",
          }}
        />
        <View style={{ padding: 5, paddingLeft: 15 }}>
          <Text
            testID={`is ${user.online ? "online" : "offline"}`}
            style={{
              color: Colors.orange,
              fontSize: 26,
              fontFamily: Fonts.handwriting,
              letterSpacing: 2,
            }}>
            {user.username}
          </Text>
          <Text
            style={{
              color: "white",
              fontSize: 16,
              fontFamily: Fonts.handwriting,
              letterSpacing: 2,
            }}>
            Rating: {rank}
          </Text>
          <Text
            style={{
              color: "white",
              fontSize: 16,
              fontFamily: Fonts.handwriting,
              letterSpacing: 2,
            }}>
            Wins: {wins}
          </Text>
          <Text
            style={{
              color: "white",
              fontSize: 16,
              fontFamily: Fonts.handwriting,
              letterSpacing: 2,
            }}>
            Losses: {losses}
          </Text>
        </View>
      </View>
      <View style={{ justifyContent: "center", paddingRight: 30 }}>
        {sideButtons.length > 0 ? (
          sideButtons.map((props, idx) => {
            return (
              <Button
                {...props}
                key={idx}
                font={Fonts.handwriting}
                padding={5}
              />
            );
          })
        ) : (
          <>
            <Text
              style={{
                color: "white",
                fontSize: 16,
                fontFamily: Fonts.handwriting,
                letterSpacing: 2,
                textAlign: "left",
              }}>
              Last Online
            </Text>
            <Text
              adjustsFontSizeToFit
              style={{
                color: "white",
                fontSize: 16,
                fontFamily: Fonts.handwriting,
                letterSpacing: 2,
                textAlign: "left",
              }}>
              {moment(user.stats.lastLogin).from(new Date())}
            </Text>
          </>
        )}
      </View>
    </View>
  );
}
