"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, AlertTriangle, Send } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";

export type AnytimeGoalOption = {
  id: string;
  title: string | null;
};

type AnytimeFeedbackFormProps = {
  employeeId: string;
  managerId: string;
  goals: AnytimeGoalOption[];
};

export function AnytimeFeedbackForm({ employeeId, managerId, goals }: AnytimeFeedbackFormProps) {
  const [selectedGoalId, setSelectedGoalId] = useState<string>("general");
  const [feedbackText, setFeedbackText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [tableMissing, setTableMissing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!feedbackText.trim()) {
      toast.error("Feedback text cannot be empty.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.from("anytime_feedback").insert({
        employee_id: employeeId,
        manager_id: managerId,
        goal_id: selectedGoalId === "general" ? null : selectedGoalId,
        feedback_text: feedbackText.trim(),
      });

      if (error) {
        if (error.code === "42P01") {
          setTableMissing(true);
          toast.error("Database table missing. Please run migrations.");
        } else {
          toast.error(error.message || "Failed to submit feedback.");
        }
      } else {
        toast.success("Anytime feedback sent to employee timeline!");
        setFeedbackText("");
        setSelectedGoalId("general");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-primary/10 shadow-sm ring-1 ring-border/50 bg-gradient-to-br from-card to-muted/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="size-5 text-primary" />
          Anytime Feedback
        </CardTitle>
        <CardDescription>
          Drop a feedback note outside standard review cycles. This will instantly appear in the employee's history timeline.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {tableMissing ? (
          <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-900 dark:text-red-200">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-600" />
            <div>
              <p className="font-semibold">Migration Required</p>
              <p className="mt-1 text-muted-foreground leading-relaxed">
                The `anytime_feedback` table does not exist in the database. Please execute the SQL migration script:
              </p>
              <pre className="mt-2 overflow-x-auto rounded bg-slate-900 p-2 text-xs text-slate-100 font-mono">
                {`supabase/migrations/202605170003_continuous_feedback.sql`}
              </pre>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="goal-select" className="text-sm font-medium">
                Link to Goal (Optional)
              </label>
              <select
                id="goal-select"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={selectedGoalId}
                onChange={(e) => setSelectedGoalId(e.target.value)}
              >
                <option value="general">General Feedback (Not tied to a goal)</option>
                {goals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    Goal: {goal.title || "Untitled Goal"}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="feedback-text" className="text-sm font-medium">
                Feedback Comment
              </label>
              <textarea
                id="feedback-text"
                rows={3}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Write constructive coaching, observations, or positive feedback..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={submitting} className="gap-2">
                <Send className="size-4" />
                {submitting ? "Sending..." : "Submit Anytime Feedback"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
