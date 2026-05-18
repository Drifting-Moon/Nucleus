"use client";

import { useEffect, useState } from "react";
import type { TeamMemberSummary } from "@/components/manager/team-overview";
import { TeamOverview } from "@/components/manager/team-overview";
import { TeamCheckinOverview } from "@/components/manager/team-checkin-overview";
import type { CheckinQuarter } from "@/lib/get-active-window";
import type { TeamCheckinMember } from "@/components/manager/team-checkin-overview";
import { TeamCheckinHeatmap } from "@/components/manager/charts/team-checkin-heatmap";
import { TeamCheckinPipelineChart } from "@/components/manager/charts/team-checkin-pipeline-chart";
import { TeamGoalStatusChart } from "@/components/manager/charts/team-goal-status-chart";
import { TeamMemberScoresChart } from "@/components/manager/charts/team-member-scores-chart";
import type {
  CheckinPipelineRow,
  HeatmapRow,
  MemberScoreChartRow,
  StatusChartRow,
} from "@/lib/manager/team-chart-data";
import { cn } from "@/lib/utils";
import { ArchitectureDiagramCard } from "@/components/shared/architecture-diagram-card";


const TABS = [
  { id: "goals", label: "Goal Review" },
  { id: "checkins", label: "Quarterly Feedback" },
] as const;

type TabId = (typeof TABS)[number]["id"];

type ManagerTabsProps = {
  members: TeamMemberSummary[];
  activeQuarter: CheckinQuarter | null;
  checkinMembers: TeamCheckinMember[] | null;
  teamAvgScore?: number | null;
  goalStatusChart: StatusChartRow[];
  memberScoreChart: MemberScoreChartRow[];
  checkinPipelineChart: CheckinPipelineRow[];
  heatmapRows: HeatmapRow[];
  heatmapMaxColumns: number;
};

export function ManagerTabs({
  members,
  activeQuarter,
  checkinMembers,
  teamAvgScore = null,
  goalStatusChart,
  memberScoreChart,
  checkinPipelineChart,
  heatmapRows,
  heatmapMaxColumns,
}: ManagerTabsProps) {
  const [active, setActive] = useState<TabId>("goals");

  useEffect(() => {
    const handleSwitch = (e: Event) => {
      const customEvent = e as CustomEvent<TabId>;
      if (customEvent.detail && TABS.some((t) => t.id === customEvent.detail)) {
        setActive(customEvent.detail);
      }
    };
    window.addEventListener("switch-tab", handleSwitch);
    return () => window.removeEventListener("switch-tab", handleSwitch);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 border-b pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              active === tab.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="border-b pb-3 pt-1">
        <p className="text-sm text-muted-foreground font-light tracking-wide">
          {active === "goals" && "Review submitted goal sheets, track employee goals statuses, and clear approval backlogs."}
          {active === "checkins" && "Submit and manage quarterly progress check-in ratings and constructive feedback comments."}
        </p>
      </div>

      {active === "goals" && (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <TeamGoalStatusChart data={goalStatusChart} />
            <TeamMemberScoresChart data={memberScoreChart} activeQuarter={activeQuarter} />
          </div>
          <TeamOverview members={members} teamAvgScore={teamAvgScore} />
          
          <ArchitectureDiagramCard
            lightSrc="/arch/white-manager.png"
            darkSrc="/arch/black-manager.png"
            title="Manager Review & Verification Architecture"
            description="Interactive visual telemetry mapping the manager validation layer, weight adjustment rules, and return-for-rework workflow logic."
          />
        </div>
      )}

      {active === "checkins" &&
        (activeQuarter && checkinMembers ? (
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <TeamCheckinPipelineChart data={checkinPipelineChart} quarter={activeQuarter} />
              <TeamCheckinHeatmap
                rows={heatmapRows}
                maxColumns={heatmapMaxColumns}
                quarter={activeQuarter}
              />
            </div>
            <TeamCheckinOverview quarter={activeQuarter} members={checkinMembers} />
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            <p className="font-medium">No active check-in window</p>
            <p className="mt-2">
              Quarterly feedback is available only while a Q1, Q2, Q3, or Annual window is open.
            </p>
          </div>
        ))}
    </div>
  );
}
