import { avatarColor, initials } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Avatar({
  name,
  size = 32,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      title={name}
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-semibold text-white",
        avatarColor(name),
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
    >
      {initials(name)}
    </span>
  );
}

export function AvatarStack({
  names,
  max = 4,
  size = 28,
}: {
  names: string[];
  max?: number;
  size?: number;
}) {
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;
  return (
    <div className="flex items-center">
      {shown.map((n, i) => (
        <span
          key={`${n}-${i}`}
          className="rounded-full ring-2 ring-card"
          style={{ marginLeft: i ? -8 : 0, zIndex: max - i }}
        >
          <Avatar name={n} size={size} />
        </span>
      ))}
      {extra > 0 && (
        <span
          className="grid place-items-center rounded-full bg-panel text-xs font-semibold text-muted ring-2 ring-card"
          style={{ width: size, height: size, marginLeft: -8 }}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}
