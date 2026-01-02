import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from "react-native";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

// 🔹 Task type
type Task = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: "High" | "Medium" | "Low";
};

export default function CompletedScreen() {
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);

  // 🔹 Load completed tasks
  useEffect(() => {
    fetchCompletedTasks();
  }, []);

  const fetchCompletedTasks = async () => {
    const snapshot = await getDocs(collection(db, "tasks"));
    const tasks: Task[] = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<Task, "id">),
    }));

    setCompletedTasks(tasks.filter((t) => t.completed));
  };

  return (
    <View style={styles.container}>
      {/* 🔷 Header */}
      <View style={styles.headerBox}>
        <Text style={styles.headerTitle}>Completed Tasks</Text>
        <Text style={styles.headerSub}>
          Tasks you have successfully finished 🎉
        </Text>
      </View>

      {/* 🔹 Content */}
      {completedTasks.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>
            No completed tasks yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={completedTasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 30 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text
                  style={[
                    styles.priorityBadge,
                    item.priority === "High"
                      ? styles.high
                      : item.priority === "Medium"
                      ? styles.medium
                      : styles.low,
                  ]}
                >
                  {item.priority}
                </Text>
              </View>

              <Text style={styles.cardDesc}>
                {item.description || "No description"}
              </Text>

              <Text style={styles.doneLabel}>✔ Completed</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef2ff",
    padding: 16,
  },

  /* Header */
  headerBox: {
    backgroundColor: "#16a34a",
    borderRadius: 18,
    paddingVertical: 22,
    alignItems: "center",
    marginBottom: 18,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#ffffff",
  },
  headerSub: {
    fontSize: 13,
    color: "#dcfce7",
    marginTop: 4,
  },

  /* Empty State */
  emptyBox: {
    marginTop: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
  },

  /* Card */
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  cardDesc: {
    fontSize: 14,
    color: "#4b5563",
    marginVertical: 8,
  },

  /* Priority */
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    color: "#ffffff",
    fontSize: 12,
  },
  high: { backgroundColor: "#dc2626" },
  medium: { backgroundColor: "#f59e0b" },
  low: { backgroundColor: "#16a34a" },

  doneLabel: {
    marginTop: 6,
    fontSize: 13,
    color: "#16a34a",
    fontWeight: "bold",
  },
});
