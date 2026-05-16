"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

async function downloadExport(format: "csv" | "xlsx") {
  const response = await fetch(`/api/admin/export?format=${format}`);

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "Export failed");
  }

  const blob = await response.blob();
  const date = new Date().toISOString().slice(0, 10);
  const ext = format === "xlsx" ? "xlsx" : "csv";
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `nucleus-export-${date}.${ext}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function ExportButton() {
  const [exporting, setExporting] = useState<"csv" | "xlsx" | null>(null);

  const handleExport = async (format: "csv" | "xlsx") => {
    setExporting(format);

    try {
      await downloadExport(format);
      toast.success(`Report downloaded (${format.toUpperCase()})`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Export failed");
    } finally {
      setExporting(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export report</CardTitle>
        <CardDescription>
          Goals, targets, quarterly achievements, and scores for all employees.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={() => handleExport("csv")}
          disabled={exporting !== null}
        >
          <Download className="size-4" />
          {exporting === "csv" ? "Exporting…" : "Download CSV"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleExport("xlsx")}
          disabled={exporting !== null}
        >
          <Download className="size-4" />
          {exporting === "xlsx" ? "Exporting…" : "Download Excel"}
        </Button>
      </CardContent>
    </Card>
  );
}
