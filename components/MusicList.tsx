import coverImage from "@/assets/images/dancing-in-the-dark.jpg";
import { Music } from "@/types/Music";
import { Entypo } from "@expo/vector-icons";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import NeumorphicButton from "./NeumorphicButton";

interface Props {
  musicData: Music[];
  setTabSelected: (tab: "list" | "playing") => void;
  playSound: (index: number) => Promise<void>;
  currentSong: Music;
  isPlaying: boolean;
  currentSongIndex: number;
  handlePlayPause: () => void;
}

const MusicList = ({
  musicData,
  setTabSelected,
  playSound,
  currentSong,
  isPlaying,
  currentSongIndex,
  handlePlayPause,
}: Props) => {
  return (
    <View className="h-screen">
      <View className="flex flex-row gap-2 items-center justify-center mt-3">
        <Text className="text-white font-semibold text-sm">EVOL</Text>
        <Entypo name="dot-single" size={18} color="white" />
        <Text className="text-white font-semibold text-sm">FUTURE</Text>
      </View>
      <View className="my-16">
        <View className="flex flex-row items-center justify-between px-7">
          <NeumorphicButton icon="heart" style="p-2" iconSize={18} onPress={() => null} />
          <View className="rounded-full border-2 border-[#2a2d2fcd] shadow-inner shadow-gray-700">
            <Image
              source={currentSong ? { uri: currentSong.artwork } : coverImage}
              alt="image"
              width={250}
              height={250}
              className="w-52 h-52 rounded-full shadow-lg shadow-black"
            />
          </View>
          <NeumorphicButton
            icon="ellipsis-horizontal"
            style="p-2"
            iconSize={18}
            onPress={() => setTabSelected("playing")}
          />
        </View>
      </View>
      <ScrollView>
        <View className="px-4">
          {musicData.map((item, index) => (
            <TouchableOpacity
              onPress={() => playSound(index)}
              key={item.id}
              className={`flex-row items-center px-4 py-5 rounded-2xl ${currentSongIndex === index ? "bg-black" : "bg-transparent"}`}
            >
              <Image source={{ uri: item.artwork }} className="w-16 h-16 rounded-lg" />
              <View className="flex-1 ml-4">
                <Text className="text-white text-xl">{item.title}</Text>
                <Text className="text-gray-300 text-sm">{item.artist}</Text>
                {currentSongIndex === index && (
                  <Text className="text-orange-400">is playing</Text>
                )}
              </View>
              <NeumorphicButton
                icon={isPlaying && currentSongIndex === index ? "pause" : "play"}
                style={`p-2 ${currentSongIndex === index ? "bg-orange-500" : "bg-gray-800"}`}
                onPress={
                  currentSongIndex === index ? handlePlayPause : () => playSound(index)
                }
                iconSize={18}
                showShadow={false}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default MusicList;
