import { createFileRoute } from "@tanstack/react-router";
import { TimerLayout } from "@/features/timer/screens/timer-layout/timer-layout";

export const Route = createFileRoute("/_timer")({ component: TimerLayout });
