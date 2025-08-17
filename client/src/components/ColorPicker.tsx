import { ColorPicker as BaseColorPicker } from "./ui/color-picker";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

export function ColorPicker({ selectedColor, onColorChange }: ColorPickerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pick Your Colors</CardTitle>
      </CardHeader>
      <CardContent>
        <BaseColorPicker
          color={selectedColor}
          onChange={onColorChange}
        />
        
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Color</h4>
          <div className="flex items-center space-x-3">
            <div 
              className="w-8 h-8 rounded border border-gray-300"
              style={{ backgroundColor: selectedColor }}
              data-testid="selected-color-display"
            />
            <span className="text-sm font-mono text-gray-600" data-testid="selected-color-code">
              {selectedColor}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
