import { render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { Timeline } from "@/components/molecules/timeline";
import { defaultConfig } from "../model/timer-config";
import { timerTimeline } from "../model/timer-timeline";
import { timelineItems } from "./timeline-items";

test("the timeline marks each sounding boundary, including when every change rings", () => {
  const config = { ...defaultConfig, chimeOnSessionEnd: true, chimes: true };
  const { rerender } = render(
    <Timeline heading="Session timeline" items={timelineItems(timerTimeline(config))} />
  );
  const markers = () => within(screen.getByRole("list", { name: "Session timeline" }));
  const rows = markers().getAllByRole("listitem");
  expect(rows[0].textContent).toContain("Sacral");
  expect(rows[0].textContent).not.toContain("0:00");
  expect(markers().getAllByText("Chime")).toHaveLength(1);
  expect(rows.at(-1)?.querySelector(".timeline-marker svg")).toBeTruthy();
  expect(rows.at(-1)?.querySelector(".timeline-dot")).toBeNull();
  rerender(
    <Timeline
      heading="Session timeline"
      items={timelineItems(timerTimeline({ ...config, chimeOnChange: true }))}
    />
  );
  for (const row of markers().getAllByRole("listitem")) {
    expect(within(row).getByText("Chime")).toBeTruthy();
    expect(row.querySelector(".timeline-marker svg")).toBeTruthy();
  }
  rerender(
    <Timeline heading="Session timeline" items={timelineItems(timerTimeline(defaultConfig))} />
  );
  expect(markers().queryByText("Chime")).toBeNull();
});
