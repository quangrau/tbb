import type { ComponentProps } from "react";
import { Input } from "./Input";

type Args = ComponentProps<typeof Input>;

export default {
  title: "UI/Input",
  component: Input,
  args: {
    label: "Your Nickname",
    placeholder: "Enter your name",
  },
};

export const Default = {
  args: {} satisfies Partial<Args>,
};

export const WithValue = {
  args: { defaultValue: "Alicia" } satisfies Partial<Args>,
};

export const WithError = {
  args: {
    defaultValue: "A name that is too long",
    error: "Nickname must be 20 characters or less",
  } satisfies Partial<Args>,
};

