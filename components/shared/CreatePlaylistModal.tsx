import { colors } from "@/constants/tokens";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface CreatePlaylistModalProps {
  visible: boolean;
  onClose: () => void;
  onCreatePlaylist: (name: string) => Promise<void>;
  playlistName: string;
  setPlaylistName: (name: string) => void;
  isLoading?: boolean;
}

export const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({
  visible,
  onClose,
  onCreatePlaylist,
  playlistName,
  setPlaylistName,
  isLoading = false,
}) => {
  const handleCreate = async () => {
    if (playlistName.trim()) {
      await onCreatePlaylist(playlistName.trim());
    }
  };

  const handleCancel = () => {
    setPlaylistName("");
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-1 bg-black/50 justify-center p-5">
          <View className="bg-neutral-900 rounded-2xl p-6 shadow-lg">
            {/* Header */}
            <View className="flex-row items-center mb-6">
              <Ionicons
                name="musical-notes"
                size={24}
                color={colors.primary}
                className="mr-3"
              />
              <Text className="text-white text-xl font-bold flex-1">
                Create New Playlist
              </Text>
              <TouchableOpacity onPress={handleCancel} disabled={isLoading}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Input Field */}
            <View className="mb-6">
              <Text className="text-white text-base font-semibold mb-2">
                Playlist Name
              </Text>
              <TextInput
                value={playlistName}
                onChangeText={setPlaylistName}
                placeholder="Enter playlist name..."
                placeholderTextColor={colors.textMuted}
                className={`bg-neutral-800 rounded-xl px-4 py-3 text-white text-base border-2 ${
                  playlistName ? "border-blue-500" : "border-transparent"
                }`}
                autoFocus
                maxLength={50}
                editable={!isLoading}
              />
              <Text className="text-neutral-400 text-xs mt-1">
                {playlistName.length}/50 characters
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleCancel}
                disabled={isLoading}
                className="flex-1 bg-neutral-800 rounded-xl py-3.5 items-center"
              >
                <Text className="text-neutral-400 text-base font-semibold">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCreate}
                disabled={!playlistName.trim() || isLoading}
                className={`flex-1 rounded-xl py-3.5 items-center ${
                  playlistName.trim() && !isLoading ? "bg-blue-500" : "bg-neutral-800"
                }`}
              >
                {isLoading ? (
                  <Text className="text-neutral-400 text-base font-semibold">
                    Creating...
                  </Text>
                ) : (
                  <Text
                    className={`text-base font-semibold ${
                      playlistName.trim() ? "text-white" : "text-neutral-400"
                    }`}
                  >
                    Create
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
