import type { ReactNode, RefObject } from "react";
import { EditIcon, ExitIcon, PauseIcon, PlayIcon, ResetIcon } from "@/components/atoms/icons";
import { Button } from "@/components/design-system/button";
import { ButtonGroupSeparator } from "@/components/design-system/button-group";
import { ControlSurface } from "@/components/organisms/control-surface";

import "./style.css";

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
  const restart = {
    activate: () => onStart(true),
    content: <ResetIcon />,
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
            <ExitIcon />
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
  return (
    <ControlSurface
      actions={extraActions}
      details={summary ? { content: summary.timeline, label: "Timer overview" } : undefined}
      groupLabel={summary && editing ? editingGroupLabel : "Session actions"}
      hidden={hidden}
      label="Timer controls"
      summary={summary?.content}
    >
      {primary}
    </ControlSurface>
  );
}
