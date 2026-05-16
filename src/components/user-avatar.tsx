import { cn } from "@/lib/utils";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

type UserAvatarProps = {
  name: string;
  className?: string;
  size?: "sm" | "md";
};

export function UserAvatar({ name, className, size = "md" }: UserAvatarProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary",
        size === "sm" ? "size-7 text-[10px]" : "size-9 text-xs",
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
