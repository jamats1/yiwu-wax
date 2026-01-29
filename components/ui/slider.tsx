"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
  value?: number[];
  onValueChange?: (value: number[]) => void;
  onValueCommit?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export function Slider({
  value = [0, 100],
  onValueChange,
  onValueCommit,
  min = 0,
  max = 100,
  step = 1,
  className,
}: SliderProps) {
  const [localValue, setLocalValue] = React.useState(value);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newValue = [...localValue];
    newValue[index] = Number(e.target.value);
    setLocalValue(newValue);
    onValueChange?.(newValue);
  };

  const handleMouseUp = () => {
    onValueCommit?.(localValue);
  };

  // Calculate percentage positions for styling
  const minPercent = ((localValue[0] - min) / (max - min)) * 100;
  const maxPercent = localValue.length > 1 ? ((localValue[1] - min) / (max - min)) * 100 : 100;

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative h-2 w-full">
        {/* Track background */}
        <div className="absolute h-2 w-full rounded-lg bg-gray-200" />
        {/* Active range */}
        <div
          className="absolute h-2 rounded-lg bg-primary"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />
        {/* Min handle */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[0]}
          onChange={(e) => handleChange(e, 0)}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
          className="absolute top-0 h-2 w-full cursor-pointer appearance-none bg-transparent"
          style={{
            zIndex: localValue[0] > (localValue[1] || max) ? 3 : 2,
            accentColor: "#286F3E",
          }}
        />
        {/* Max handle */}
        {localValue.length > 1 && (
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={localValue[1]}
            onChange={(e) => handleChange(e, 1)}
            onMouseUp={handleMouseUp}
            onTouchEnd={handleMouseUp}
            className="absolute top-0 h-2 w-full cursor-pointer appearance-none bg-transparent"
            style={{
              zIndex: localValue[1] > localValue[0] ? 3 : 2,
              accentColor: "#286F3E",
            }}
          />
        )}
      </div>
    </div>
  );
}
