import React from "react";
import { Alert, Modal, Text, TouchableOpacity, View } from "react-native";

interface TrackOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  trackTitle?: string;
  onAddToLiked: () => void;
  onAddToPlaylist: () => void;
}

export const TrackOptionsModal: React.FC<TrackOptionsModalProps> = ({
  visible,
  onClose,
  trackTitle,
  onAddToLiked,
  onAddToPlaylist,
}) => {
  console.log("TrackOptionsModal render, visible:", visible);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
      statusBarTranslucent={true}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          zIndex: 9999,
        }}
      >
        <View
          style={{
            backgroundColor: "#1a1a1a",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            paddingBottom: 40,
            minHeight: 300,
            elevation: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
          }}
        >
          {/* Header */}
          <Text
            style={{
              color: "white",
              fontSize: 18,
              fontWeight: "600",
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            {trackTitle || "Track Options"}
          </Text>

          {/* Close Button */}
          <TouchableOpacity
            onPress={() => {
              console.log("Close button pressed");
              onClose();
            }}
            style={{
              backgroundColor: "#333",
              padding: 15,
              borderRadius: 10,
              marginBottom: 10,
            }}
          >
            <Text style={{ color: "white", textAlign: "center", fontSize: 16 }}>
              Close
            </Text>
          </TouchableOpacity>

          {/* Add to Liked Songs */}
          <TouchableOpacity
            onPress={() => {
              console.log("Add to liked pressed");
              Alert.alert("Test", "Add to liked works!");
              onAddToLiked();
              onClose();
            }}
            style={{
              backgroundColor: "#1DB954",
              padding: 15,
              borderRadius: 10,
              marginBottom: 10,
            }}
          >
            <Text style={{ color: "white", textAlign: "center", fontSize: 16 }}>
              Add to Liked Songs
            </Text>
          </TouchableOpacity>

          {/* Add to Playlist */}
          <TouchableOpacity
            onPress={() => {
              console.log("Add to playlist pressed");
              Alert.alert("Test", "Add to playlist works!");
              onAddToPlaylist();
              onClose();
            }}
            style={{
              backgroundColor: "#333",
              padding: 15,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "white", textAlign: "center", fontSize: 16 }}>
              Add to Playlist
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
