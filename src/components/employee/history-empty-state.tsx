import { History } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function HistoryEmptyState() {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="size-5 text-muted-foreground" />
          No history yet
        </CardTitle>
        <CardDescription>
          After your manager leaves feedback or you submit check-ins, they will appear here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Complete goal approval and submit your first quarterly check-in to build your record.
        </p>
      </CardContent>
    </Card>
  );
}
