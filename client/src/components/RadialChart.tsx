import { useState, useCallback, useRef } from "react";

interface CellData {
  ring: number;
  segment: number;
  color?: string;
}

interface RadialChartProps {
  selectedColor: string;
  cellColors: Record<string, string>;
  onCellClick: (ring: number, segment: number) => void;
  userName: string;
  rotation: number;
}

const TRAITS = [
  "Executive", "Special", "Organised", "Planning", "Hyperactivity",
  "Attention", "Interests", "Processing", "Impulsivity", "Emotional",
  "Working", "Memory", "Sensory", "Communication", "Social",
  "Routine", "Flexibility", "Stimming", "Meltdowns", "Masking"
];

export function RadialChart({ selectedColor, cellColors, onCellClick, userName, rotation }: RadialChartProps) {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  const numRings = 6;
  const numSegments = 20;
  const centerX = 300;
  const centerY = 300;
  const maxRadius = 200;
  
  const getCellKey = (ring: number, segment: number) => `${ring}-${segment}`;
  
  const getCellPosition = useCallback((ring: number, segment: number) => {
    const angle = (segment * (360 / numSegments)) * (Math.PI / 180) - Math.PI / 2;
    const innerRadius = (ring - 1) * (maxRadius / numRings);
    const outerRadius = ring * (maxRadius / numRings);
    const midRadius = (innerRadius + outerRadius) / 2;
    
    const x = centerX + Math.cos(angle) * midRadius;
    const y = centerY + Math.sin(angle) * midRadius;
    
    return { x, y, innerRadius, outerRadius, angle };
  }, []);
  
  const createCellPath = useCallback((ring: number, segment: number) => {
    const startAngle = (segment * (360 / numSegments)) * (Math.PI / 180) - Math.PI / 2;
    const endAngle = ((segment + 1) * (360 / numSegments)) * (Math.PI / 180) - Math.PI / 2;
    const innerRadius = (ring - 1) * (maxRadius / numRings);
    const outerRadius = ring * (maxRadius / numRings);
    
    const x1 = centerX + Math.cos(startAngle) * innerRadius;
    const y1 = centerY + Math.sin(startAngle) * innerRadius;
    const x2 = centerX + Math.cos(endAngle) * innerRadius;
    const y2 = centerY + Math.sin(endAngle) * innerRadius;
    const x3 = centerX + Math.cos(endAngle) * outerRadius;
    const y3 = centerY + Math.sin(endAngle) * outerRadius;
    const x4 = centerX + Math.cos(startAngle) * outerRadius;
    const y4 = centerY + Math.sin(startAngle) * outerRadius;
    
    const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";
    
    return `
      M ${x1} ${y1}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}
      Z
    `;
  }, []);
  
  const getLabelPosition = useCallback((index: number) => {
    const angle = (index * (360 / TRAITS.length)) * (Math.PI / 180) - Math.PI / 2;
    const labelRadius = maxRadius + 40;
    const x = centerX + Math.cos(angle) * labelRadius;
    const y = centerY + Math.sin(angle) * labelRadius;
    
    return { x, y, angle: angle + Math.PI / 2 };
  }, []);
  
  const handleCellClick = (ring: number, segment: number) => {
    onCellClick(ring, segment);
  };
  
  const handleCellMouseEnter = (ring: number, segment: number) => {
    setHoveredCell(getCellKey(ring, segment));
  };
  
  const handleCellMouseLeave = () => {
    setHoveredCell(null);
  };
  
  return (
    <div className="flex flex-col items-center space-y-8">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-primary mb-2">MY ADHD SPECTRUM</h2>
        <div className="text-lg font-medium text-gray-700">{userName || "Your Name"}</div>
      </div>
      
      <div className="relative">
        <svg
          ref={svgRef}
          width="600"
          height="600"
          viewBox="0 0 600 600"
          className="max-w-full h-auto transition-all duration-300"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* Grid circles */}
          {Array.from({ length: numRings }, (_, ring) => (
            <circle
              key={`circle-${ring}`}
              cx={centerX}
              cy={centerY}
              r={(ring + 1) * (maxRadius / numRings)}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          ))}
          
          {/* Grid lines */}
          {Array.from({ length: numSegments }, (_, segment) => {
            const angle = (segment * (360 / numSegments)) * (Math.PI / 180) - Math.PI / 2;
            const x = centerX + Math.cos(angle) * maxRadius;
            const y = centerY + Math.sin(angle) * maxRadius;
            
            return (
              <line
                key={`line-${segment}`}
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                stroke="#E5E7EB"
                strokeWidth="1"
              />
            );
          })}
          
          {/* Interactive cells */}
          {Array.from({ length: numRings }, (_, ring) =>
            Array.from({ length: numSegments }, (_, segment) => {
              const cellKey = getCellKey(ring + 1, segment);
              const cellColor = cellColors[cellKey];
              const isHovered = hoveredCell === cellKey;
              
              return (
                <path
                  key={cellKey}
                  d={createCellPath(ring + 1, segment)}
                  fill={cellColor || "transparent"}
                  stroke={isHovered ? "#6366F1" : cellColor ? "rgba(0,0,0,0.1)" : "transparent"}
                  strokeWidth={isHovered ? "2" : "1"}
                  className="cursor-pointer transition-all duration-200"
                  style={{
                    transform: isHovered ? "scale(1.02)" : "scale(1)",
                    transformOrigin: `${centerX}px ${centerY}px`,
                  }}
                  onClick={() => handleCellClick(ring + 1, segment)}
                  onMouseEnter={() => handleCellMouseEnter(ring + 1, segment)}
                  onMouseLeave={handleCellMouseLeave}
                  data-testid={`cell-${ring + 1}-${segment}`}
                />
              );
            })
          )}
          
          {/* Trait labels */}
          {TRAITS.map((trait, index) => {
            const { x, y, angle } = getLabelPosition(index);
            
            return (
              <text
                key={`label-${index}`}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-sm font-medium fill-gray-700 select-none"
                transform={`rotate(${(angle * 180) / Math.PI}, ${x}, ${y})`}
                data-testid={`trait-label-${index}`}
              >
                {trait}
              </text>
            );
          })}
        </svg>
        
        {/* Legend */}
        <div className="flex justify-center items-center space-x-8 mt-8">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-blue-400 rounded-full mb-2 mx-auto bg-blue-50" />
            <span className="text-sm font-medium text-gray-700">Autism</span>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-purple-400 rounded-full mb-2 mx-auto bg-purple-50" />
            <span className="text-sm font-medium text-gray-700">Both</span>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-green-400 rounded-full mb-2 mx-auto bg-green-50" />
            <span className="text-sm font-medium text-gray-700">ADHD</span>
          </div>
        </div>
      </div>
    </div>
  );
}
