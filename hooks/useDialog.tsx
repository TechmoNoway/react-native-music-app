import React, { createContext, ReactNode, useContext, useState } from "react";
import { Button, Dialog, Portal, Text, TextInput } from "react-native-paper";

interface DialogAction {
  text: string;
  onPress?: (value?: string) => void;
  style?: "default" | "cancel" | "destructive";
}

interface DialogState {
  visible: boolean;
  title: string;
  message: string;
  actions: DialogAction[];
  type: "alert" | "prompt";
  promptValue?: string;
  onPromptChange?: (value: string) => void;
  placeholder?: string;
}

interface DialogContextType {
  showAlert: (title: string, message: string, actions?: DialogAction[]) => void;
  showPrompt: (
    title: string,
    message: string,
    actions?: DialogAction[],
    placeholder?: string,
    defaultValue?: string
  ) => void;
  hideDialog: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dialogState, setDialogState] = useState<DialogState>({
    visible: false,
    title: "",
    message: "",
    actions: [],
    type: "alert",
  });

  const showAlert = (
    title: string,
    message: string,
    actions: DialogAction[] = [{ text: "OK" }]
  ) => {
    setDialogState({
      visible: true,
      title,
      message,
      actions,
      type: "alert",
    });
  };

  const showPrompt = (
    title: string,
    message: string,
    actions: DialogAction[] = [{ text: "Cancel", style: "cancel" }, { text: "OK" }],
    placeholder = "",
    defaultValue = ""
  ) => {
    setDialogState({
      visible: true,
      title,
      message,
      actions,
      type: "prompt",
      promptValue: defaultValue,
      placeholder,
    });
  };

  const hideDialog = () => {
    setDialogState((prev) => ({ ...prev, visible: false }));
  };

  const handlePromptChange = (value: string) => {
    setDialogState((prev) => ({ ...prev, promptValue: value }));
  };

  const handleActionPress = (action: DialogAction) => {
    if (action.onPress) {
      if (dialogState.type === "prompt") {
        action.onPress(dialogState.promptValue || "");
      } else {
        action.onPress();
      }
    }

    hideDialog();
  };

  return (
    <DialogContext.Provider value={{ showAlert, showPrompt, hideDialog }}>
      {children}

      <Portal>
        <Dialog visible={dialogState.visible} onDismiss={hideDialog}>
          <Dialog.Title>{dialogState.title}</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">{dialogState.message}</Text>
            {dialogState.type === "prompt" && (
              <TextInput
                value={dialogState.promptValue}
                onChangeText={handlePromptChange}
                placeholder={dialogState.placeholder}
                mode="outlined"
                style={{ marginTop: 16 }}
                autoFocus
              />
            )}
          </Dialog.Content>
          <Dialog.Actions>
            {dialogState.actions.map((action, index) => (
              <Button
                key={index}
                onPress={() => handleActionPress(action)}
                mode={action.style === "cancel" ? "outlined" : "contained"}
                textColor={
                  action.style === "destructive"
                    ? "#f44336"
                    : action.style === "cancel"
                      ? "#666"
                      : undefined
                }
              >
                {action.text}
              </Button>
            ))}
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
};
