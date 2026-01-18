import { useState } from "react";
import { DropdownMenu } from "./DropdownMenu";

export default {
  title: "UI/DropdownMenu",
  component: DropdownMenu,
};

function ExampleDropdownMenu({
  align,
}: {
  align: "left" | "right" | "center";
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-10 flex justify-center">
      <DropdownMenu
        open={open}
        onOpenChange={setOpen}
        align={align}
        panelClassName="w-56"
        trigger={
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className={`px-3 py-2 rounded-full text-sm font-bold transition-colors cursor-pointer border-2 border-bb-ink ${
              open
                ? "text-bb-ink bg-bb-secondary"
                : "text-bb-muted hover:text-bb-ink hover:bg-bb-secondary"
            }`}
          >
            Toggle
          </button>
        }
      >
        <a
          href="#"
          className="block px-3 py-2 text-sm font-bold transition-colors cursor-pointer hover:bg-bb-secondary first:rounded-t-bb-lg"
        >
          First item
        </a>
        <a
          href="#"
          className="block px-3 py-2 text-sm font-bold transition-colors cursor-pointer hover:bg-bb-secondary"
        >
          Middle item
        </a>
        <a
          href="#"
          className="block px-3 py-2 text-sm font-bold transition-colors cursor-pointer hover:bg-bb-secondary last:rounded-b-bb-lg"
        >
          Last item
        </a>
      </DropdownMenu>
    </div>
  );
}

export const AlignLeft = {
  render: () => <ExampleDropdownMenu align="left" />,
};

export const AlignRight = {
  render: () => <ExampleDropdownMenu align="right" />,
};

export const AlignCenter = {
  render: () => <ExampleDropdownMenu align="center" />,
};

