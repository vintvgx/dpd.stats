import React, { useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import { AppDispatch, useAppSelector } from "../redux/store";
import IssueCard from "./IssueCard";
import format from "pretty-format";

export const IssuesScreen = () => {
  const { data, loading, error } = useAppSelector((state) => state.issues);

  // useEffect(() => {
  //   console.log("Issues data:", format(data));
  // }, [data]);

  if (loading)
    return (
      <View style={styles.container}>
        <View style={styles.center_of_screen}>
          <ActivityIndicator />
        </View>
      </View>
    );

  return (
    <View style={styles.container}>
      <ScrollView>
        {data.issues.map((issue, index) => (
          <IssueCard
            key={index}
            issue={issue}
            onPress={() => console.log("Pressed issue", issue)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  center_of_screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
