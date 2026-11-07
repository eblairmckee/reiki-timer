import { createFileRoute } from "@tanstack/react-router";
import { TimerPlayback } from "@/features/timer/screens/timer-playback/timer-playback";

export const Route = createFileRoute("/_timer/reiki-on/")({ component: TimerPlayback });
