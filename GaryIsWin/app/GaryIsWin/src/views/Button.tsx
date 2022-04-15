import React from "react";
import {
  GestureResponderEvent, Image, Text, TouchableOpacity, View
} from "react-native";
import Haptics from "react-native-haptic-feedback";

import { Colors } from "../utils/Styles";

export interface ButtonProps {
  image?: any;
  height?: number;
  width?: number;

  title?: string;
  color?: string;
  backgroundColor?: string;

  font?: string;
  fontSize?: number;
  padding?: number;

  testID?: string;
  disabled?: boolean;
  onPress?: ((event: GestureResponderEvent) => void) | undefined;
}

export default function Button(props: ButtonProps) {
  let borderProps = props.disabled ? { backgroundColor: "gray" } : {};
  let onPress = props.disabled ? undefined : props.onPress;
  return (
    <View
      style={{
        padding: props.padding ?? 20,
        alignItems: "center",
        borderRadius: props.image === undefined ? 15 : 0,
      }}>
      <TouchableOpacity
        testID={props.testID}
        onPress={(e) => {
          onPress && onPress(e);
          Haptics.trigger("impactMedium");
        }}>
        {props.image === undefined ? (
          <Text
            style={{
              borderRadius: 15,
              padding: 5,
              paddingHorizontal: 10,
              overflow: "hidden",
              textAlign: "center",
              fontFamily: props.font,
              fontSize: props.fontSize ?? 24,
              letterSpacing: 1,
              backgroundColor: props.backgroundColor ?? Colors.blue,
              color: props.color,
              ...borderProps,
            }}>
            {props.title}
          </Text>
        ) : (
          <Image
            style={{ height: props.height, width: props.width }}
            source={props.image}
          />
        )}
      </TouchableOpacity>
    </View>
  );
}
