"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ZoomIn, ZoomOut, Maximize2, RefreshCw } from "lucide-react";

type ArchitectureDiagramCardProps = {
  lightSrc: string;
  darkSrc: string;
  title: string;
  description: string;
};

const ZOOM_OPTIONS = [50, 75, 100, 125, 150, 200];

export function ArchitectureDiagramCard({
  lightSrc,
  darkSrc,
  title,
  description,
}: ArchitectureDiagramCardProps) {
  const [zoom, setZoom] = useState<number>(100);

  const handleZoomIn = () => {
    const currentIndex = ZOOM_OPTIONS.indexOf(zoom);
    if (currentIndex < ZOOM_OPTIONS.length - 1) {
      setZoom(ZOOM_OPTIONS[currentIndex + 1]);
    }
  };

  const handleZoomOut = () => {
    const currentIndex = ZOOM_OPTIONS.indexOf(zoom);
    if (currentIndex > 0) {
      setZoom(ZOOM_OPTIONS[currentIndex - 1]);
    }
  };

  const handleReset = () => {
    setZoom(100);
  };

  return (
    <Card className="mt-6 border border-border/80 shadow-sm bg-card overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/10 bg-muted/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <CardTitle className="text-sm font-semibold tracking-wide text-foreground flex items-center gap-2">
            <Maximize2 className="h-4 w-4 text-primary" />
            {title}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {description}
          </CardDescription>
        </div>

        {/* Zoom Control Dropdown & Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleZoomOut}
            disabled={zoom === ZOOM_OPTIONS[0]}
            className="p-1.5 rounded border border-border hover:bg-muted text-muted-foreground disabled:opacity-40 transition-colors"
            title="Zoom Out"
            type="button"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>

          {/* Styled Select Dropdown */}
          <div className="relative">
            <select
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="appearance-none bg-background border border-border rounded px-2.5 py-1 pr-7 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              {ZOOM_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}%
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-muted-foreground border-l border-border/50">
              <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>

          <button
            onClick={handleZoomIn}
            disabled={zoom === ZOOM_OPTIONS[ZOOM_OPTIONS.length - 1]}
            className="p-1.5 rounded border border-border hover:bg-muted text-muted-foreground disabled:opacity-40 transition-colors"
            title="Zoom In"
            type="button"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 rounded border border-border hover:bg-muted text-muted-foreground transition-colors"
            title="Reset Zoom"
            type="button"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-4 md:p-6 bg-muted/5">
        {/* Dynamic Zoom Image Container */}
        <div className="relative w-full overflow-auto rounded-lg border border-border/40 bg-muted/20 p-4 flex justify-center items-center max-h-[600px] transition-all duration-300">
          <div
            className="transition-all duration-300 flex justify-center items-center"
            style={{ width: `${zoom}%`, minWidth: "100%" }}
          >
            {/* Light Theme Image */}
            <img
              src={lightSrc}
              alt={`${title} (Light)`}
              className="block dark:hidden max-w-full h-auto object-contain rounded-md transition-transform"
            />
            {/* Dark Theme Image */}
            <img
              src={darkSrc}
              alt={`${title} (Dark)`}
              className="hidden dark:block max-w-full h-auto object-contain rounded-md transition-transform"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
