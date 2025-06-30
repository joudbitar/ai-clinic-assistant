import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Dimensions,
  StatusBar,
  ScrollView,
  Platform,
  Modal,
  TextInput,
} from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Svg, { Rect } from "react-native-svg";
import axios from "axios";

const { width, height } = Dimensions.get("window");

// Backend API URL - Update this with your actual backend URL
const API_BASE_URL = __DEV__
  ? "http://192.168.68.50:8000"
  : "https://your-api-domain.com";

interface Patient {
  id: string;
  name: string;
  date_of_birth: string;
  phone: string;
}

export default function AudioRecorder() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );

  // Patient form state
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [patientDOB, setPatientDOB] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [isLoadingPatient, setIsLoadingPatient] = useState(false);

  const [recordings, setRecordings] = useState<
    Array<{
      id: string;
      uri: string;
      duration: number;
      timestamp: Date;
      uploadStatus?:
        | "uploading"
        | "uploaded"
        | "failed"
        | "local"
        | "transcription_failed";
      transcriptId?: string;
      transcript?: string;
      cloudUrl?: string;
      patientId?: string;
      patientName?: string;
    }>
  >([]);

  // Load recordings from storage on app start
  useEffect(() => {
    loadRecordings();
  }, []);

  // Save recordings to storage whenever recordings change
  useEffect(() => {
    saveRecordings();
  }, [recordings]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  const loadRecordings = async () => {
    try {
      const storedRecordings = await AsyncStorage.getItem("audioRecordings");
      if (storedRecordings) {
        const parsedRecordings = JSON.parse(storedRecordings).map(
          (rec: any) => ({
            ...rec,
            timestamp: new Date(rec.timestamp),
          })
        );

        // Verify files still exist
        const validRecordings = [];
        for (const rec of parsedRecordings) {
          const fileInfo = await FileSystem.getInfoAsync(rec.uri);
          if (fileInfo.exists) {
            validRecordings.push(rec);
          }
        }

        setRecordings(validRecordings);
      }
    } catch (error) {
      console.error("Error loading recordings:", error);
    }
  };

  const saveRecordings = async () => {
    try {
      await AsyncStorage.setItem("audioRecordings", JSON.stringify(recordings));
    } catch (error) {
      console.error("Error saving recordings:", error);
    }
  };

  const requestPermissions = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant microphone permission to record audio.",
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  };

  const findOrCreatePatient = async (
    name: string,
    dob: string,
    phone: string
  ): Promise<Patient | null> => {
    try {
      setIsLoadingPatient(true);
      console.log("Looking up patient:", { name, dob, phone });

      // First, try to find existing patient
      const searchResponse = await axios.get(
        `${API_BASE_URL}/patients/search`,
        {
          params: {
            name: name.trim(),
            date_of_birth: dob.trim(),
            phone: phone.trim(),
          },
          timeout: 30000, // 30 seconds for patient search
        }
      );

      if (searchResponse.data && searchResponse.data.length > 0) {
        console.log("Found existing patient:", searchResponse.data[0]);
        return searchResponse.data[0];
      }

      // If not found, create new patient
      console.log("Creating new patient...");
      const createResponse = await axios.post(
        `${API_BASE_URL}/patients`,
        {
          name: name.trim(),
          date_of_birth: dob.trim(),
          phone: phone.trim(),
        },
        {
          timeout: 10000,
        }
      );

      console.log("Created new patient:", createResponse.data);
      return createResponse.data;
    } catch (error: any) {
      console.error("Patient lookup/creation failed:", error);
      const errorMessage =
        error.response?.data?.detail || error.message || "Unknown error";
      Alert.alert(
        "Patient Error",
        `Failed to find or create patient: ${errorMessage}`,
        [{ text: "OK" }]
      );
      return null;
    } finally {
      setIsLoadingPatient(false);
    }
  };

  const resetPatientForm = () => {
    setPatientName("");
    setPatientDOB("");
    setPatientPhone("");
    setCurrentPatient(null);
    setShowPatientForm(false);
  };

  const handlePatientFormSubmit = async () => {
    if (!patientName.trim() || !patientDOB.trim() || !patientPhone.trim()) {
      Alert.alert(
        "Required Fields",
        "Please fill in all patient information fields."
      );
      return;
    }

    const patient = await findOrCreatePatient(
      patientName,
      patientDOB,
      patientPhone
    );
    if (patient) {
      setCurrentPatient(patient);
      setShowPatientForm(false);

      Alert.alert("Patient Selected", `Ready to record for: ${patient.name}`, [
        { text: "Start Recording", onPress: () => startRecording() },
      ]);
    }
  };

  const uploadAudioFile = async (
    uri: string,
    recordingId: string,
    filename: string,
    patientId?: string
  ) => {
    try {
      console.log("Starting upload for:", filename);
      setIsUploading(true);
      setUploadProgress((prev) => ({ ...prev, [recordingId]: 0 }));

      // Update recording status to uploading
      setRecordings((prev) =>
        prev.map((rec) =>
          rec.id === recordingId
            ? { ...rec, uploadStatus: "uploading" as const }
            : rec
        )
      );

      // Handle iOS/Android URI differences
      let fileUri = uri;
      if (Platform.OS === "ios" && !uri.startsWith("file://")) {
        fileUri = `file://${uri}`;
      } else if (Platform.OS === "android" && uri.startsWith("file://")) {
        fileUri = uri;
      }

      // Get file info to determine mime type
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error("File does not exist");
      }

      // Create FormData
      const formData = new FormData();
      const fileExtension = filename.split(".").pop() || "m4a";
      const mimeType =
        fileExtension === "m4a" ? "audio/mp4" : `audio/${fileExtension}`;

      // Append file to FormData with proper structure for both platforms
      formData.append("file", {
        uri: fileUri,
        type: mimeType,
        name: filename,
      } as any);

      // Add patient_id if provided
      if (patientId) {
        formData.append("patient_id", patientId);
      }

      console.log("FormData prepared for upload:", {
        uri: fileUri,
        type: mimeType,
        name: filename,
        patientId: patientId || "none",
      });

      // Upload to backend
      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 1800000, // 30 minutes timeout for very large files
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          console.log("Upload progress:", progress);
          setUploadProgress((prev) => ({ ...prev, [recordingId]: progress }));
        },
      });

      console.log("Upload response:", response.data);

      // Check if transcription actually succeeded
      const transcript = response.data.transcript || "";
      const transcriptionFailed =
        transcript.toLowerCase().includes("transcription failed") ||
        transcript.toLowerCase().includes("failed to transcribe") ||
        transcript.trim() === "";

      if (transcriptionFailed) {
        console.warn("Transcription failed, marking as failed:", transcript);

        // Update recording with transcription failure status
        setRecordings((prev) =>
          prev.map((rec) =>
            rec.id === recordingId
              ? {
                  ...rec,
                  uploadStatus: "transcription_failed" as const,
                  transcriptId: response.data.id,
                  transcript: transcript,
                  cloudUrl: response.data.url,
                }
              : rec
          )
        );

        // Show transcription failed message with retry option
        Alert.alert(
          "Transcription Failed",
          `File uploaded successfully but transcription failed:\n\n${transcript.substring(
            0,
            150
          )}${transcript.length > 150 ? "..." : ""}`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Retry Transcription",
              onPress: () => {
                console.log("Retrying transcription for:", filename);
                uploadAudioFile(uri, recordingId, filename, patientId);
              },
            },
          ]
        );
      } else {
        // Update recording with upload success
        setRecordings((prev) =>
          prev.map((rec) =>
            rec.id === recordingId
              ? {
                  ...rec,
                  uploadStatus: "uploaded" as const,
                  transcriptId: response.data.id,
                  transcript: response.data.transcript,
                  cloudUrl: response.data.url,
                }
              : rec
          )
        );

        // Show success message
        Alert.alert(
          "Upload Successful",
          `Recording uploaded and transcribed successfully!\n\nTranscript: ${response.data.transcript?.substring(
            0,
            100
          )}${response.data.transcript?.length > 100 ? "..." : ""}`,
          [{ text: "OK" }]
        );
      }

      return response.data;
    } catch (error: any) {
      console.error("Upload failed:", error);

      // Update recording status to failed
      setRecordings((prev) =>
        prev.map((rec) =>
          rec.id === recordingId
            ? { ...rec, uploadStatus: "failed" as const }
            : rec
        )
      );

      // Show error message
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Unknown error occurred";
      Alert.alert(
        "Upload Failed",
        `Failed to upload recording: ${errorMessage}`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Retry",
            onPress: () => uploadAudioFile(uri, recordingId, filename),
          },
        ]
      );

      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[recordingId];
        return newProgress;
      });
    }
  };

  const showPatientFormBeforeRecording = () => {
    if (!currentPatient) {
      setShowPatientForm(true);
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setIsPaused(false);
      setRecordingDuration(0);
    } catch (err) {
      console.error("Failed to start recording", err);
      Alert.alert("Error", "Failed to start recording. Please try again.");
    }
  };

  const pauseRecording = async () => {
    if (recording) {
      try {
        await recording.pauseAsync();
        setIsPaused(true);
      } catch (err) {
        console.error("Failed to pause recording", err);
      }
    }
  };

  const resumeRecording = async () => {
    if (recording) {
      try {
        await recording.startAsync();
        setIsPaused(false);
      } catch (err) {
        console.error("Failed to resume recording", err);
      }
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (uri) {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        const timestamp = new Date();
        const fileName = `recording_${timestamp.getTime()}.m4a`;
        const newUri = `${FileSystem.documentDirectory}${fileName}`;

        await FileSystem.moveAsync({
          from: uri,
          to: newUri,
        });

        const recordingId = timestamp.getTime().toString();
        const newRecording = {
          id: recordingId,
          uri: newUri,
          duration: recordingDuration,
          timestamp,
          uploadStatus: "local" as const,
          patientId: currentPatient?.id,
          patientName: currentPatient?.name,
        };

        setRecordings((prev) => [newRecording, ...prev]);

        const patientInfo = currentPatient
          ? `\nPatient: ${currentPatient.name}`
          : "\nNo patient selected";

        Alert.alert(
          "Recording Saved",
          `Audio recording saved successfully.\nDuration: ${formatDuration(
            recordingDuration
          )}${patientInfo}\n\nUploading and transcribing...`,
          [{ text: "OK" }]
        );

        // Start upload in background
        uploadAudioFile(
          newUri,
          recordingId,
          fileName,
          currentPatient?.id
        ).catch((error) => {
          console.error("Background upload failed:", error);
          // Error handling is already done in uploadAudioFile function
        });
      }

      setRecording(null);
      setIsRecording(false);
      setIsPaused(false);
      setRecordingDuration(0);
    } catch (err) {
      console.error("Failed to stop recording", err);
      Alert.alert("Error", "Failed to save recording. Please try again.");
    }
  };

  const copyUriToClipboard = async (uri: string, filename: string) => {
    try {
      await Clipboard.setStringAsync(uri);
      Alert.alert("URI Copied", `File path copied to clipboard:\n${filename}`, [
        { text: "OK" },
      ]);
    } catch (err) {
      console.error("Failed to copy to clipboard", err);
      Alert.alert("Error", "Failed to copy URI to clipboard.");
    }
  };

  const deleteRecording = (id: string, uri: string) => {
    Alert.alert(
      "Delete Recording",
      "Are you sure you want to delete this recording?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await FileSystem.deleteAsync(uri, { idempotent: true });
              setRecordings((prev) => prev.filter((rec) => rec.id !== id));
              Alert.alert("Success", "Recording deleted.");
            } catch (err) {
              console.error("Error deleting recording", err);
              Alert.alert("Error", "Failed to delete recording.");
            }
          },
        },
      ]
    );
  };

  const playAudio = async (uri: string, id: string) => {
    try {
      // Stop any currently playing audio
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
        setPlayingId(null);
      }

      if (playingId === id) {
        // If clicking the same recording, just stop
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );

      setSound(newSound);
      setPlayingId(id);

      // Set up completion callback
      newSound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.didJustFinish) {
          setPlayingId(null);
          setSound(null);
        }
      });
    } catch (error) {
      console.error("Error playing audio:", error);
      Alert.alert("Error", "Failed to play audio recording.");
    }
  };

  const stopAudio = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
      setPlayingId(null);
    }
  };

  const deleteAllRecordings = () => {
    Alert.alert(
      "Delete All Recordings",
      "Are you sure you want to delete all saved recordings? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            try {
              // Stop any playing audio first
              await stopAudio();

              for (const rec of recordings) {
                await FileSystem.deleteAsync(rec.uri, { idempotent: true });
              }
              setRecordings([]);
              Alert.alert("Success", "All recordings have been deleted.");
            } catch (err) {
              console.error("Error deleting recordings", err);
              Alert.alert("Error", "Failed to delete some recordings.");
            }
          },
        },
      ]
    );
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const formatTimestamp = (date: Date): string => {
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      {/* Header with Greeting */}
      <View style={styles.header}>
        <Text style={styles.greetingText}>{getGreeting()},</Text>
        <Text style={styles.doctorName}>Dr. Nizar Bitar</Text>
        <Text style={styles.subtitle}>Voice Recording Assistant</Text>
      </View>

      {/* Recording Status */}
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusIndicator,
            {
              backgroundColor: isRecording
                ? isPaused
                  ? "#FF9500"
                  : "#FF3B30"
                : "#8E8E93",
            },
          ]}
        />
        <Text style={styles.statusText}>
          {isRecording ? (isPaused ? "PAUSED" : "RECORDING") : "READY"}
        </Text>
      </View>

      {/* Timer Display */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>
          {formatDuration(recordingDuration)}
        </Text>
      </View>

      {/* Current Patient Display */}
      {currentPatient && (
        <View style={styles.patientContainer}>
          <View style={styles.patientInfo}>
            <Text style={styles.patientLabel}>Current Patient:</Text>
            <Text style={styles.patientName}>{currentPatient.name}</Text>
            <Text style={styles.patientDetails}>{currentPatient.phone}</Text>
          </View>
          <TouchableOpacity
            style={styles.changePatientButton}
            onPress={() => setShowPatientForm(true)}
          >
            <Text style={styles.changePatientText}>Change</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Recording Controls */}
      <View style={styles.controlsContainer}>
        {!isRecording ? (
          <TouchableOpacity
            style={styles.recordButton}
            onPress={showPatientFormBeforeRecording}
          >
            <Ionicons name="mic" size={40} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={styles.activeControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={isPaused ? resumeRecording : pauseRecording}
            >
              <Ionicons
                name={isPaused ? "play" : "pause"}
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
              <Ionicons name="stop" size={32} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Recording Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          {!isRecording
            ? "Tap the microphone to start recording"
            : isPaused
            ? "Recording paused. Tap play to continue or stop to save."
            : "Recording in progress. Tap pause or stop when finished."}
        </Text>
      </View>

      {/* Recordings List */}
      <View style={styles.recordingsContainer}>
        <View style={styles.recordingsHeader}>
          <Text style={styles.recordingsTitle}>
            Recordings ({recordings.length})
          </Text>
          {recordings.length > 0 && (
            <TouchableOpacity
              style={styles.clearAllButton}
              onPress={deleteAllRecordings}
            >
              <Ionicons name="trash-outline" size={16} color="#FF3B30" />
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        {recordings.length > 0 ? (
          <ScrollView
            style={styles.recordingsList}
            showsVerticalScrollIndicator={false}
          >
            {recordings.map((recording) => {
              const filename = recording.uri.split("/").pop() || "Unknown";
              const currentUploadProgress = uploadProgress[recording.id] || 0;

              return (
                <View key={recording.id} style={styles.recordingItem}>
                  <View style={styles.recordingInfo}>
                    <View style={styles.recordingHeader}>
                      <Text style={styles.recordingFilename}>{filename}</Text>
                      {recording.uploadStatus && (
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor:
                                recording.uploadStatus === "uploaded"
                                  ? "#34C75920"
                                  : recording.uploadStatus === "uploading"
                                  ? "#007AFF20"
                                  : recording.uploadStatus === "failed"
                                  ? "#FF3B3020"
                                  : recording.uploadStatus ===
                                    "transcription_failed"
                                  ? "#FF950020"
                                  : "#8E8E9320",
                            },
                          ]}
                        >
                          <Ionicons
                            name={
                              recording.uploadStatus === "uploaded"
                                ? "cloud-done"
                                : recording.uploadStatus === "uploading"
                                ? "cloud-upload"
                                : recording.uploadStatus === "failed"
                                ? "cloud-offline"
                                : recording.uploadStatus ===
                                  "transcription_failed"
                                ? "warning"
                                : "phone-portrait"
                            }
                            size={10}
                            color={
                              recording.uploadStatus === "uploaded"
                                ? "#34C759"
                                : recording.uploadStatus === "uploading"
                                ? "#007AFF"
                                : recording.uploadStatus === "failed"
                                ? "#FF3B30"
                                : recording.uploadStatus ===
                                  "transcription_failed"
                                ? "#FF9500"
                                : "#8E8E93"
                            }
                          />
                          <Text
                            style={[
                              styles.statusText,
                              {
                                color:
                                  recording.uploadStatus === "uploaded"
                                    ? "#34C759"
                                    : recording.uploadStatus === "uploading"
                                    ? "#007AFF"
                                    : recording.uploadStatus === "failed"
                                    ? "#FF3B30"
                                    : recording.uploadStatus ===
                                      "transcription_failed"
                                    ? "#FF9500"
                                    : "#8E8E93",
                              },
                            ]}
                          >
                            {recording.uploadStatus === "uploaded"
                              ? "Synced"
                              : recording.uploadStatus === "uploading"
                              ? `${currentUploadProgress}%`
                              : recording.uploadStatus === "failed"
                              ? "Failed"
                              : recording.uploadStatus ===
                                "transcription_failed"
                              ? "Transcription Failed"
                              : "Local"}
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.recordingDetails}>
                      {formatTimestamp(recording.timestamp)} •{" "}
                      {formatDuration(recording.duration)}
                      {recording.patientName && ` • ${recording.patientName}`}
                    </Text>

                    {recording.transcript && (
                      <Text style={styles.transcriptText} numberOfLines={2}>
                        "{recording.transcript}"
                      </Text>
                    )}

                    <View style={styles.recordingActions}>
                      <TouchableOpacity
                        style={styles.playButton}
                        onPress={() => playAudio(recording.uri, recording.id)}
                      >
                        <Ionicons
                          name={playingId === recording.id ? "stop" : "play"}
                          size={14}
                          color="#34C759"
                        />
                        <Text style={styles.playButtonText}>
                          {playingId === recording.id ? "Stop" : "Play"}
                        </Text>
                      </TouchableOpacity>

                      {(recording.uploadStatus === "failed" ||
                        recording.uploadStatus === "transcription_failed") && (
                        <TouchableOpacity
                          style={styles.retryButton}
                          onPress={() =>
                            uploadAudioFile(
                              recording.uri,
                              recording.id,
                              filename,
                              recording.patientId
                            )
                          }
                        >
                          <Ionicons name="refresh" size={14} color="#FF9500" />
                          <Text style={styles.retryButtonText}>
                            {recording.uploadStatus === "transcription_failed"
                              ? "Retry Transcription"
                              : "Retry"}
                          </Text>
                        </TouchableOpacity>
                      )}

                      {/* Temporary: Force re-upload for any recording */}
                      <TouchableOpacity
                        style={[
                          styles.retryButton,
                          { backgroundColor: "#34C75910" },
                        ]}
                        onPress={() => {
                          Alert.alert(
                            "Force Re-upload",
                            "This will re-upload and re-transcribe the recording. Continue?",
                            [
                              { text: "Cancel", style: "cancel" },
                              {
                                text: "Re-upload",
                                onPress: () =>
                                  uploadAudioFile(
                                    recording.uri,
                                    recording.id,
                                    filename,
                                    recording.patientId
                                  ),
                              },
                            ]
                          );
                        }}
                      >
                        <Ionicons
                          name="cloud-upload"
                          size={14}
                          color="#34C759"
                        />
                        <Text
                          style={[styles.retryButtonText, { color: "#34C759" }]}
                        >
                          Force Re-upload
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.uriButton}
                        onPress={() =>
                          copyUriToClipboard(recording.uri, filename)
                        }
                      >
                        <Ionicons
                          name="copy-outline"
                          size={14}
                          color="#007AFF"
                        />
                        <Text style={styles.uriButtonText}>Copy URI</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteItemButton}
                    onPress={() => deleteRecording(recording.id, recording.uri)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <View style={styles.noRecordings}>
            <Ionicons name="mic-off-outline" size={32} color="#8E8E93" />
            <Text style={styles.noRecordingsText}>No recordings yet</Text>
            <Text style={styles.noRecordingsSubtext}>
              Start recording to see your files here
            </Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Recordings automatically sync to cloud with AI transcription
        </Text>
      </View>

      {/* Patient Form Modal */}
      <Modal
        visible={showPatientForm}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setShowPatientForm(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Patient Information</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowPatientForm(false)}
            >
              <Ionicons name="close" size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Patient Name *</Text>
              <TextInput
                style={styles.formInput}
                value={patientName}
                onChangeText={setPatientName}
                placeholder="Enter patient full name"
                placeholderTextColor="#8E8E93"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Date of Birth *</Text>
              <TextInput
                style={styles.formInput}
                value={patientDOB}
                onChangeText={setPatientDOB}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#8E8E93"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Phone Number *</Text>
              <TextInput
                style={styles.formInput}
                value={patientPhone}
                onChangeText={setPatientPhone}
                placeholder="Enter phone number"
                placeholderTextColor="#8E8E93"
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                isLoadingPatient && styles.submitButtonDisabled,
              ]}
              onPress={handlePatientFormSubmit}
              disabled={isLoadingPatient}
            >
              {isLoadingPatient ? (
                <Text style={styles.submitButtonText}>Loading...</Text>
              ) : (
                <Text style={styles.submitButtonText}>Continue</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={resetPatientForm}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  greetingText: {
    fontSize: 18,
    color: "#8E8E93",
    fontWeight: "400",
  },
  doctorName: {
    fontSize: 28,
    color: "#FFFFFF",
    fontWeight: "700",
    marginTop: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
    marginTop: 8,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
    letterSpacing: 1,
  },

  timerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  timerText: {
    fontSize: 48,
    color: "#FFFFFF",
    fontWeight: "300",
    fontVariant: ["tabular-nums"],
  },
  controlsContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FF3B30",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#FF3B30",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  activeControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 30,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  stopButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FF3B30",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#FF3B30",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  instructionsContainer: {
    alignItems: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  instructionsText: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 22,
  },
  recordingsContainer: {
    backgroundColor: "#16213e",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    flex: 1,
  },
  recordingsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  recordingsTitle: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  clearAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#FF3B3020",
    borderRadius: 8,
  },
  clearAllText: {
    fontSize: 12,
    color: "#FF3B30",
    fontWeight: "500",
    marginLeft: 4,
  },
  recordingsList: {
    maxHeight: 200,
  },
  recordingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1a1a2e",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  recordingInfo: {
    flex: 1,
  },
  recordingFilename: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
    marginBottom: 4,
  },
  recordingDetails: {
    fontSize: 12,
    color: "#8E8E93",
    marginBottom: 8,
  },
  recordingActions: {
    flexDirection: "row",
    gap: 8,
  },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#34C75920",
    borderRadius: 6,
  },
  playButtonText: {
    fontSize: 11,
    color: "#34C759",
    fontWeight: "500",
    marginLeft: 4,
  },
  uriButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#007AFF20",
    borderRadius: 6,
  },
  uriButtonText: {
    fontSize: 11,
    color: "#007AFF",
    fontWeight: "500",
    marginLeft: 4,
  },
  deleteItemButton: {
    padding: 8,
    backgroundColor: "#FF3B3020",
    borderRadius: 8,
    marginLeft: 12,
  },
  noRecordings: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noRecordingsText: {
    fontSize: 16,
    color: "#8E8E93",
    fontWeight: "500",
    marginTop: 12,
  },
  noRecordingsSubtext: {
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 4,
    textAlign: "center",
  },
  footer: {
    alignItems: "center",
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#8E8E93",
    textAlign: "center",
  },
  recordingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "500",
  },
  transcriptText: {
    fontSize: 12,
    color: "#B0B0B0",
    fontStyle: "italic",
    marginBottom: 8,
    lineHeight: 16,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#FF950020",
    borderRadius: 6,
  },
  retryButtonText: {
    fontSize: 11,
    color: "#FF9500",
    fontWeight: "500",
    marginLeft: 4,
  },
  // Patient display styles
  patientContainer: {
    backgroundColor: "#16213e",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  patientInfo: {
    flex: 1,
  },
  patientLabel: {
    fontSize: 12,
    color: "#8E8E93",
    marginBottom: 4,
  },
  patientName: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
    marginBottom: 2,
  },
  patientDetails: {
    fontSize: 14,
    color: "#007AFF",
  },
  changePatientButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#007AFF20",
    borderRadius: 8,
  },
  changePatientText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#16213e",
  },
  modalTitle: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: "#16213e",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#2a2a4e",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  submitButtonDisabled: {
    backgroundColor: "#007AFF50",
  },
  submitButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#16213e",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#8E8E93",
    fontWeight: "500",
  },
});
