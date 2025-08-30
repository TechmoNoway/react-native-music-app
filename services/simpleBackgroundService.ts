import { Track } from "@/types/audio";
import { AppState } from "react-native";

// Simple background music indicator for Expo Go
class SimpleBackgroundService {
  private currentTrack: Track | null = null;
  private isPlaying: boolean = false;
  private appState: string = AppState.currentState;
  private subscription: any = null;

  constructor() {
    this.subscription = AppState.addEventListener("change", this.handleAppStateChange);
  }

  private handleAppStateChange = (nextAppState: string) => {
    if (this.appState.match(/inactive|background/) && nextAppState === "active") {
      if (this.currentTrack && this.isPlaying) {
        console.log(`🎵 Welcome back! Currently playing: ${this.currentTrack.title}`);
      }
    } else if (nextAppState.match(/inactive|background/)) {
      console.log("App has gone to background");
      if (this.currentTrack && this.isPlaying) {
        console.log(`🎵 Music continues in background: ${this.currentTrack.title}`);
      }
    }
    this.appState = nextAppState;
  };

  updatePlaybackState(
    track: Track | null,
    isPlaying: boolean,
    progress?: { position: number; duration: number }
  ) {
    this.currentTrack = track;
    this.isPlaying = isPlaying;

    if (this.appState.match(/inactive|background/) && track && isPlaying) {
      console.log(`🎵 Background playback: ${track.title} by ${track.artist}`);
      if (progress) {
        const progressPercent = Math.round((progress.position / progress.duration) * 100);
        console.log(
          `📊 Progress: ${progressPercent}% (${Math.floor(
            progress.position
          )}s / ${Math.floor(progress.duration)}s)`
        );
      }
    }
  }

  cleanup() {
    if (this.subscription) {
      this.subscription.remove();
    }
  }
}

export const simpleBackgroundService = new SimpleBackgroundService();
