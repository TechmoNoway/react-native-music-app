import coverImage from "@/assets/images/dancing-in-the-dark.jpg";
import { Music } from "@/types/Music";
import Slider from "@react-native-community/slider";
import React from "react";
import { Image, Text, View } from "react-native";
import NeumorphicButton from "./NeumorphicButton";

interface Props {
  setTabSelected: (tab: "list" | "playing") => void;
  currentSong: Music;
  handlePlayPause: () => void;
  isPlaying: boolean;
  handleNext: () => void;
  handlePrevious: () => void;
  handleSeek: (value: number) => void;
  duration: number;
  position: number;
}

const Playing = ({
  setTabSelected,
  currentSong,
  handlePlayPause,
  isPlaying,
  handleNext,
  handlePrevious,
  handleSeek,
  duration,
  position,
}: Props) => {
  const formatTime = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const secs = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${parseInt(secs) < 10 ? "0" : ""}${secs}`;
  };

  return (
    <View className="h-screen">
      <View className="flex-row justify-between mx-7 items-center mt-4">
        <NeumorphicButton
          icon="arrow-back"
          onPress={() => null}
          style="p-2 bg-gray-700"
        />
        <Text className="text-center text-white font-semibold text-sm uppercase">
          Playing Now
        </Text>
        <NeumorphicButton
          icon="menu"
          onPress={() => setTabSelected("list")}
          style="p-2 bg-gray-700"
        />
      </View>
      <View className="items-center mt-20 rounded-full border-2 border-[#2a2d2fcd] shadow-inner shadow-gray-700 mx-auto">
        <Image
          source={currentSong ? { uri: currentSong.artwork } : coverImage}
          alt="image"
          width={250}
          height={250}
          className="w-[250] h-[250] rounded-full shadow-lg shadow-black"
        />
      </View>
      <View className="mt-20">
        <Text className="text-center text-4xl text-white font-semibold mb-1">
          {currentSong.title}
        </Text>
        <Text className="text-center text-sm text-gray-400 font-semibold">
          {currentSong.artist}
        </Text>
      </View>
      <View className="mb-1 mt-20 px-5">
        <Slider
          minimumValue={0}
          maximumValue={duration}
          value={position}
          onSlidingComplete={handleSeek}
          minimumTrackTintColor="#e17645"
          maximumTrackTintColor="#4a4a4a"
          thumbTintColor="#e17645"
        />
      </View>
      <View className="flex-row justify-between px-9">
        <Text className="text-sm text-gray-400">{formatTime(position)}</Text>
        <Text className="text-sm text-gray-400">{formatTime(duration)}</Text>
      </View>
      <View className="flex-row justify-evenly mt-5 mx-7 items-center">
        <NeumorphicButton icon="play-skip-back" onPress={handlePrevious} style="p-4" />
        <NeumorphicButton
          icon={isPlaying ? "pause" : "play"}
          onPress={handlePlayPause}
          style="p-4 bg-orange-500"
        />
        <NeumorphicButton icon="play-skip-forward" onPress={handleNext} style="p-4" />
      </View>
    </View>
  );
};

export default Playing;
