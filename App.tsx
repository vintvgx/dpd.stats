// App.tsx
import React, { useState, useEffect } from "react";
import { View, Text, Animated, SafeAreaView } from "react-native";
import AppNavigation from "./src/navigation/Navigation";
import { StatusBar } from "expo-status-bar";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "./src/utils/functions";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [isSplashVisible, setSplashVisible] = useState(true);
  const fadeAnim = new Animated.Value(1);
  // const [expoPushToken, setExpoPushToken] = useState<string | undefined>("");

  // useEffect(() => {
  //   registerForPushNotificationsAsync()
  //     .then((token: string | undefined) => {
  //       console.log(token);
  //       setExpoPushToken(token);
  //     })
  //     .catch((err) => console.log(err));
  // }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 3000,
      useNativeDriver: true,
    }).start(() => setSplashVisible(false));
  }, []);

  if (isSplashVisible) {
    return (
      <Animated.View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          opacity: fadeAnim,
        }}>
        <Text style={{ fontSize: 24 }}>DPD.STATS</Text>
      </Animated.View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar style="light" />
      <AppNavigation />
    </View>
  );
}
