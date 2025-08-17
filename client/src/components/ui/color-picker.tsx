import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  presets?: string[];
}

export function ColorPicker({ color, onChange, presets }: ColorPickerProps) {
  const [inputColor, setInputColor] = useState(color);

  const defaultPresets = [
    "#EF4444", "#F97316", "#F59E0B", "#EAB308",
    "#84CC16", "#22C55E", "#10B981", "#14B8A6",
    "#06B6D4", "#0EA5E9", "#3B82F6", "#6366F1",
    "#8B5CF6", "#A855F7", "#C026D3", "#EC4899",
    "#F43F5E", "#64748B", "#374151", "#000000"
  ];

  const colorPresets = presets || defaultPresets;

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Preset Colors</h4>
        <div className="grid grid-cols-4 gap-3">
          {colorPresets.map((presetColor) => (
            <button
              key={presetColor}
              className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${
                color === presetColor 
                  ? "border-primary shadow-md shadow-primary/30" 
                  : "border-gray-300 hover:border-primary"
              }`}
              style={{ backgroundColor: presetColor }}
              onClick={() => onChange(presetColor)}
              data-testid={`color-preset-${presetColor}`}
            />
          ))}
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Custom Color</h4>
        <div className="flex items-center space-x-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline" 
                className="w-12 h-12 p-0 border-2"
                style={{ backgroundColor: color }}
                data-testid="custom-color-trigger"
              >
                <span className="sr-only">Pick a color</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <input
                type="color"
                value={inputColor}
                onChange={(e) => {
                  setInputColor(e.target.value);
                  onChange(e.target.value);
                }}
                className="w-full h-32 rounded border cursor-pointer"
                data-testid="color-picker-input"
              />
            </PopoverContent>
          </Popover>
          
          <div className="flex-1">
            <Input
              type="text"
              value={inputColor}
              onChange={(e) => setInputColor(e.target.value)}
              onBlur={() => {
                if (/^#[0-9A-Fa-f]{6}$/.test(inputColor)) {
                  onChange(inputColor);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && /^#[0-9A-Fa-f]{6}$/.test(inputColor)) {
                  onChange(inputColor);
                }
              }}
              placeholder="#000000"
              className="font-mono text-sm"
              data-testid="color-hex-input"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
