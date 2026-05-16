import { cn } from "@/lib/utils";

const ROLE_STYLES = {
  employee: "bg-sky-500/15 text-sky-800 dark:text-sky-300 border-sky-500/30",
  manager: "bg-violet-500/15 text-violet-800 dark:text-violet-300 border-violet-500/30",
  admin: "bg-amber-500/15 text-amber-900 dark:text-amber-200 border-amber-500/30",
} as const;

export type UserRole = keyof typeof ROLE_STYLES;

type RoleBadgeProps = {
  role: UserRole;
  className?: string;
};

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const label = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        ROLE_STYLES[role],
        className
      )}
    >
      {label}
    </span>
  );
}
