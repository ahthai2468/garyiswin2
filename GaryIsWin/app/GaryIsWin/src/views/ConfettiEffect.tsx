import React from "react";
import { Dimensions } from "react-native";
import Confetti from "react-native-confetti-cannon";

import { Colors } from "../utils/Styles";

export default function ConfettiEffect() {
  let { width } = Dimensions.get("window");
  return (
    <Confetti
      count={100}
      explosionSpeed={400}
      fallSpeed={900}
      fadeOut
      colors={[Colors.blue, Colors.red, Colors.green, Colors.orange]}
      origin={{ x: width / 2, y: -20 }}
    />
  );
}
