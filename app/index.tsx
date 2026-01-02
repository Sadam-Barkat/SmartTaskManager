import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Platform,
} from "react-native";
import { useState, useEffect } from "react";
import * as Notifications from "expo-notifications";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

/* 🔔 Notification handler (mobile only) */
if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

type Task = {
  id: string;
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  completed: boolean;
  reminderMinutes: number;
};

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] =
    useState<"High" | "Medium" | "Low">("Medium");
  const [reminderMinutes, setReminderMinutes] = useState("5");

  useEffect(() => {
    if (Platform.OS !== "web") {
      Notifications.requestPermissionsAsync();
    }
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const snapshot = await getDocs(collection(db, "tasks"));
    const loadedTasks: Task[] = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<Task, "id">),
    }));
    setTasks(loadedTasks.filter((t) => !t.completed));
  };

  /* 🔔 Schedule reminder (TYPE-SAFE FIX) */
  const scheduleReminder = async (minutes: number, title: string) => {
    if (Platform.OS === "web") return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Task Reminder ⏰",
        body: title,
      },
      trigger: {
        seconds: minutes * 60,
        repeats: false,
      } as Notifications.TimeIntervalTriggerInput,
    });
  };

  const saveTask = async () => {
    if (!title.trim()) return;

    await addDoc(collection(db, "tasks"), {
      title,
      description,
      priority,
      completed: false,
      reminderMinutes: Number(reminderMinutes),
    });

    await scheduleReminder(Number(reminderMinutes), title);

    setTitle("");
    setDescription("");
    setPriority("Medium");
    setReminderMinutes("5");
    setModalVisible(false);
    fetchTasks();
  };

  const completeTask = async (id: string) => {
    await updateDoc(doc(db, "tasks", id), { completed: true });
    fetchTasks();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerBox}>
        <Text style={styles.appName}>SmartTask</Text>
        <Text style={styles.tagline}>Manage your tasks smartly</Text>
      </View>

      {/* Task List */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 180 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc}>{item.description}</Text>
            <Text style={styles.reminder}>
              ⏰ Reminder in {item.reminderMinutes} minutes
            </Text>

            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => completeTask(item.id)}
            >
              <Text style={styles.doneText}>Mark as Done</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Floating Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Add New Task</Text>

            <Text style={styles.label}>Task Title</Text>
            <TextInput
              placeholder="Enter task title"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
            />

            <Text style={styles.label}>Task Description</Text>
            <TextInput
              placeholder="Enter task description"
              value={description}
              onChangeText={setDescription}
              style={styles.input}
            />

            <Text style={styles.label}>Reminder Time (minutes)</Text>
            <TextInput
              placeholder="e.g. 5"
              value={reminderMinutes}
              onChangeText={setReminderMinutes}
              keyboardType="numeric"
              style={styles.input}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={saveTask}>
              <Text style={styles.saveText}>Save Task</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* 🎨 Styles */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef2ff",
    padding: 16,
  },
  headerBox: {
    backgroundColor: "#4f46e5",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  tagline: {
    fontSize: 13,
    color: "#c7d2fe",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardDesc: {
    fontSize: 14,
    marginVertical: 6,
    color: "#374151",
  },
  reminder: {
    fontSize: 12,
    color: "#2563eb",
    marginBottom: 6,
  },
  doneBtn: {
    backgroundColor: "#4f46e5",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  doneText: {
    color: "#fff",
    fontWeight: "bold",
  },
  fab: {
    position: "absolute",
    bottom: 130,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#4f46e5",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: "#fff",
  },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    padding: 20,
    width: "90%",
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    color: "#111827",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#f9fafb",
  },
  saveBtn: {
    backgroundColor: "#4f46e5",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelText: {
    textAlign: "center",
    marginTop: 10,
    color: "#6b7280",
  },
});
