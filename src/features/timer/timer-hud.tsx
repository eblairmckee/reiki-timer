import { motion } from "motion/react";
import type { ReactNode, RefObject } from "react";
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupSummary,
} from "@/components/design-system/button-group";
import { EditIcon, FinishIcon, PauseIcon, PlayIcon, RestartIcon } from "@/features/timer/icons";
import { Button } from "../../components/design-system/button";
import { motion as systemMotion } from "../../components/design-system/shared/motion";
import { useReducedMotion } from "../../components/design-system/shared/use-reduced-motion";

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
      disabled={hidden}
      iconOnly
      onClick={action.activate}
      ref={primaryRef}
      showActivationHint={mode === "setup"}
      title={action.label}
    >
      {action.content}
    </Button>
  );
  const showRestart = editing && (mode === "save" || (mode === "paused" && canResume));
  const showSessionActions = !summary && mode === "paused";
  const extraActions = (showRestart || showSessionActions) && (
    <>
      {showSessionActions === true && (
        <>
          <Button
            aria-haspopup="dialog"
            aria-label="Finish timer"
            iconOnly
            onClick={onFinish}
            ref={finishRef}
            title="Finish timer"
          >
            <FinishIcon />
          </Button>
          <ButtonGroupSeparator aria-hidden="true" />
          <Button aria-label="Edit timer" iconOnly onClick={onEdit} title="Edit timer">
            <EditIcon />
          </Button>
          {showRestart === true && <ButtonGroupSeparator aria-hidden="true" />}
        </>
      )}
      {showRestart === true && (
        <Button
          aria-label={restart.label}
          iconOnly
          onClick={restart.activate}
          title={restart.label}
        >
          {restart.content}
        </Button>
      )}
    </>
  );
  const editingGroupLabel = mode === "save" ? "Timer actions" : "Playback actions";
  const transition = hidden ? systemMotion.scene.exit : systemMotion.scene.enter;
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
      <ButtonGroupSummary
        details={summary ? { content: summary.timeline, label: "Timer overview" } : undefined}
        summary={summary?.content}
      >
        <ButtonGroup
          actions={extraActions}
          aria-label={summary && editing ? editingGroupLabel : "Session actions"}
          variant="expandable"
        >
          {primary}
        </ButtonGroup>
      </ButtonGroupSummary>
    </motion.fieldset>
  );
}
