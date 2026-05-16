/**
 * Maps raw Supabase/Postgres errors to user-friendly copy for toasts.
 */
export function mapSupabaseError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("violates check constraint") && lower.includes("weightage")) {
    return "Each goal must have weightage between 10% and 100%.";
  }

  if (lower.includes("violates check constraint")) {
    return "Some values are outside allowed limits. Check targets and weightage.";
  }

  if (lower.includes("duplicate key") || lower.includes("unique constraint")) {
    return "This record already exists. Refresh the page and try again.";
  }

  if (lower.includes("row-level security") || lower.includes("permission denied")) {
    return "You do not have permission to perform this action.";
  }

  if (lower.includes("jwt") || lower.includes("session") || lower.includes("not authenticated")) {
    return "Your session expired. Please sign in again.";
  }

  if (lower.includes("network") || lower.includes("fetch failed")) {
    return "Network error. Check your connection and try again.";
  }

  if (lower.includes("invalid input syntax")) {
    return "One or more fields has an invalid value. Check numbers and dates.";
  }

  return message;
}

/** Use with Sonner: `toast.error(getErrorMessage(error))` */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return mapSupabaseError(error.message);
  }
  if (typeof error === "string") {
    return mapSupabaseError(error);
  }
  if (error && typeof error === "object" && "message" in error) {
    const msg = (error as { message: unknown }).message;
    if (typeof msg === "string") {
      return mapSupabaseError(msg);
    }
  }
  return "Something went wrong. Please try again.";
}
