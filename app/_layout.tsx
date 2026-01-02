import { Tabs } from "expo-router";
import { Platform } from "react-native";

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          height: Platform.OS === "android" ? 90 : 70,
          paddingBottom: Platform.OS === "android" ? 30 : 12,
          paddingTop: 10,
          backgroundColor: "#ffffff",
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          position: "absolute",
        },

        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: "700",
        },

        tabBarActiveTintColor: "#4f46e5",
        tabBarInactiveTintColor: "#9ca3af",
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Tasks" }} />
      <Tabs.Screen name="completed" options={{ title: "Completed" }} />
    </Tabs>
  );
}
