import React, { createContext, useContext, useState } from "react";
import { TrackOptionsModal } from "./TrackOptionsModal";

interface ModalContextType {
  showTrackOptions: boolean;
  openTrackOptions: (
    trackTitle: string,
    onAddToLiked: () => void,
    onAddToPlaylist: () => void
  ) => void;
  closeTrackOptions: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within ModalProvider");
  }
  return context;
};

interface ModalProviderProps {
  children: React.ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [showTrackOptions, setShowTrackOptions] = useState(false);
  const [modalProps, setModalProps] = useState<{
    trackTitle: string;
    onAddToLiked: () => void;
    onAddToPlaylist: () => void;
  } | null>(null);

  const openTrackOptions = (
    trackTitle: string,
    onAddToLiked: () => void,
    onAddToPlaylist: () => void
  ) => {
    setModalProps({ trackTitle, onAddToLiked, onAddToPlaylist });
    setShowTrackOptions(true);
  };

  const closeTrackOptions = () => {
    setShowTrackOptions(false);
    setModalProps(null);
  };

  return (
    <ModalContext.Provider
      value={{
        showTrackOptions,
        openTrackOptions,
        closeTrackOptions,
      }}
    >
      {children}
      {modalProps && (
        <TrackOptionsModal
          visible={showTrackOptions}
          onClose={closeTrackOptions}
          trackTitle={modalProps.trackTitle}
          onAddToLiked={modalProps.onAddToLiked}
          onAddToPlaylist={modalProps.onAddToPlaylist}
        />
      )}
    </ModalContext.Provider>
  );
};
