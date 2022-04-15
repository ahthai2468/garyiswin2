import React from "react";
import { TextInput, TextInputAndroidProps, TextInputIOSProps } from "react-native";

type InputFieldProps = {
  androidType: TextInputAndroidProps["autoCompleteType"];
  iosType: TextInputIOSProps["textContentType"];
  placeholder: string;
  placeholderColor?: string;
  onText: (text: string) => void;
  secure?: boolean;
  testID?: string;
};

export default function InputField(props: InputFieldProps) {
  return (
    <TextInput
      testID={props.testID}
      style={{
        fontSize: 20,
        color: "white",
        borderBottomWidth: 1,
        alignSelf: "center",
        width: "80%",
        padding: 10,
      }}
      editable
      autoCorrect={false}
      autoCapitalize={"none"}
      autoCompleteType={props.androidType}
      textContentType={props.iosType}
      placeholder={props.placeholder}
      placeholderTextColor={props.placeholderColor ?? "gray"}
      onChangeText={props.onText}
      secureTextEntry={props.secure ?? false}
    />
  );
}
