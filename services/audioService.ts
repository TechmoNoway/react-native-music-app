import { RepeatMode, Track } from "@/types/audio";
import { Audio, AVPlaybackStatus } from "expo-av";
import { useEffect, useState } from "react";
import { simpleBackgroundService } from "./simpleBackgroundService";

class AudioService {
  private sound: Audio.Sound | null = null;
  private currentTrack: Track | null = null;
  private queue: Track[] = [];
  private currentIndex: number = 0;
  private repeatMode: RepeatMode = RepeatMode.Off;
  private volume: number = 1.0;
  private isPlaying: boolean = false;
  private position: number = 0;
  private duration: number = 0;
  private listeners: Map<string, Function[]> = new Map();
  private isResetting = false;
  private isAdding = false;

  constructor() {
    this.setupAudio();
  }

  private async setupAudio() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Set initial volume to maximum to ensure audio is audible
      this.volume = 1.0;
    } catch (error) {
      console.error("❌ Audio setup failed:", error);
    }
  }

  // Audio service methods
  async setupPlayer(options?: any) {
    return Promise.resolve();
  }

  async updateOptions(options?: any) {
    return Promise.resolve();
  }

  async setQueue(tracks: Track[]) {
    this.queue = tracks;
    this.currentIndex = 0;
    if (tracks.length > 0) {
      await this.loadTrack(tracks[0]);
    }
  }

  async add(tracks: Track | Track[]): Promise<void> {
    if (this.isAdding) {
      console.log("Already adding tracks, ignoring...");
      return;
    }

    this.isAdding = true;

    try {
      const tracksArray = Array.isArray(tracks) ? tracks : [tracks];
      console.log("Adding tracks:", tracksArray.length);

      this.queue = [...this.queue, ...tracksArray];

      // If this is the first track and no current track, load it
      if (this.queue.length === tracksArray.length && !this.currentTrack) {
        const firstTrack = this.queue[0];
        if (firstTrack) {
          await this.loadTrack(firstTrack);
        }
      }
    } finally {
      this.isAdding = false;
    }
  }

  async remove(index: number) {
    if (index >= 0 && index < this.queue.length) {
      this.queue.splice(index, 1);
      if (index <= this.currentIndex) {
        this.currentIndex = Math.max(0, this.currentIndex - 1);
      }
    }
  }

  async reset(): Promise<void> {
    if (this.isResetting) {
      console.log("Already resetting, waiting...");
      return;
    }

    this.isResetting = true;
    console.log("Resetting AudioService");

    try {
      // Stop and cleanup current sound
      if (this.sound) {
        try {
          await this.sound.stopAsync();
          await this.sound.unloadAsync();
        } catch (error) {
          console.log("Error during sound cleanup:", error);
        }
        this.sound = null;
      }

      // Reset all state
      this.queue = [];
      this.currentIndex = 0;
      this.currentTrack = null;
      this.isPlaying = false;
      this.position = 0;
      this.duration = 0;
      this.emit("PlaybackState", { state: "paused" });

      console.log("AudioService reset completed");
    } catch (error) {
      console.error("Error during reset:", error);
    } finally {
      this.isResetting = false;
    }
  }

  private async loadTrack(track: Track) {
    try {
      // Validate track URL
      const trackUrl = track.fileUrl || track.url || "";
      if (!trackUrl || trackUrl.trim() === "") {
        throw new Error(`No valid audio URL found for track: ${track.title}`);
      }

      if (this.sound) {
        await this.sound.unloadAsync();
      }

      this.currentTrack = track;

      const { sound } = await Audio.Sound.createAsync(
        { uri: trackUrl },
        {
          shouldPlay: false,
          volume: this.volume,
          progressUpdateIntervalMillis: 250,
        },
        this.onPlaybackStatusUpdate.bind(this)
      );

      this.sound = sound;

      // Wait a bit to ensure the sound is fully loaded
      await new Promise((resolve) => setTimeout(resolve, 100));

      this.emit("PlaybackActiveTrackChanged", { index: this.currentIndex, track });

      // Update background service with progress
      const progress = this.getProgress();
      simpleBackgroundService.updatePlaybackState(track, this.isPlaying, progress);
    } catch (error) {
      console.error("❌ Error loading track:", error);
      console.error("❌ Error details:", JSON.stringify(error));

      // Show user-friendly error message
      const trackUrl = track.fileUrl || track.url || "";
      if (!trackUrl || trackUrl.trim() === "") {
        console.warn(`⚠️ Track "${track.title}" has no audio file URL`);
        this.emit("PlaybackError", {
          error: new Error(`This track "${track.title}" is not available for playback`),
          type: "NoAudioFile",
        });
      } else {
        this.emit("PlaybackError", { error, type: "PlaybackError" });
      }
    }
  }

  private onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      this.isPlaying = status.isPlaying || false;
      this.position = status.positionMillis || 0;
      this.duration = status.durationMillis || 0;

      this.emit("PlaybackState", {
        state: this.isPlaying ? "playing" : "paused",
      });

      if (status.didJustFinish) {
        this.handleTrackEnd();
      }
    }
  };

  async play(): Promise<void> {
    if (this.isResetting) {
      console.log("Cannot play - currently resetting");
      return;
    }

    try {
      // If no sound but we have tracks, load the current track first
      if (!this.sound && this.queue.length > 0) {
        const currentTrack = this.queue[this.currentIndex];
        if (currentTrack) {
          await this.loadTrack(currentTrack);
        }
      }

      if (!this.sound) {
        console.log("No sound available to play");
        return;
      }

      console.log("Playing track");
      await this.sound.playAsync();
      this.isPlaying = true;
      this.emit("PlaybackState", { state: "playing" });

      // Update background service with progress
      if (this.currentTrack) {
        const progress = this.getProgress();
        simpleBackgroundService.updatePlaybackState(this.currentTrack, true, progress);
      }
    } catch (error) {
      console.error("Error playing track:", error);
    }
  }

  async pause() {
    if (!this.sound) return;

    try {
      await this.sound.pauseAsync();
      this.isPlaying = false;
      this.emit("PlaybackState", { state: "paused" });
      this.emit("RemotePause", {});

      // Update background service with progress
      if (this.currentTrack) {
        const progress = this.getProgress();
        simpleBackgroundService.updatePlaybackState(this.currentTrack, false, progress);
      }
    } catch (error) {
      console.error("Error pausing:", error);
    }
  }

  async stop() {
    if (!this.sound) return;

    try {
      await this.sound.stopAsync();
      this.emit("RemoteStop", {});

      // Update background service when stopped
      simpleBackgroundService.updatePlaybackState(null, false);
    } catch (error) {
      console.error("Error stopping:", error);
    }
  }

  async seekTo(position: number) {
    if (!this.sound) return;

    try {
      await this.sound.setPositionAsync(position * 1000);
    } catch (error) {
      console.error("Error seeking:", error);
    }
  }

  async skip(index: number) {
    if (index >= 0 && index < this.queue.length) {
      this.currentIndex = index;
      await this.loadTrack(this.queue[index]);
    }
  }

  canSkipToNext(): boolean {
    return this.currentIndex < this.queue.length - 1;
  }

  canSkipToPrevious(): boolean {
    return this.currentIndex > 0;
  }

  async skipToNext() {
    if (this.canSkipToNext()) {
      this.currentIndex++;
      await this.loadTrack(this.queue[this.currentIndex]);
      this.emit("RemoteNext", {});
    }
  }

  async skipToPrevious() {
    if (this.canSkipToPrevious()) {
      this.currentIndex--;
      await this.loadTrack(this.queue[this.currentIndex]);
      this.emit("RemotePrevious", {});
    }
  }

  async setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.sound) {
      await this.sound.setVolumeAsync(this.volume);
    }
  }

  async getVolume(): Promise<number> {
    return this.volume;
  }

  async setRepeatMode(mode: RepeatMode) {
    this.repeatMode = mode;
  }

  async getRepeatMode(): Promise<RepeatMode> {
    return this.repeatMode;
  }

  async updateMetadataForTrack(index: number, metadata: Partial<Track>) {
    if (index >= 0 && index < this.queue.length) {
      this.queue[index] = { ...this.queue[index], ...metadata };
      if (index === this.currentIndex) {
        this.currentTrack = { ...this.currentTrack!, ...metadata };
      }
    }
  }

  async getActiveTrackIndex(): Promise<number | null> {
    return this.currentIndex;
  }

  async getQueue(): Promise<Track[]> {
    return [...this.queue];
  }

  getActiveTrack(): Track | null {
    return this.currentTrack;
  }

  // Shuffle the queue randomly
  async shuffleQueue() {
    if (this.queue.length <= 1) return;

    const currentTrack = this.currentTrack;

    // Fisher-Yates shuffle algorithm
    for (let i = this.queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
    }

    // If we have a current track, move it to the first position
    if (currentTrack) {
      const currentTrackIndex = this.queue.findIndex(
        (track) => track._id === currentTrack._id
      );
      if (currentTrackIndex !== -1 && currentTrackIndex !== 0) {
        // Swap current track to position 0
        [this.queue[0], this.queue[currentTrackIndex]] = [
          this.queue[currentTrackIndex],
          this.queue[0],
        ];
      }
      this.currentIndex = 0;
    }
  }

  // Play from a specific position in queue with optional shuffle
  async playFromQueue(index: number = 0, shuffle: boolean = false) {
    if (this.queue.length === 0) return;

    if (shuffle) {
      await this.shuffleQueue();
      // After shuffle, start from the beginning
      index = 0;
    }

    this.currentIndex = Math.max(0, Math.min(index, this.queue.length - 1));
    const track = this.queue[this.currentIndex];

    if (track) {
      await this.loadTrack(track);
      await this.play();
    }
  }

  getProgress(): { position: number; duration: number } {
    return {
      position: this.position / 1000,
      duration: this.duration / 1000,
    };
  }

  getIsPlaying(): { playing: boolean } {
    return { playing: this.isPlaying };
  }

  addEventListener(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  removeEventListener(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => {
        try {
          callback({ type: event, ...data });
        } catch (error) {
          console.warn("Event listener error:", error);
        }
      });
    }
  }

  private async handleTrackEnd() {
    switch (this.repeatMode) {
      case RepeatMode.Track:
        await this.seekTo(0);
        await this.play();
        break;
      case RepeatMode.Queue:
        if (this.currentIndex === this.queue.length - 1) {
          this.currentIndex = 0;
        } else {
          this.currentIndex++;
        }
        await this.loadTrack(this.queue[this.currentIndex]);
        await this.play();
        break;
      default:
        if (this.currentIndex < this.queue.length - 1) {
          await this.skipToNext();
          await this.play();
        } else {
          await this.pause();
        }
        break;
    }
  }

  registerPlaybackService(service: () => any) {}
}

export const audioService = new AudioService();

export default {
  setupPlayer: (options?: any) => audioService.setupPlayer(options),
  updateOptions: (options?: any) => audioService.updateOptions(options),
  setQueue: (tracks: Track[]) => audioService.setQueue(tracks),
  add: (track: Track | Track[]) => audioService.add(track),
  remove: (index: number) => audioService.remove(index),
  reset: () => audioService.reset(),
  play: () => audioService.play(),
  pause: () => audioService.pause(),
  stop: () => audioService.stop(),
  seekTo: (position: number) => audioService.seekTo(position),
  skip: (index: number) => audioService.skip(index),
  skipToNext: () => audioService.skipToNext(),
  skipToPrevious: () => audioService.skipToPrevious(),
  setVolume: (volume: number) => audioService.setVolume(volume),
  getVolume: () => audioService.getVolume(),
  setRepeatMode: (mode: RepeatMode) => audioService.setRepeatMode(mode),
  getRepeatMode: () => audioService.getRepeatMode(),
  updateMetadataForTrack: (index: number, metadata: Partial<Track>) =>
    audioService.updateMetadataForTrack(index, metadata),
  getActiveTrackIndex: () => audioService.getActiveTrackIndex(),
  getQueue: () => audioService.getQueue(),
  getActiveTrack: () => audioService.getActiveTrack(),
  getProgress: () => audioService.getProgress(),
  getIsPlaying: () => audioService.getIsPlaying(),
  shuffleQueue: () => audioService.shuffleQueue(),
  playFromQueue: (index?: number, shuffle?: boolean) =>
    audioService.playFromQueue(index, shuffle),
  addEventListener: (event: string, callback: Function) =>
    audioService.addEventListener(event, callback),
  removeEventListener: (event: string, callback: Function) =>
    audioService.removeEventListener(event, callback),
  registerPlaybackService: (service: () => any) =>
    audioService.registerPlaybackService(service),
};

export const useProgress = (updateInterval: number = 250) => {
  const [progress, setProgress] = useState({ position: 0, duration: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(audioService.getProgress());
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval]);

  return progress;
};

export const useIsPlaying = () => {
  const [isPlaying, setIsPlaying] = useState({ playing: false });

  useEffect(() => {
    const updatePlayingState = () => {
      setIsPlaying(audioService.getIsPlaying());
    };

    audioService.addEventListener("PlaybackState", updatePlayingState);
    updatePlayingState();

    return () => {
      audioService.removeEventListener("PlaybackState", updatePlayingState);
    };
  }, []);

  return isPlaying;
};

export const useTrackPlayerEvents = (events: string[], callback: Function) => {
  useEffect(() => {
    events.forEach((event) => {
      audioService.addEventListener(event, callback);
    });

    return () => {
      events.forEach((event) => {
        audioService.removeEventListener(event, callback);
      });
    };
  }, [events, callback]);
};

export const useActiveTrack = () => {
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);

  useEffect(() => {
    const updateActiveTrack = () => {
      setActiveTrack(audioService.getActiveTrack());
    };

    audioService.addEventListener("PlaybackActiveTrackChanged", updateActiveTrack);
    updateActiveTrack();

    return () => {
      audioService.removeEventListener("PlaybackActiveTrackChanged", updateActiveTrack);
    };
  }, []);

  return activeTrack;
};

export const useCanSkip = () => {
  const [canSkipNext, setCanSkipNext] = useState(false);
  const [canSkipPrevious, setCanSkipPrevious] = useState(false);

  useEffect(() => {
    const updateSkipCapabilities = () => {
      setCanSkipNext(audioService.canSkipToNext());
      setCanSkipPrevious(audioService.canSkipToPrevious());
    };

    // Update on queue or track changes
    audioService.addEventListener("PlaybackActiveTrackChanged", updateSkipCapabilities);
    audioService.addEventListener("RemoteNext", updateSkipCapabilities);
    audioService.addEventListener("RemotePrevious", updateSkipCapabilities);
    updateSkipCapabilities();

    return () => {
      audioService.removeEventListener(
        "PlaybackActiveTrackChanged",
        updateSkipCapabilities
      );
      audioService.removeEventListener("RemoteNext", updateSkipCapabilities);
      audioService.removeEventListener("RemotePrevious", updateSkipCapabilities);
    };
  }, []);

  return { canSkipNext, canSkipPrevious };
};

export const Event = {
  PlaybackState: "PlaybackState",
  PlaybackError: "PlaybackError",
  PlaybackActiveTrackChanged: "PlaybackActiveTrackChanged",
  RemotePlay: "RemotePlay",
  RemotePause: "RemotePause",
  RemoteStop: "RemoteStop",
  RemoteNext: "RemoteNext",
  RemotePrevious: "RemotePrevious",
};
