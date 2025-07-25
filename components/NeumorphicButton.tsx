import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { GestureResponderEvent, TouchableOpacity, View } from "react-native";

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: (event: GestureResponderEvent) => void;
  style?: string;
  iconSize?: number;
  showShadow?: boolean;
}

const NeumorphicButton = ({
  icon,
  onPress,
  style = "p-4 bg-gray-600",
  iconSize = 24,
  showShadow = true,
}: Props) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`bg-transparent rounded-full border-2 border-[#2a2d2fcd] shadow-inner shadow-gray-800`}
    >
      <View className={`${style} rounded-full border border-gray-700`}>
        <View>
          {showShadow && (
            <Ionicons
              name={icon}
              size={iconSize}
              color={"#353030f4"}
              className="absolute left-0.5 top-0.5"
            />
          )}
          <Ionicons name={icon} size={iconSize} color={"#ccc"} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default NeumorphicButton;
