"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ZoomIn, ZoomOut, Maximize2, Minimize2, RefreshCw, X } from "lucide-react";

type ArchitectureDiagramCardProps = {
  lightSrc: string;
  darkSrc: string;
  title: string;
  description: string;
};

const ZOOM_OPTIONS = [50, 75, 100, 125, 150, 200, 300];

export function ArchitectureDiagramCard({
  lightSrc,
  darkSrc,
  title,
  description,
}: ArchitectureDiagramCardProps) {
  const [zoom, setZoom] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Disable body scroll when full-screen is open
  useEffect(() => {
    if (isFullscreen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isFullscreen]);

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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Reusable zoom control panel
  const renderControls = (isCompact = false) => (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={handleZoomOut}
        disabled={zoom === ZOOM_OPTIONS[0]}
        className="p-1.5 rounded border border-border hover:bg-muted text-muted-foreground disabled:opacity-40 transition-colors bg-background"
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
          className="appearance-none bg-background border border-border rounded px-2.5 py-1 pr-7 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
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
        className="p-1.5 rounded border border-border hover:bg-muted text-muted-foreground disabled:opacity-40 transition-colors bg-background"
        title="Zoom In"
        type="button"
      >
        <ZoomIn className="h-3.5 w-3.5" />
      </button>

      <button
        onClick={handleReset}
        className="p-1.5 rounded border border-border hover:bg-muted text-muted-foreground transition-colors bg-background"
        title="Reset Zoom"
        type="button"
      >
        <RefreshCw className="h-3.5 w-3.5" />
      </button>

      {!isCompact && (
        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded border border-border hover:bg-muted text-muted-foreground transition-colors bg-background flex items-center gap-1 text-xs font-medium px-2.5"
          title={isFullscreen ? "Close Fullscreen" : "Open Fullscreen"}
          type="button"
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="h-3.5 w-3.5" />
              <span>Minimize</span>
            </>
          ) : (
            <>
              <Maximize2 className="h-3.5 w-3.5" />
              <span>Fullscreen</span>
            </>
          )}
        </button>
      )}
    </div>
  );

  return (
    <>
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

          {/* Render regular zoom and fullscreen controls */}
          {renderControls(false)}
        </CardHeader>

        <CardContent className="p-4 md:p-6 bg-muted/5">
          {/* Main Card Scrollable Viewer */}
          <div className="relative w-full overflow-auto rounded-lg border border-border/40 bg-muted/20 p-4 max-h-[500px]">
            <div 
              onClick={toggleFullscreen}
              className="flex justify-center items-center min-w-full min-h-[300px] cursor-zoom-in group relative"
              title="Click to view full-screen"
            >
              {/* Hover Fullscreen Overlay Tip */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 rounded-md z-10">
                <div className="bg-background/90 text-foreground px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg border border-border">
                  <Maximize2 className="h-3.5 w-3.5 text-primary" />
                  <span>Click to Show Fullscreen</span>
                </div>
              </div>

              {/* Responsive Direct Width Rendered Images */}
              <img
                src={lightSrc}
                alt={`${title} (Light)`}
                style={{ width: `${zoom}%`, maxWidth: "none" }}
                className="block dark:hidden h-auto object-contain rounded-md transition-all duration-300"
              />
              <img
                src={darkSrc}
                alt={`${title} (Dark)`}
                style={{ width: `${zoom}%`, maxWidth: "none" }}
                className="hidden dark:block h-auto object-contain rounded-md transition-all duration-300"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Premium Full-Screen Modal Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md p-6 flex flex-col animate-in fade-in duration-200">
          {/* Full-Screen Top Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  Live Telemetry
                </span>
                <h2 className="text-lg font-bold tracking-tight text-foreground">{title}</h2>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>

            {/* Controls panel inside maximized modal */}
            <div className="flex items-center gap-3">
              {renderControls(true)}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-full border border-border hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 ml-2"
                title="Close"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Full-Screen Zoom/Pan Canvas */}
          <div className="flex-1 overflow-auto w-full p-6 border border-border/40 rounded-xl bg-muted/10 mt-6 flex justify-center items-center">
            <div className="min-w-full flex justify-center items-center">
              <img
                src={lightSrc}
                alt={`${title} (Light)`}
                style={{ width: `${zoom}%`, maxWidth: "none" }}
                className="block dark:hidden h-auto object-contain rounded-xl transition-all duration-300 shadow-2xl border border-border/50"
              />
              <img
                src={darkSrc}
                alt={`${title} (Dark)`}
                style={{ width: `${zoom}%`, maxWidth: "none" }}
                className="hidden dark:block h-auto object-contain rounded-xl transition-all duration-300 shadow-2xl border border-border/50"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
