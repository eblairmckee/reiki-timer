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

type Props = {
  summary?: { content: ReactNode; timeline: ReactNode };
  mode: "setup" | "running" | "paused" | "save";
  hidden: boolean;
  editing: boolean;
  canResume: boolean;
  primaryRef: RefObject<HTMLButtonElement | null>;
  finishRef: RefObject<HTMLButtonElement | null>;
  onStart: (restart: boolean) => void;
  onPause: () => void;
  onFinish: () => void;
  onEdit: () => void;
  onSave: () => void;
};
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
    label: "Restart timer",
    content: <RestartIcon />,
    activate: () => onStart(true),
  };
  const actions = {
    setup: { label: "Start timer", content: <PlayIcon />, activate: () => onStart(true) },
    running: { label: "Pause timer", content: <PauseIcon />, activate: onPause },
    paused: canResume
      ? { label: "Resume timer", content: <PlayIcon />, activate: () => onStart(false) }
      : restart,
    save: { label: "Save timer", content: <PlayIcon />, activate: onSave },
  };
  const action = actions[mode];
  const primary = (
    <Button
      ref={primaryRef}
      mode="frost"
      asIcon
      hint={mode === "setup"}
      disabled={hidden}
      aria-label={action.label}
      title={action.label}
      onClick={action.activate}
    >
      {action.content}
    </Button>
  );
  const group = summary
    ? {
        variant: "summary" as const,
        summary: summary.content,
        details: { label: "Timer overview", content: summary.timeline },
      }
    : {
        variant: "actions" as const,
        actions: mode === "paused" && (
          <>
            <Button
              ref={finishRef}
              mode="frost"
              asIcon
              aria-label="Finish timer"
              title="Finish timer"
              aria-haspopup="dialog"
              onClick={onFinish}
            >
              <FinishIcon />
            </Button>
            <ButtonGroupSeparator aria-hidden="true" />
            <Button mode="frost" asIcon aria-label="Edit timer" title="Edit timer" onClick={onEdit}>
              <EditIcon />
            </Button>
          </>
        ),
      };
  return (
    <motion.fieldset
      className="timer-hud"
      aria-label="Timer controls"
      inert={hidden}
      aria-hidden={hidden}
      initial={false}
      animate={{ opacity: hidden ? 0 : 1 }}
      transition={reduced ? { duration: 0 } : hidden ? sceneMotion.exit : sceneMotion.enter}
    >
      <ButtonGroup
        {...group}
        primary={
          editing && (mode === "save" || (mode === "paused" && canResume)) ? (
            <ActionGroup
              label={mode === "save" ? "Timer actions" : "Playback actions"}
              primary={primary}
              actions={
                <Button
                  mode="frost"
                  asIcon
                  aria-label={restart.label}
                  title={restart.label}
                  onClick={restart.activate}
                >
                  {restart.content}
                </Button>
              }
            />
          ) : (
            primary
          )
        }
      />
    </motion.fieldset>
  );
}
