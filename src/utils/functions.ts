import axios from "axios";
import format, { format as prettyFormat } from "pretty-format";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import firebase from "firebase/compat/app";
import "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA1Ioud4rwt4sIYrX-KGGfV3sOiqocxU3Y",
  authDomain: "stats-a55dd.firebaseapp.com",
  projectId: "stats-a55dd",
  storageBucket: "stats-a55dd.appspot.com",
  messagingSenderId: "1059658323548",
  appId: "1:1059658323548:web:e7b28c8be3a4794219f899",
  measurementId: "G-V6NKP90PMG",
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: "605ca6ac-8939-440c-baa7-0307f5f8d01d",
      })
    ).data;
    // console.log(token);

    try {
      const docRef = await addDoc(collection(db, "user"), {
        expoPushToken: token,
      });
      // console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  } else {
    alert("Must use physical device for Push Notifications");
  }

  return token;
}

export const fetchLocationForIP = async (ipAddress: string) => {
  console.log("FETCH LOCATION");
  try {
    const response = await fetch(`https://api.radar.io/v1/geocode/ip`, {
      method: "GET",
      headers: {
        Authorization: "prj_live_pk_feab46e3a831493a7a49d3294834b276bf5fd7b1",
      },
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    // Handle non-OK responses here
  } catch (error) {
    console.error("Failed to fetch location for IP:", error);
    // Handle errors, such as network issues
  }
};
