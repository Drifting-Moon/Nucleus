-- Add shared goal sync columns
ALTER TABLE "public"."goals"
ADD COLUMN "shared_goal_id" uuid,
ADD COLUMN "is_primary_owner" boolean;
