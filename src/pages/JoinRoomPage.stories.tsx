import { useEffect } from "react";
import JoinRoomPage from "./JoinRoomPage";

function setInputValue(input: HTMLInputElement, value: string): void {
  const nativeSetter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set;
  nativeSetter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

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
  title: "Screens/Join Room",
  component: JoinRoomPage,
};

export const Default = {};

function MissingNicknameErrorStory() {
  useEffect(() => {
    const inputs = Array.from(document.querySelectorAll("input"));
    const roomCode = inputs.find(
      (el) => el.getAttribute("placeholder") === "XXXXXX",
    ) as HTMLInputElement | undefined;
    if (roomCode) setInputValue(roomCode, "ABC123");
    clickButtonByText("Join Room");
  }, []);
  return <JoinRoomPage />;
}

export const MissingNicknameError = {
  render: () => <MissingNicknameErrorStory />,
};
