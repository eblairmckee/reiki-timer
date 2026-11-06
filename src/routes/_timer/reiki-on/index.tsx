import { createFileRoute } from "@tanstack/react-router";
import { TimerPlayback } from "../../../features/timer/timer-playback";

export const Route = createFileRoute("/_timer/reiki-on/")({ component: TimerPlayback });
