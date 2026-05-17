import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use service role key to bypass RLS and update other employees' checkins
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const { updates, quarter } = await request.json();

    if (!updates || !Array.isArray(updates) || !quarter) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    for (const update of updates) {
      const { goal_id, achievement, achievement_date, status, score, submitted_at } = update;

      // 1. Look up the goal being checked in
      const { data: goal, error: goalError } = await supabase
        .from("goals")
        .select("shared_goal_id, is_primary_owner")
        .eq("id", goal_id)
        .single();

      if (goalError || !goal) {
        console.error(`Goal not found or error for goal_id ${goal_id}:`, goalError);
        continue;
      }

      // 2. Check if it has a shared_goal_id and is_primary_owner = true
      if (goal.shared_goal_id && goal.is_primary_owner) {
        // 3. Find all other goal rows with the same shared_goal_id (the non-primary copies)
        const { data: otherGoals, error: otherGoalsError } = await supabase
          .from("goals")
          .select("id, user_id")
          .eq("shared_goal_id", goal.shared_goal_id)
          .eq("is_primary_owner", false);

        if (otherGoalsError || !otherGoals || otherGoals.length === 0) {
          continue;
        }

        // 4. For each of those goals, upsert a quarterly_updates row
        for (const otherGoal of otherGoals) {
          const payload = {
            goal_id: otherGoal.id,
            quarter,
            achievement,
            achievement_date,
            status,
            score,
            submitted_at,
          };

          // Try to find if an update already exists for this quarter
          const { data: existingUpdate } = await supabase
            .from("quarterly_updates")
            .select("id")
            .eq("goal_id", otherGoal.id)
            .eq("quarter", quarter)
            .maybeSingle();

          if (existingUpdate) {
            await supabase
              .from("quarterly_updates")
              .update(payload)
              .eq("id", existingUpdate.id);
          } else {
            await supabase
              .from("quarterly_updates")
              .insert(payload);
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Error in sync checkins:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
