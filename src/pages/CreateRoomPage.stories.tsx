import { useEffect } from "react";
import CreateRoomPage from "./CreateRoomPage";

function clickButtonByText(text: string): void {
  const buttons = Array.from(document.querySelectorAll("button"));
  for (const button of buttons) {
    if ((button.textContent ?? "").trim() === text) {
      button.click();
      return;
    }
  }
}

export default {
  title: "Screens/Create Room",
  component: CreateRoomPage,
};

export const Default = {};

function SettingsExpandedStory() {
  useEffect(() => {
    clickButtonByText("Challenge Settings");
  }, []);
  return <CreateRoomPage />;
}

export const SettingsExpanded = {
  render: () => <SettingsExpandedStory />,
};

function ValidationErrorStory() {
  useEffect(() => {
    clickButtonByText("Create Room");
  }, []);
  return <CreateRoomPage />;
}

export const ValidationError = {
  render: () => <ValidationErrorStory />,
};
