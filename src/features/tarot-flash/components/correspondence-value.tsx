import { Icon } from "@/components/design-system/icon";
import { planetIcons, zodiacIcons } from "../data/correspondence-icons";
import { type correspondenceFields, elements } from "../data/correspondences";
import { ElementSymbol } from "./element-symbol";

export function CorrespondenceValue({
  field,
  value,
  iconOnly = false,
}: {
  field: (typeof correspondenceFields)[number]["id"];
  value: string;
  iconOnly?: boolean;
}) {
  const name = value.toLowerCase();
  const isElement =
    field === "element" && elements.some((element) => element.toLowerCase() === name);
  const icons = field === "planet" ? planetIcons : zodiacIcons;
  const icon = field !== "element" && Object.hasOwn(icons, name) ? icons[name] : undefined;
  const hasIcon = isElement || Boolean(icon);
  return (
    <span className="tarot-correspondence-value" title={value}>
      {Boolean(isElement) && <ElementSymbol element={value} />}
      {icon !== undefined && <Icon className="tarot-correspondence-symbol" icon={icon} />}
      <span className={iconOnly && hasIcon ? "visually-hidden" : undefined}>{value}</span>
    </span>
  );
}
