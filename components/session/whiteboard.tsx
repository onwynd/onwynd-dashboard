"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Eraser, Trash2, Minus, Plus, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = [
  "#111827", // near-black
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#ffffff", // white (eraser visually)
];

export function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState("#111827");
  const [size, setSize] = useState(3);
  const [erasing, setErasing] = useState(false);

  // Resize canvas to fill container
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const imageData = canvas.getContext("2d")?.getImageData(0, 0, canvas.width, canvas.height);
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (imageData) ctx.putImageData(imageData, 0, 0);
  }, []);

  useEffect(() => {
    resizeCanvas();
    const observer = new ResizeObserver(resizeCanvas);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [resizeCanvas]);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const touch = e.touches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    setDrawing(true);
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const { x, y } = getPos(e);
    ctx.globalCompositeOperation = erasing ? "destination-out" : "source-over";
    ctx.strokeStyle = erasing ? "rgba(0,0,0,1)" : color;
    ctx.lineWidth = erasing ? size * 4 : size;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDraw = () => setDrawing(false);

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const decreaseSize = () => setSize((s) => Math.max(1, s - 1));
  const increaseSize = () => setSize((s) => Math.min(24, s + 1));

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 px-4 pt-4">
        {/* Color swatches */}
        <div className="flex items-center gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c}
              title={c}
              onClick={() => { setColor(c); setErasing(false); }}
              className={cn(
                "size-6 rounded-full border-2 transition-transform hover:scale-110",
                color === c && !erasing ? "border-primary scale-110 shadow-md" : "border-transparent"
              )}
              style={{ backgroundColor: c, outline: c === "#ffffff" ? "1px solid #e5e7eb" : undefined }}
            />
          ))}
        </div>

        <div className="w-px h-5 bg-border" />

        {/* Brush size */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={decreaseSize}
            title="Decrease brush size"
          >
            <Minus className="size-3" />
          </Button>
          <div className="flex items-center justify-center w-8">
            <div
              className="rounded-full bg-foreground transition-all"
              style={{ width: size * 2, height: size * 2, maxWidth: 24, maxHeight: 24 }}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={increaseSize}
            title="Increase brush size"
          >
            <Plus className="size-3" />
          </Button>
        </div>

        <div className="w-px h-5 bg-border" />

        {/* Tools */}
        <Button
          variant={!erasing ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setErasing(false)}
          className="gap-1.5 h-7 text-xs"
        >
          <Pencil className="size-3" />
          Draw
        </Button>
        <Button
          variant={erasing ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setErasing(true)}
          className="gap-1.5 h-7 text-xs"
        >
          <Eraser className="size-3" />
          Erase
        </Button>

        <div className="ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={clear}
            className="gap-1.5 h-7 text-xs text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            <Trash2 className="size-3" />
            Clear
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="mx-4 mb-4 rounded-lg border bg-white overflow-hidden"
        style={{ height: 360, cursor: erasing ? "cell" : "crosshair" }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
          className="touch-none w-full h-full"
        />
      </div>
    </div>
  );
}
