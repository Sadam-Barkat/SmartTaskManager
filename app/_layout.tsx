import { Tabs } from "expo-router";

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        /* Top header */
        headerStyle: {
          backgroundColor: "#f8fafc",
          height: 70,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: "700",
          color: "#0f172a",
        },
        headerTitleAlign: "center",
        headerShadowVisible: false,

        /* 🔥 FIXED BOTTOM TAB BAR */
        tabBarStyle: {
          backgroundColor: "#ffffff",
          height: 80,              // 🔥 taller bar
          paddingBottom: 20,       // 🔥 safe-area space
          paddingTop: 10,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: "absolute",
          elevation: 12,
        },

        tabBarActiveTintColor: "#4f46e5",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Tasks" }} />
      <Tabs.Screen name="completed" options={{ title: "Completed" }} />
    </Tabs>
  );
}
