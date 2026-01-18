import "../src/index.css";
import React from "react";
import { MemoryRouter } from "react-router-dom";

export default {
  decorators: [
    (Story: React.ComponentType) => {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.removeItem("bb_active_room_id");
        localStorage.removeItem("bb_active_room_code");
      }

      return React.createElement(
        MemoryRouter,
        { initialEntries: ["/"] },
        React.createElement(
          "div",
          { className: "min-h-screen bg-bb-bg text-bb-ink p-4" },
          React.createElement(Story),
        ),
      );
    },
  ],
  parameters: {
    layout: "fullscreen",
    backgrounds: {
      default: "bb-bg",
      values: [
        { name: "bb-bg", value: "#FBF8F2" },
        { name: "white", value: "#FFFFFF" },
      ],
    },
  },
};
