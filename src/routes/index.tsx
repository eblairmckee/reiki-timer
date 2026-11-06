import { createFileRoute } from "@tanstack/react-router";
import { TimerScreen } from "../features/timer/timer-screen";
export const Route = createFileRoute("/")({ component: TimerScreen });
