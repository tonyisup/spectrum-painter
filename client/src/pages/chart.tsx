import { useState, useCallback, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RadialChart } from "@/components/RadialChart";
import { ColorPicker } from "@/components/ColorPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Eraser, Save, Download, Upload, Info } from "lucide-react";
import type { Chart, InsertChart } from "@shared/schema";

export default function ChartPage() {
  const [selectedColor, setSelectedColor] = useState("#6366F1");
  const [cellColors, setCellColors] = useState<Record<string, string>>({});
  const [userName, setUserName] = useState("");
  const [currentChartId, setCurrentChartId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const chartRef = useRef<HTMLDivElement>(null);

  // Load charts query
  const { data: charts = [] } = useQuery<Chart[]>({
    queryKey: ["/api/charts"],
  });

  // Save chart mutation
  const saveChartMutation = useMutation({
    mutationFn: async (data: InsertChart) => {
      const response = await apiRequest("POST", "/api/charts", data);
      return response.json();
    },
    onSuccess: (savedChart) => {
      queryClient.invalidateQueries({ queryKey: ["/api/charts"] });
      setCurrentChartId(savedChart.id);
      toast({
        title: "Chart saved successfully!",
        description: "Your ADHD spectrum chart has been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save chart. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update chart mutation
  const updateChartMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertChart> }) => {
      const response = await apiRequest("PATCH", `/api/charts/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/charts"] });
      toast({
        title: "Chart updated successfully!",
        description: "Your changes have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update chart. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCellClick = useCallback((ring: number, segment: number) => {
    const cellKey = `${ring}-${segment}`;
    setCellColors(prev => ({
      ...prev,
      [cellKey]: selectedColor
    }));
    
    // Auto-save to localStorage
    localStorage.setItem('adhdSpectrumChart', JSON.stringify({
      ...JSON.parse(localStorage.getItem('adhdSpectrumChart') || '{}'),
      cellColors: { ...cellColors, [cellKey]: selectedColor },
      userName
    }));
  }, [selectedColor, cellColors, userName]);

  const clearAllCells = useCallback(() => {
    if (confirm("Are you sure you want to clear all cells?")) {
      setCellColors({});
      localStorage.removeItem('adhdSpectrumChart');
      toast({
        title: "Chart cleared",
        description: "All cells have been cleared.",
      });
    }
  }, [toast]);

  const saveChart = useCallback(() => {
    if (!userName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name before saving.",
        variant: "destructive",
      });
      return;
    }

    const chartData: InsertChart = {
      name: userName,
      data: cellColors
    };

    if (currentChartId) {
      updateChartMutation.mutate({ id: currentChartId, data: chartData });
    } else {
      saveChartMutation.mutate(chartData);
    }
  }, [userName, cellColors, currentChartId, saveChartMutation, updateChartMutation, toast]);

  const loadChart = useCallback((chart: Chart) => {
    setCellColors(chart.data as Record<string, string>);
    setUserName(chart.name);
    setCurrentChartId(chart.id);
    toast({
      title: "Chart loaded",
      description: `Loaded chart for ${chart.name}`,
    });
  }, [toast]);

  const exportChart = useCallback(() => {
    if (!chartRef.current) return;
    
    const svg = chartRef.current.querySelector('svg');
    if (!svg) return;

    // Create a canvas to render the SVG
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      // Download the image
      canvas.toBlob((blob) => {
        if (blob) {
          const link = document.createElement('a');
          link.download = `adhd-spectrum-${userName || 'chart'}.png`;
          link.href = URL.createObjectURL(blob);
          link.click();
        }
      });
      
      URL.revokeObjectURL(url);
    };
    img.src = url;
    
    toast({
      title: "Exporting chart",
      description: "Your chart will be downloaded as an image.",
    });
  }, [userName, toast]);

  // Load from localStorage on mount
  useState(() => {
    const saved = localStorage.getItem('adhdSpectrumChart');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setCellColors(data.cellColors || {});
        setUserName(data.userName || "");
      } catch (error) {
        console.error("Failed to load saved chart data:", error);
      }
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Interactive ADHD Spectrum Chart</h1>
          <p className="text-gray-600 mt-1">Click on cells to color your personal spectrum</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Chart Container */}
          <div className="lg:col-span-2">
            <Card className="border border-gray-200">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <Input
                    type="text"
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="text-center border-b border-gray-300 focus:border-primary outline-none text-lg font-medium text-gray-700 bg-transparent border-0 border-b-2"
                    data-testid="input-username"
                  />
                </div>
                
                <div ref={chartRef}>
                  <RadialChart
                    selectedColor={selectedColor}
                    cellColors={cellColors}
                    onCellClick={handleCellClick}
                    userName={userName}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Control Panel */}
          <div className="space-y-6">
            
            {/* Color Picker */}
            <ColorPicker
              selectedColor={selectedColor}
              onColorChange={setSelectedColor}
            />
            
            {/* Actions Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={clearAllCells}
                  variant="destructive"
                  className="w-full"
                  data-testid="button-clear-all"
                >
                  <Eraser className="mr-2 h-4 w-4" />
                  Clear All
                </Button>
                
                <Button
                  onClick={saveChart}
                  className="w-full bg-green-500 hover:bg-green-600"
                  disabled={saveChartMutation.isPending || updateChartMutation.isPending}
                  data-testid="button-save-chart"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saveChartMutation.isPending || updateChartMutation.isPending ? "Saving..." : "Save Chart"}
                </Button>
                
                <Button
                  onClick={exportChart}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  data-testid="button-export-chart"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export as Image
                </Button>
              </CardContent>
            </Card>

            {/* Saved Charts */}
            {charts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Saved Charts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {charts.map((chart) => (
                    <Button
                      key={chart.id}
                      onClick={() => loadChart(chart)}
                      variant="outline"
                      className="w-full justify-start"
                      data-testid={`button-load-chart-${chart.id}`}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {chart.name}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            )}
            
            {/* Instructions Panel */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900 flex items-center">
                  <Info className="mr-2 h-5 w-5" />
                  How to Use
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    Select a color from the palette or use the custom picker
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    Click on any cell in the chart to fill it with your selected color
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    Use the actions panel to save, load, or export your chart
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    Your progress is automatically saved in your browser
                  </li>
                </ul>
              </CardContent>
            </Card>
            
          </div>
          
        </div>
      </div>
    </div>
  );
}
