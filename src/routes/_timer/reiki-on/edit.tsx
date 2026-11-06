import { createFileRoute } from "@tanstack/react-router";
import { TimerEditor } from "../../../features/timer/timer-editor";

export const Route = createFileRoute("/_timer/reiki-on/edit")({ component: TimerEditor });
