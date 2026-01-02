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

/* Notification handler (safe) */
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
  completed: boolean;
  reminderMinutes: number;
};

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reminderMinutes, setReminderMinutes] = useState("5");

  useEffect(() => {
    if (Platform.OS !== "web") {
      Notifications.requestPermissionsAsync();
    }
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const snap = await getDocs(collection(db, "tasks"));
    const data: Task[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Task, "id">),
    }));
    setTasks(data.filter((t) => !t.completed));
  };

  /* Reminder (non-blocking) */
  const scheduleReminder = async (minutes: number, title: string) => {
    if (Platform.OS === "web") return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Task Reminder ⏰",
          body: title,
        },
        trigger: {
          seconds: minutes * 60,
        } as Notifications.TimeIntervalTriggerInput,
      });
    } catch {
      // Do nothing — never break app
    }
  };

  /* ✅ FIXED SAVE LOGIC */
  const saveTask = async () => {
    if (!title.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title,
      description,
      completed: false,
      reminderMinutes: Number(reminderMinutes),
    };

    // 1️⃣ Update UI immediately
    setTasks((prev) => [newTask, ...prev]);

    // 2️⃣ Close modal instantly
    setModalVisible(false);

    // 3️⃣ Reset form
    setTitle("");
    setDescription("");
    setReminderMinutes("5");

    // 4️⃣ Save to Firebase (background)
    addDoc(collection(db, "tasks"), {
      title: newTask.title,
      description: newTask.description,
      completed: false,
      reminderMinutes: newTask.reminderMinutes,
    });

    // 5️⃣ Schedule reminder (optional)
    scheduleReminder(newTask.reminderMinutes, newTask.title);
  };

  const completeTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await updateDoc(doc(db, "tasks", id), { completed: true });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>SmartTask</Text>
        <Text style={styles.tagline}>Manage your tasks smartly</Text>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 220 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc}>{item.description}</Text>
            <Text style={styles.reminder}>
              ⏰ {item.reminderMinutes} min reminder
            </Text>

            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => completeTask(item.id)}
            >
              <Text style={{ color: "#fff" }}>Done</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Add Task</Text>

            <Text style={styles.label}>Title</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}
            />

            <Text style={styles.label}>Reminder (minutes)</Text>
            <TextInput
              style={styles.input}
              value={reminderMinutes}
              keyboardType="numeric"
              onChangeText={setReminderMinutes}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={saveTask}>
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* Styles */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eef2ff", padding: 16 },
  header: {
    backgroundColor: "#4f46e5",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  logo: { fontSize: 26, fontWeight: "bold", color: "#fff" },
  tagline: { color: "#c7d2fe", fontSize: 13 },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold" },
  cardDesc: { marginVertical: 6 },
  reminder: { fontSize: 12, color: "#2563eb" },

  doneBtn: {
    backgroundColor: "#4f46e5",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 6,
  },

  fab: {
    position: "absolute",
    bottom: 160,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#4f46e5",
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
  },
  fabText: { color: "#fff", fontSize: 32 },

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
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },

  label: { fontWeight: "600", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  saveBtn: {
    backgroundColor: "#4f46e5",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  cancel: { textAlign: "center", marginTop: 10, color: "#6b7280" },
});
