import type { ComponentProps } from "react";
import { Timer } from "./Timer";

type Args = ComponentProps<typeof Timer>;

export default {
  title: "UI/Timer",
  component: Timer,
  args: {
    maxSeconds: 10,
    seconds: 10,
  },
};

export const Full = {
  args: { seconds: 10 } satisfies Partial<Args>,
};

export const Mid = {
  args: { seconds: 5 } satisfies Partial<Args>,
};

export const Urgent = {
  args: { seconds: 3 } satisfies Partial<Args>,
};

export const Zero = {
  args: { seconds: 0 } satisfies Partial<Args>,
};

