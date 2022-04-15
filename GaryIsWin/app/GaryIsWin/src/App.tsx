import React, { useEffect, useState } from "react";
import { Alert, AppState, AppStateStatus } from "react-native";

import AsyncStorage from "@react-native-community/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import Friends from "./pages/Friends";
import Home from "./pages/Home";
import Leaderboard from "./pages/Leaderboard";
import Login from "./pages/Login";
import Match from "./pages/Match";
import PostGame from "./pages/PostMatch";
import Profile from "./pages/Profile";
import Search from "./pages/Search";
import Signup from "./pages/Signup";
import Start from "./pages/Start";
import Tutorial from "./pages/Tutorial";
import WaitingPage from "./pages/Waiting";
import shared from "./Shared";

const Stack = createStackNavigator();

export default function App() {
  let [isLoggedIn, setLoggedIn] = useState(false);
  let [appState, setAppState] = useState(AppState.currentState);

  let appStateChanged = (nextState: AppStateStatus) => {
    if (appState.match(/inactive|background/) && nextState === "active") {
      shared.socket.emit("auth_status");
    }
    setAppState(nextState);
  };

  let tryLogin = () => {
    if (isLoggedIn) return;
    AsyncStorage.multiGet(["username", "password"])
      .then((kvp: any) => {
        let username: string = kvp[0][1];
        let password: string = kvp[1][1];
        if (username.length > 0)
          shared.socket.emit("login", { username, password });
      })
      .catch(() => {});
  };

  useEffect(() => {
    shared.socket.on("auth_status", setLoggedIn);
    shared.socket.on("auth_status", tryLogin);
    shared.socket.on("connect", () => {
      shared.socket.emit("auth_status");
    });
    AppState.addEventListener("change", appStateChanged);

    shared.socket.on("login", (success: boolean) => {
      setLoggedIn(success);
      if (!success)
        Alert.alert(
          "Error",
          "Login failed, please try again. You may have to choose a different username."
        );
    });
    tryLogin();

    return () => {
      shared.socket.off("login");
      shared.socket.off("auth_status");
      shared.socket.off("connect");
      AppState.removeEventListener("change", appStateChanged);
    };
  }, []);

  return (
    <shared.authContext.Provider value={{ setLoggedIn }}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{ headerShown: false, gestureEnabled: false }}>
          {isLoggedIn ? (
            <>
              <Stack.Screen name="Home" component={Home} />
              <Stack.Screen name="Search" component={Search} />
              <Stack.Screen name="Match" component={Match} />
              <Stack.Screen name="Tutorial" component={Tutorial} />
              <Stack.Screen name="Friends" component={Friends} />
              <Stack.Screen name="Profile" component={Profile} />
              <Stack.Screen name="Leaderboard" component={Leaderboard} />
              <Stack.Screen name="WaitingPage" component={WaitingPage} />
              <Stack.Screen name="PostGame" component={PostGame} />
            </>
          ) : (
            <>
              <Stack.Screen name="Start" component={Start} />
              <Stack.Screen name="Login" component={Login} />
              <Stack.Screen name="Sign Up" component={Signup} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </shared.authContext.Provider>
  );
}
