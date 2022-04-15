import { Platform } from "react-native";

export const Colors = {
  green: "#D6F060",
  orange: "#E3B752",
  blue: "#719CE8",
  black: "#3B3A38",
  red: "#FF6961",
};

export const Fonts = {
  handwriting: Platform.select({
    ios: "AnnieUseYourTelescope-regular",
    android: "annie-use-your-telescope-regular",
  }),
};
