import { Card } from "./Card";

export default {
  title: "UI/Card",
  component: Card,
};

export const Default = {
  render: () => (
    <div className="max-w-md">
      <Card>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-display text-bb-ink">
            Card Title
          </h2>
          <p className="text-bb-muted font-bold">
            Use cards to group related content.
          </p>
        </div>
      </Card>
    </div>
  ),
};

export const Nested = {
  render: () => (
    <div className="max-w-md space-y-4">
      <Card>
        <div className="space-y-4">
          <p className="text-bb-ink font-bold">Parent card</p>
          <Card className="shadow-bb-neo-sm">
            <p className="text-bb-muted font-bold">Nested card</p>
          </Card>
        </div>
      </Card>
    </div>
  ),
};

