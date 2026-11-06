import { createFileRoute } from "@tanstack/react-router";
import { TimerLayout } from "../../features/timer/timer-screen";

export const Route = createFileRoute("/_timer")({ component: TimerLayout });
