import { motion } from "motion/react";
import type { ReactNode, RefObject } from "react";
import {
  EditIcon,
  FinishIcon,
  PauseIcon,
  PlayIcon,
  RestartIcon,
} from "@/components/atoms/timer-icons";
import { ActionGroup, ButtonGroup } from "@/components/molecules/button-group";
import { ButtonGroupSeparator } from "@/components/ui/button-group";
import { Button } from "../../components/ui/button";
import { sceneMotion } from "../../components/ui/shared/motion";
import { useReducedMotion } from "../../components/ui/shared/use-reduced-motion";

interface Props {
  canResume: boolean;
  editing: boolean;
  finishRef: RefObject<HTMLButtonElement | null>;
  hidden: boolean;
  mode: "setup" | "running" | "paused" | "save";
  onEdit: () => void;
  onFinish: () => void;
  onPause: () => void;
  onSave: () => void;
  onStart: (restart: boolean) => void;
  primaryRef: RefObject<HTMLButtonElement | null>;
  summary?: { content: ReactNode; timeline: ReactNode };
}
export function TimerHud({
  summary,
  mode,
  hidden,
  editing,
  canResume,
  primaryRef,
  finishRef,
  onStart,
  onPause,
  onFinish,
  onEdit,
  onSave,
}: Props) {
  const reduced = useReducedMotion();
  const restart = {
    activate: () => onStart(true),
    content: <RestartIcon />,
    label: "Restart timer",
  };
  const actions = {
    paused: canResume
      ? { activate: () => onStart(false), content: <PlayIcon />, label: "Resume timer" }
      : restart,
    running: { activate: onPause, content: <PauseIcon />, label: "Pause timer" },
    save: { activate: onSave, content: <PlayIcon />, label: "Save timer" },
    setup: { activate: () => onStart(true), content: <PlayIcon />, label: "Start timer" },
  };
  const action = actions[mode];
  const primary = (
    <Button
      aria-label={action.label}
      asIcon
      disabled={hidden}
      hint={mode === "setup"}
      mode="frost"
      onClick={action.activate}
      ref={primaryRef}
      title={action.label}
    >
      {action.content}
    </Button>
  );
  const group = summary
    ? {
        details: { content: summary.timeline, label: "Timer overview" },
        summary: summary.content,
        variant: "summary" as const,
      }
    : {
        actions: mode === "paused" && (
          <>
            <Button
              aria-haspopup="dialog"
              aria-label="Finish timer"
              asIcon
              mode="frost"
              onClick={onFinish}
              ref={finishRef}
              title="Finish timer"
            >
              <FinishIcon />
            </Button>
            <ButtonGroupSeparator aria-hidden="true" />
            <Button aria-label="Edit timer" asIcon mode="frost" onClick={onEdit} title="Edit timer">
              <EditIcon />
            </Button>
          </>
        ),
        variant: "actions" as const,
      };
  const transition = hidden ? sceneMotion.exit : sceneMotion.enter;
  return (
    <motion.fieldset
      animate={{ opacity: hidden ? 0 : 1 }}
      aria-hidden={hidden}
      aria-label="Timer controls"
      className="timer-hud"
      inert={hidden}
      initial={false}
      transition={reduced ? { duration: 0 } : transition}
    >
      <ButtonGroup
        {...group}
        primary={
          editing && (mode === "save" || (mode === "paused" && canResume)) ? (
            <ActionGroup
              actions={
                <Button
                  aria-label={restart.label}
                  asIcon
                  mode="frost"
                  onClick={restart.activate}
                  title={restart.label}
                >
                  {restart.content}
                </Button>
              }
              label={mode === "save" ? "Timer actions" : "Playback actions"}
              primary={primary}
            />
          ) : (
            primary
          )
        }
      />
    </motion.fieldset>
  );
}
