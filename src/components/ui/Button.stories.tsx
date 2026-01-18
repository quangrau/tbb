import type { ComponentProps } from "react";
import { Button } from "./Button";

type Args = ComponentProps<typeof Button>;

export default {
  title: "UI/Button",
  component: Button,
  args: {
    children: "Button",
  },
};

export const Primary = {
  args: { variant: "primary", children: "Primary" } satisfies Partial<Args>,
};

export const Secondary = {
  args: { variant: "secondary", children: "Secondary" } satisfies Partial<Args>,
};

export const Outline = {
  args: { variant: "outline", children: "Outline" } satisfies Partial<Args>,
};

export const Disabled = {
  args: { disabled: true, children: "Disabled" } satisfies Partial<Args>,
};

export const FullWidth = {
  args: { fullWidth: true, children: "Full width" } satisfies Partial<Args>,
};

export const Sizes = {
  render: () => (
    <div className="space-y-3 max-w-sm">
      <Button size="sm" fullWidth>
        Small
      </Button>
      <Button size="md" fullWidth>
        Medium
      </Button>
      <Button size="lg" fullWidth>
        Large
      </Button>
    </div>
  ),
};

