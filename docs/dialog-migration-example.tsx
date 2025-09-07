// Example of how to replace Alert.alert with useDialog

// Before (using native Alert):
import { Alert } from "react-native";

// After (using useDialog from React Native Paper):
import { useDialog } from "@/hooks/useDialog";

const showError = () => {
  Alert.alert("Error", "Something went wrong", [{ text: "OK" }]);
};

const showSuccess = () => {
  Alert.alert("Success", "Operation completed", [{ text: "OK" }]);
};

const showConfirmation = () => {
  Alert.alert("Confirm", "Are you sure?", [
    { text: "Cancel", style: "cancel" },
    { text: "OK", onPress: () => console.log("Confirmed") },
  ]);
};

const showPrompt = () => {
  Alert.prompt(
    "Enter Name",
    "Please enter your name:",
    [
      { text: "Cancel", style: "cancel" },
      { text: "OK", onPress: (text) => console.log("Entered:", text) },
    ],
    "plain-text"
  );
};

const Component = () => {
  const { showAlert, showPrompt } = useDialog();

  const showError = () => {
    showAlert("Error", "Something went wrong");
  };

  const showSuccess = () => {
    showAlert("Success", "Operation completed");
  };

  const showConfirmation = () => {
    showAlert("Confirm", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "OK", onPress: () => console.log("Confirmed") },
    ]);
  };

  const showPromptDialog = () => {
    showPrompt(
      "Enter Name",
      "Please enter your name:",
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: (text) => console.log("Entered:", text) },
      ],
      "Enter your name here..."
    );
  };

  return (
    <></>
    // Your component JSX
  );
};

export default Component;
