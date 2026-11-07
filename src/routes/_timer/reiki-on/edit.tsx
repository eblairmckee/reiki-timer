import { createFileRoute } from "@tanstack/react-router";
import { TimerEditor } from "@/features/timer/screens/timer-editor/timer-editor";

export const Route = createFileRoute("/_timer/reiki-on/edit")({ component: TimerEditor });
