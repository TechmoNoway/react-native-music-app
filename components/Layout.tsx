import { musicData } from "@/data/data";
import { Music } from "@/types/Music";
import { Audio, AVPlaybackStatus } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import MusicList from "./MusicList";
import Playing from "./Playing";

const Layout = () => {
  const [tabSelected, setTabSelected] = useState<"list" | "playing">("playing");

  const [sound, setsound] = useState<Audio.Sound | null>(null);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [position, setPosition] = useState<number>(0);
  const [duration, setDuration] = useState<number>(1);

  const currentSong: Music = musicData[currentSongIndex];

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (sound && isPlaying) {
      interval = setInterval(async () => {
        const status = (await sound.getStatusAsync()) as AVPlaybackStatus;
        if (status.isLoaded && !status.didJustFinish) {
          setPosition(status.positionMillis);
          setDuration(status.durationMillis || 1);
        }
      }, 500);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [sound, isPlaying]);

  const playSound = async (index: number) => {
    if (sound) await sound.unloadAsync();

    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: musicData[index].url },
      { shouldPlay: true }
    );

    newSound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
      if (status.isLoaded && status.didJustFinish) {
        setPosition(status.positionMillis);
        setDuration(status.durationMillis || 1);
      }
    });

    setsound(newSound);
    if (currentSongIndex !== index) {
      setCurrentSongIndex(index);
    }
    setCurrentSongIndex(index);
    setIsPlaying(true);
  };

  const handlePlayPause = async () => {
    if (!sound) return;
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = async () => {
    const nextIndex = (currentSongIndex + 1) % musicData.length;
    await playSound(nextIndex);
  };

  const handlePrevious = async () => {
    const previousIndex = (currentSongIndex - 1 + musicData.length) % musicData.length;
    await playSound(previousIndex);
  };

  const handleSeek = async (value: number) => {
    if (sound) {
      await sound.setPositionAsync(value);
      setPosition(value);
    }
  };

  return (
    <>
      <LinearGradient colors={["#212528", "#111315"]} className="flex-1">
        <SafeAreaView>
          {tabSelected === "list" ? (
            <MusicList
              musicData={musicData}
              setTabSelected={setTabSelected}
              playSound={playSound}
              currentSong={currentSong}
              isPlaying={isPlaying}
              currentSongIndex={currentSongIndex}
              handlePlayPause={handlePlayPause}
            />
          ) : (
            <Playing
              setTabSelected={setTabSelected}
              currentSong={currentSong}
              handlePlayPause={handlePlayPause}
              isPlaying={isPlaying}
              handleNext={handleNext}
              handlePrevious={handlePrevious}
              handleSeek={handleSeek}
              duration={duration}
              position={position}
            />
          )}
        </SafeAreaView>
      </LinearGradient>
    </>
  );
};

export default Layout;
